import { BN } from "@polkadot/util";
import { BN0 } from "@src/constants/assets";
import { AptosAccount, BCS, TxnBuilderTypes } from "aptos";
import { sha3_256 } from "@noble/hashes/sha3";
import fetch from "cross-fetch";
import { Buffer } from "buffer";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { transformAmountStringToBN } from "@src/utils/assets";

const {
  AccountAddress,
  EntryFunction,
  TransactionPayloadEntryFunction,
  RawTransaction,
  ChainId,
  TransactionAuthenticatorEd25519,
  Ed25519PublicKey,
  Ed25519Signature,
  SignedTransaction,
  ModuleId,
  Identifier,
} = TxnBuilderTypes;

const RPC = "http://rpc.openlibra.blockcoders.io:8080/v1";

export class OlProvider {
  private client: Aptos;

  constructor(rpc: string = RPC) {
    const config = new AptosConfig({
      network: Network.CUSTOM,
      indexer: rpc,
      fullnode: rpc,
      client: {
        async provider(requestOptions) {
          const { params, method, url, headers, body } = requestOptions;

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          const customHeaders = {
            ...headers,
            customClient: true,
          };

          const request = {
            headers: customHeaders,
            body,
            method,
          };

          let path = url;
          if (params) {
            path = `${url}?${params}`;
          }

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const response = await fetch(path, request);

          const data = await response.json();

          return {
            status: response.status,
            statusText: response.statusText,
            data,
            headers: response.headers,
            config: response,
            request,
          };
        },
      },
    });

    this.client = new Aptos(config);
  }

  async getBalance(address: string) {
    try {
      const response = await this.client.getAccountResource({
        accountAddress: address,
        resourceType: "0x1::coin::CoinStore<0x1::libra_coin::LibraCoin>",
      });

      const amount = response?.coin.value;

      return new BN(amount);
    } catch (error) {
      return BN0;
    }
  }

  async getFees() {
    try {
      const { gas_estimate, deprioritized_gas_estimate } =
        await this.client.getGasPriceEstimation();

      return new BN(gas_estimate * (deprioritized_gas_estimate || 1));
    } catch (error) {
      return "0";
    }
  }

  async transfer({
    pk,
    sender,
    amount,
    recipient,
  }: {
    pk: string;
    sender: string;
    recipient: string;
    amount: string;
  }) {
    const entryFunctionPayload = new TransactionPayloadEntryFunction(
      new EntryFunction(
        ModuleId.fromStr("0x1::ol_account"),
        new Identifier("transfer"),
        [],
        [
          Buffer.from(recipient, "hex"),
          BCS.bcsSerializeUint64(Number(transformAmountStringToBN(amount, 6))),
        ]
      )
    );

    const maxGasUnit = 2000000;
    const gasPrice = 200;
    const timeout = 10;

    const account = await this.client.getAccountInfo({
      accountAddress: sender,
    });

    const rawTxn = new RawTransaction(
      // Transaction sender account address
      AccountAddress.fromHex(sender),

      BigInt(account.sequence_number),
      entryFunctionPayload,
      // Max gas unit to spend
      BigInt(maxGasUnit),
      // Gas price per unit
      BigInt(gasPrice),
      // Expiration timestamp. Transaction is discarded if it is not executed within 10 seconds from now.
      BigInt(Math.floor(Date.now() / 1_000) + timeout),
      new ChainId(1)
    );

    const privateKey = Buffer.from(pk, "hex");

    const signer = new AptosAccount(privateKey!);

    const hash = sha3_256.create();
    hash.update("DIEM::RawTransaction");

    const prefix = hash.digest();
    const body = BCS.bcsToBytes(rawTxn);
    const mergedArray = new Uint8Array(prefix.length + body.length);
    mergedArray.set(prefix);
    mergedArray.set(body, prefix.length);

    const signingMessage = mergedArray;

    const signature = signer.signBuffer(signingMessage);
    const sig = new Ed25519Signature(signature.toUint8Array());

    const authenticator = new TransactionAuthenticatorEd25519(
      new Ed25519PublicKey(signer.pubKey().toUint8Array()),
      sig
    );
    const signedTx = new SignedTransaction(rawTxn, authenticator);

    const bcsTxn = BCS.bcsToBytes(signedTx);

    const data = await fetch(`${RPC}/transactions`, {
      method: "POST",
      headers: {
        "content-type": "application/x.diem.signed_transaction+bcs",
      },
      body: bcsTxn,
    });

    const res = await data.json();

    if (data.status === 202) {
      const result = await this.client.waitForTransaction({
        transactionHash: res.hash,
        options: {
          checkSuccess: true,
          waitForIndexer: true,
          // timeoutSecs: 60,
        },
      });

      const block = await this.client.getBlockByVersion({
        ledgerVersion: Number(result.version),
        options: {
          withTransactions: false,
        },
      });

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const fee = Number(result.gas_used) * Number(result.gas_unit_price);

      return {
        version: result.version,
        hash: res.hash,
        fee: fee.toString(),
        success: result.success,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        timestamp: result.timestamp,
        blockNumber: Number(block.block_height),
      };
    } else {
      throw new Error(res.message);
    }
  }

  async healthCheck() {
    try {
      const response = await fetch(`${RPC}/-/healthy`).then((res) =>
        res.json()
      );

      return response?.message === "diem-node:ok";
    } catch (error) {
      return false;
    }
  }
}

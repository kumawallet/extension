import { SubmittableExtrinsic } from "@polkadot/api/types";
import { BN } from "@polkadot/util";
import { utils, providers, Wallet, BigNumber } from "ethers";
import { AccountType } from "./accounts/types";
import { Asset } from "./pages";
import { Chain } from "./storage/entities/Chains";

export type polkadotExtrinsic =
  | SubmittableExtrinsic<"promise">
  | ContractTx<"promise">;

export type evmTx = utils.Deferrable<providers.TransactionRequest>;

export type WasmFee = {
  "estimated fee": BN;
  "estimated total": BN;
};

export type EVMFee = {
  "gas limit": BigNumber;
  "max fee per gas": BigNumber;
  // "max base fee per gas": BigNumber;
  "max priority fee per gas": BigNumber;
  "estimated fee": BigNumber;
  "estimated total": BigNumber;
};

export type Tx =
  | {
      type: AccountType.WASM;
      tx: polkadotExtrinsic;
      aditional: object;
      sender: KeyringPair;
      fee: WasmFee;
    }
  | {
      type: AccountType.EVM;
      tx: evmTx;
      aditional?: object;
      sender: Wallet;
      fee: EVMFee;
    };

export type confirmTx = ({ type, tx, aditional, fee }: Tx) => void;

export interface SendForm {
  from: Chain;
  to: Chain;
  destinationAccount: string;
  amount: number;
  asset: Asset;
}

export interface TxToProcess {
  amount: number;
  originAddress: string;
  destinationAddress: string;
  rpc: string;
  originNetwork: string;
  destinationNetwork: string;
  networkInfo: Chain;
  asset: Asset & { id: string; color: string };
  rpc: string;
  tx: {
    txHash: string;
    aditional?: Record<string, unknown>;
    type: AccountType;
  };
}

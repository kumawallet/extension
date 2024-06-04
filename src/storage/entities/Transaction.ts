import { SubmittableExtrinsic } from "@polkadot/api/types";
import { Chain, ChainType } from "@src/types";
import { BehaviorSubject } from "rxjs";
import { api } from "./Provider";
import { ApiPromise } from "@polkadot/api";
import { XCM_MAPPING } from "@src/xcm/extrinsics";
import { transformAmountStringToBN } from "@src/utils/assets";
import { MapResponseEVM, MapResponseXCM } from "@src/xcm/interfaces";
import { KeyringPair } from "@polkadot/keyring/types";
import { BigNumberish, Contract, Wallet, providers } from "ethers";
import erc20Abi from "@src/constants/erc20.abi.json";
import { OlProvider } from "@src/services/ol/OlProvider";

export interface Tx {
  amount: string;
  senderAddress: string;
  destinationAddress: string;
  originNetwork: Chain | null;
  targetNetwork: Chain | null;
  asset: {
    id: string;
    symbol: string;
    decimals: number;
    balance: string;
    address?: string | undefined;
  } | null;
  provider: api | null;
  signer: unknown;
  // evmTx?: providers.TransactionRequest;
  // extrinsicHash?: SubmittableExtrinsic<"promise"> | unknown;
}

export class Transaction {
  tx = new BehaviorSubject({
    amount: "",
    destinationAddress: "",
    senderAddress: "",
    originNetwork: null,
    targetNetwork: null,
    asset: null,
    provider: null,
    signer: null,
    tip: "0",
  } as Tx);

  tip = "0";
  isSwap = false;
  evmTx?: providers.TransactionRequest | null = null;
  substrateTx?: SubmittableExtrinsic<"promise"> | null = null;

  updateTx(tx: Tx) {
    this.tx.next(tx);
  }

  async handleWasmTx() {
    const {
      amount,
      asset,
      destinationAddress: recipient,
      originNetwork,
      targetNetwork,
      signer,
    } = this.tx.getValue();

    const provider = this.tx.getValue().provider!.provider as ApiPromise;

    const isXCM = originNetwork!.id !== targetNetwork!.id;
    const isNativeAsset = asset!.symbol === originNetwork!.symbol;

    let extrinsic: SubmittableExtrinsic<"promise"> | unknown;
    const bnAmount = transformAmountStringToBN(amount, asset!.decimals);

    if (isXCM) {
      const query = provider.query;
      const xcmPallet = query.polkadotXcm || query.xcmPallet;
      const xcmPalletVersion = await xcmPallet.palletVersion();

      const { method, pallet, extrinsicValues } = XCM_MAPPING[
        originNetwork!.id
      ][targetNetwork!.id]({
        address: recipient,
        amount: bnAmount,
        assetSymbol: asset!.symbol,
        xcmPalletVersion: xcmPalletVersion.toString(),
      }) as MapResponseXCM;

      extrinsic = (provider as ApiPromise).tx[pallet][method](
        ...Object.keys(extrinsicValues)
          .filter(
            (key) =>
              extrinsicValues[
                key as
                  | "dest"
                  | "beneficiary"
                  | "assets"
                  | "feeAssetItem"
                  | "currencyId"
                  | "amount"
                  | "destWeightLimit"
              ] !== null
          )
          .map(
            (key) =>
              extrinsicValues[
                key as
                  | "dest"
                  | "beneficiary"
                  | "assets"
                  | "feeAssetItem"
                  | "currencyId"
                  | "amount"
                  | "destWeightLimit"
              ]
          )
      );
    } else if (isNativeAsset) {
      // native asset transfer
      extrinsic = (provider as ApiPromise).tx.balances.transferAllowDeath(
        recipient,
        bnAmount
      );
    } else {
      extrinsic = (provider as ApiPromise).tx.assets.transfer(
        asset!.id,
        recipient,
        bnAmount
      );
    }

    const { partialFee } = await (
      extrinsic as SubmittableExtrinsic<"promise">
    ).paymentInfo(signer as KeyringPair);

    const estimatedFee = partialFee.toString();

    this.substrateTx = extrinsic as SubmittableExtrinsic<"promise">;

    return estimatedFee;
  }

  async handleEvmTx() {
    const {
      amount,
      asset,
      senderAddress: sender,
      destinationAddress: recipient,
      originNetwork,
      targetNetwork,
      signer,
    } = this.tx.getValue();

    const provider = this.tx.getValue().provider!
      .provider as providers.JsonRpcProvider;

    const isXCM = originNetwork!.id !== targetNetwork!.id;
    const isNativeAsset = asset!.symbol === originNetwork!.symbol;

    const bnAmount = transformAmountStringToBN(amount, asset!.decimals);
    let estimatedFee = "0";

    const partialTx = {
      from: sender,
      to: recipient,
      value: bnAmount.toString(),
    };

    if (isXCM) {
      const { method, abi, contractAddress, extrinsicValues } = XCM_MAPPING[
        originNetwork!.id
      ][targetNetwork!.id]({
        address: recipient,
        amount: bnAmount,
        assetSymbol: asset!.symbol,
        xcmPalletVersion: "",
      }) as MapResponseEVM;

      const contract = new Contract(
        contractAddress,
        abi as string,
        signer as Wallet
      );

      const [feeData, gasLimit] = await Promise.all([
        provider.getFeeData(),
        contract.estimateGas?.[method](
          ...Object.keys(extrinsicValues).map(
            (key) =>
              extrinsicValues[
                key as "currency_address" | "amount" | "destination" | "weight"
              ]
          )
        ),
      ]);

      estimatedFee =
        feeData.maxFeePerGas
          ?.mul(gasLimit)
          .add(feeData.maxPriorityFeePerGas!)
          ?.toString() || "0";

      const evmTx = await contract.populateTransaction?.[method](
        ...Object.keys(extrinsicValues).map(
          (key) =>
            extrinsicValues[
              key as "currency_address" | "amount" | "destination" | "weight"
            ]
        )
      );

      this.evmTx = evmTx;
    } else if (isNativeAsset) {
      const [feeData, gasLimit] = await Promise.all([
        (provider as providers.JsonRpcProvider).getFeeData(),
        (provider as providers.JsonRpcProvider).estimateGas(partialTx),
      ]);

      estimatedFee =
        feeData.maxFeePerGas
          ?.mul(gasLimit)
          .add(feeData.maxPriorityFeePerGas!)
          ?.toString() || "0";

      const evmTx = {
        ...partialTx,
        gasLimit,
        maxFeePerGas: feeData.maxFeePerGas as unknown as BigNumberish,
        maxPriorityFeePerGas:
          feeData.maxPriorityFeePerGas as unknown as BigNumberish,
        type: 2,
      };

      this.evmTx = evmTx;
    } else if (asset!.address) {
      const contract = new Contract(asset!.address, erc20Abi, signer as Wallet);

      const [feeData, gasLimit] = await Promise.all([
        (provider as providers.JsonRpcProvider).getFeeData(),
        contract.estimateGas.transfer(partialTx.to, partialTx.value),
      ]);

      estimatedFee =
        feeData.maxFeePerGas
          ?.mul(gasLimit)
          .add(feeData.maxPriorityFeePerGas!)
          ?.toString() || "0";

      const evmTx = await contract.populateTransaction.transfer(
        partialTx.to,
        partialTx.value,
        {
          gasLimit,
          maxFeePerGas: feeData.maxFeePerGas as unknown as BigNumberish,
          maxPriorityFeePerGas:
            feeData.maxPriorityFeePerGas as unknown as BigNumberish,
        }
      );

      this.evmTx = evmTx;
    }

    return estimatedFee;
  }

  async handleOlTx() {
    const provider = this.tx.getValue().provider!.provider as OlProvider;

    return provider.getFees();
  }

  async getFee() {
    const originNetwork = this.tx.getValue().originNetwork;

    if (originNetwork?.type === ChainType.WASM) {
      return this.handleWasmTx().catch((error) => {
        console.error("getWasmFee error:", error);
        return "0";
      });
    } else if (originNetwork?.type === ChainType.EVM) {
      return this.handleEvmTx().catch((error) => {
        console.error("handleEvmTx error:", error);
        return "0";
      });
    } else if (originNetwork?.type === ChainType.OL) {
      return this.handleOlTx().catch((error) => {
        console.error("ol error:", error);
        return "0";
      });
    }

    return "0";
  }

  clear() {
    this.tx.next({
      amount: "",
      destinationAddress: "",
      senderAddress: "",
      originNetwork: null,
      targetNetwork: null,
      asset: null,
      provider: null,
      signer: null,
    });
    this.evmTx = null;
    this.substrateTx = null;
  }
}

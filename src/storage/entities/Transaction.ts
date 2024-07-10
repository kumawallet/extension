import { SubmittableExtrinsic } from "@polkadot/api/types";
import { Chain, ChainType } from "@src/types";
import { BehaviorSubject } from "rxjs";
import { api } from "./Provider";
import { ApiPromise } from "@polkadot/api";
import { XCM_MAPPING } from "@src/xcm/extrinsics";
import { transformAmountStringToBN } from "@src/utils/assets";
import { MapResponseEVM, MapResponseXCM } from "@src/xcm/interfaces";
import { KeyringPair } from "@polkadot/keyring/types";
import {
  BigNumberish,
  Contract,
  JsonRpcProvider,
  TransactionRequest,
  Wallet,
} from "ethers";
import erc20Abi from "@src/constants/erc20.abi.json";
import { OlProvider } from "@src/services/ol/OlProvider";
import { getEVMFee } from "@src/utils/transfer";
import erc721  from "@src/constants/erc721_abi.json"

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

export interface TxNFT {
  tokenId: string;
  senderAddress: string;
  destinationAddress: string;
  originNetwork: Chain | null;
  targetNetwork: Chain | null;
  contractAddress: string;
  name: string;
  provider: api | null;
  signer: unknown;
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
  } as Tx );

  public txNFT = new BehaviorSubject({
    tokenId: "",
    destinationAddress: "",
    senderAddress: "",
    originNetwork: null,
    targetNetwork: null,
    contractAddress: "",
    name: "",
    provider: null,
    signer: null,
    tip: "0",
  } as TxNFT );
  

  tip = "0";
  isSwap = false;
  evmTx?: TransactionRequest | null = null;
  substrateTx?: SubmittableExtrinsic<"promise"> | null = null;

  evmTxNFT ? : TransactionRequest | null =null;


  updateTx(tx: Tx) {
    this.tx.next(tx);
  }
  updateTxNFT(tx: TxNFT){
    this.txNFT.next(tx);
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

  async handleEvmTxNFT() {
      try{
        const {
          tokenId,
          senderAddress,
          destinationAddress,
          contractAddress,
          provider,
        } =this.txNFT.getValue();
      const contract = new Contract(contractAddress,erc721,(provider?.provider as JsonRpcProvider))
      const [feeData, gasLimit] = await Promise.all([
          (provider?.provider as JsonRpcProvider).getFeeData(),
          contract.safeTransferFrom.estimateGas(senderAddress, destinationAddress, tokenId)
        ]);
        const estimatedFee = getEVMFee({
          feeData,
          gasLimit,
        }).toString();
      const evmTxNFT = await contract.safeTransferFrom.populateTransaction(senderAddress, destinationAddress, tokenId);
      this.evmTxNFT = evmTxNFT;
      return estimatedFee
  }
  catch(error){
    console.log("Error handleEvmTxNFT: ", error);
    throw error
      
  }

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

    const provider = this.tx.getValue().provider!.provider as JsonRpcProvider;

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
        contract[method]?.estimateGas(
          ...Object.keys(extrinsicValues).map(
            (key) =>
              extrinsicValues[
                key as "currency_address" | "amount" | "destination" | "weight"
              ]
          )
        ),
      ]);

      estimatedFee = getEVMFee({
        feeData,
        gasLimit,
      }).toString();

      const evmTx = await contract[method]?.populateTransaction?.(
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
        (provider as JsonRpcProvider).getFeeData(),
        (provider as JsonRpcProvider).estimateGas(partialTx),
      ]);

      estimatedFee = getEVMFee({
        feeData,
        gasLimit,
      }).toString();

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
        (provider as JsonRpcProvider).getFeeData(),
        contract.transfer.estimateGas(partialTx.to, partialTx.value),
      ]);

      estimatedFee = getEVMFee({
        feeData,
        gasLimit,
      }).toString();

      const evmTx = await contract.transfer.populateTransaction(
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

  async getFeeNFT() {
    const {provider} = this.txNFT.getValue();
    switch(provider?.type){
    case ChainType.WASM:{
      return "0";
    } 
    case ChainType.EVM: {
      return this.handleEvmTxNFT().catch((error) => {
        console.error("handleEvmTxNFT error:", error);
        return "0";
      });
    }
    default:
    return "0";
  }
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

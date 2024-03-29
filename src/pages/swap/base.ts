import { ApiPromise } from "@polkadot/api";
import {
  ACALA,
  ASTAR,
  BINANCE,
  ETHEREUM,
  KUSAMA,
  MOONBEAM,
  MOONRIVER,
  POLKADOT,
  POLYGON,
  SHIDEN,
} from "@src/constants/chains";
import { ethers } from "ethers";

export interface SwapAsset {
  symbol: string;
  label: string;
  image: string;
  id: string;
  balance: string;
  decimals: number;
  network: string;
  name: string;
  address?: string;
}

export interface ActiveSwaps {
  addressFrom: string;
  addressTo: string;
  amountFrom: string;
  amountTo: string;
  currencyFrom: string;
  currencyTo: string;
  iconFrom: string | null;
  iconTo: string | null;
  id: string;
  status: string;
}

export interface InitProps {
  chainName: string;
  nativeCurrency: string;
  api: ApiPromise | ethers.providers.JsonRpcProvider;
}

export abstract class Swapper {
  swap_info: string | undefined;
  protocol: string = "";
  type: string | undefined;

  abstract init(props: InitProps): Promise<{
    nativeAssets: SwapAsset[];
    pairs: SwapAsset[];
  }>;

  abstract canChangeSetAssetToSell(): boolean;

  abstract showRecipentAddressFormat(): boolean;

  abstract getEstimatedAmount(props: {
    from: string;
    to: string;
    amount: string;
  }): Promise<{
    estimatedAmount: string;
    minAmount: string;
  }>;

  abstract getActiveSwaps(): Promise<ActiveSwaps[]>;

  abstract createSwap(props: {
    addressFrom?: string;
    addressTo: string;
    amountFrom: string;
    currencyFrom: string;
    currencyTo: string;
    currencyDecimals: number;
    nativeAsset: {
      symbol: string;
      decimals: number;
    };
    assetToSell: {
      symbol: string;
      decimals: number;
    };
  }): Promise<{
    fee: {
      estimatedFee: string;
      estimatedTotal: string;
    };
    destination: string;
    id: string;
  }>;

  abstract confirmTx(props: {
    assetToTransfer: {
      id: string;
      decimals: number;
      address: string;
    };
    amount: string;
    destinationAccount: string;
  }): Promise<{
    txHash: string;
    type: string;
  }>;

  abstract getPairs(asset: string): Promise<SwapAsset[]>;

  abstract mustConfirmTx(): boolean;

  abstract saveSwapInStorage(swapId: string): void;
}

export const SUPPORTED_CHAINS_FOR_SWAP = {
  wasm: [POLKADOT.name, ASTAR.name, ACALA.name, KUSAMA.name, SHIDEN.name],
  evm: [
    MOONBEAM.name,
    MOONRIVER.name,
    ETHEREUM.name,
    POLYGON.name,
    BINANCE.name,
  ],
};

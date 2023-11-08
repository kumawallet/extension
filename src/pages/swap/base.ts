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
  protocol: string | undefined;

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
    addressTo: string;
    amountFrom: string;
    currencyFrom: string;
    currencyTo: string;
    currencyDecimals: number;
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

  abstract mustConfirmTx(): boolean;

  abstract saveSwapInStorage(swapId: string): void;
}

export const SUPPORTED_CHAINS_FOR_SWAP = [
  POLKADOT.name,
  ASTAR.name,
  MOONBEAM.name,
  ACALA.name,
  KUSAMA.name,
  ETHEREUM.name,
  POLYGON.name,
  BINANCE.name,
  MOONRIVER.name,
  SHIDEN.name,
];

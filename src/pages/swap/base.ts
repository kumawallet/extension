import { ApiPromise } from "@polkadot/api";
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
  }): Promise<{
    fee: {
      estimatedFee: string;
      estimatedTotal: string;
    };
    destination: string;
  }>;

  abstract mustConfirmTx(): boolean;
}

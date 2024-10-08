import { SubmittableExtrinsic } from "@polkadot/api/types";
import { BN } from "@polkadot/util";
import { Wallet, JsonRpcProvider, TransactionRequest } from "ethers";
import { AccountType } from "./accounts/types";
import { ContractPromise } from "@polkadot/api-contract";
import { ApiPromise } from "@polkadot/api";
import { OlProvider } from "./services/ol/OlProvider";

export type polkadotExtrinsic = SubmittableExtrinsic<"promise">;

export type evmTx = TransactionRequest;

export type WasmFee = {
  estimatedFee: BN;
  estimatedTotal: BN;
};

export type Provider = JsonRpcProvider | ApiPromise | OlProvider;

export type API = {
  [id: string]: Provider;
};

export type EVMFee = {
  gasLimit: bigint;
  "max fee per gas": bigint;
  "max priority fee per gas": bigint;
  estimatedFee: bigint;
  estimatedTotal: bigint;
};

export type Tx =
  | {
      type: AccountType.WASM;
      tx: polkadotExtrinsic;
      // aditional: object;
      // sender: KeyringPair;
      fee: WasmFee;
    }
  | {
      type: AccountType.EVM;
      tx: evmTx;
      aditional?: object;
      sender: Wallet;
      fee: EVMFee;
    };

export type confirmTx = ({ type, tx, fee }: Tx) => void;

export interface AssetAccount {
  balance: number;
  amount: number;
  symbol: string;
  decimals: number;
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assets: any;
}

export interface Asset {
  address?: string;
  amount: string;
  balance: string;
  decimals: number;
  id: string;
  price?: string;
  symbol: string;
  transferable?: string;
  usdPrice: number;
  accounts?: {
    [id: string]: AssetAccount;
  };
  assetNumber ?: number,
  network ?: string;
}

export type IAsset = Partial<Asset> & {
  id: string;
  contract?: ContractPromise;
  address?: string;
  balance: BN | string;
};

export interface SendForm {
  from: Chain;
  to: Chain;
  destinationAccount: string;
  amount: number;
  asset: object;
  isXcm: boolean;
}

export interface TxToProcess {
  amount: number | string;
  originAddress: string;
  destinationAddress: string;
  originNetwork: string;
  destinationNetwork: string;
  networkInfo: Chain;
  asset: {
    id: string;
    symbol: string;
    color: string;
  };
  rpc: string;
  tx: {
    txHash: string;
    aditional?: {
      tip?: BN | string;
    };
    type: AccountType;
  };
  swap?: {
    protocol: string;
    id: string;
  };
}

export type chain = {
  isTestnet?: boolean;
  type: ChainType;
};

export interface SelectedChain {
  [id: string]: chain;
}
export interface paramChain {
  id: string;
  type: ChainType;
}

export interface Chain {
  id: string;
  name: string;
  rpcs: string[];
  symbol: string;
  decimals: number;
  logo: string;
  explorer?: string;
  prefix?: number;
  isTestnet?: boolean;
  isCustom?: boolean;
  type: ChainType;
}

export type ChainsState = {
  title: string;
  chains: Chain[];
}[];

export interface OldChain {
  name: string;
  rpc: {
    wasm?: string;
    evm?: string;
  };
  addressPrefix: number;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  logo: string;
  explorer: {
    wasm?: {
      name: string;
      url: string;
    };
    evm?: {
      name: string;
      url: string;
    };
  };
  supportedAccounts: string[];
  xcm?: string[];
}

export interface Transaction {
  id: string;
  amount: string;
  asset: string;
  blockNumber: number;
  fee: string;
  hash: string;
  originNetwork: string;
  recipient: string;
  sender: string;
  status: string;
  targetNetwork: string;
  tip: string;
  timestamp: number;
  type: string;
  isSwap: boolean;
  version?: string;
  lastUpdated?: number;
}

export interface FormattedTransaction extends Transaction {
  chainLogo: string;
  link: string | undefined;
  isXcm: boolean;
}

export type HistoricTransaction = {
  transactions: Transaction[];
  hasNextPage: boolean;
};

export interface AddressForm {
  name: string;
  address: string;
}

export interface AssetBalance {
  balance: string;
  transferable: string;
}

export interface SubstrateBalance {
  data: {
    free: string;
    reserved: string;
    miscFrozen?: string;
    frozen?: string;
    feeFrozen?: string;
  };
}

export enum ChainType {
  EVM = "evm",
  WASM = "wasm",
  OL = "ol",
}

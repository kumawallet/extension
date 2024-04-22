import { SubmittableExtrinsic } from "@polkadot/api/types";
import { BN } from "@polkadot/util";
import { utils, providers, Wallet, BigNumber } from "ethers";
import { AccountType } from "./accounts/types";
import { Asset } from "./pages";
import { ContractPromise } from "@polkadot/api-contract";

export type polkadotExtrinsic =
  | SubmittableExtrinsic<"promise">
  | ContractTx<"promise">;

export type evmTx = utils.Deferrable<providers.TransactionRequest>;

export type WasmFee = {
  estimatedFee: BN;
  estimatedTotal: BN;
};

export type API = { [id:string] :  ApiPromise | ethers.providers.JsonRpcProvider | {}};

export type EVMFee = {
  gasLimit: BigNumber;
  "max fee per gas": BigNumber;
  // "max base fee per gas": BigNumber;
  "max priority fee per gas": BigNumber;
  estimatedFee: BigNumber;
  estimatedTotal: BigNumber;
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

export type IAsset = Partial<Asset> & {
  id: string;
  color?: string;
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
  rpc: string;
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
  type: "wasm" | "evm" | "move";
}

export interface SelectedChain {
  [id: string]: chain
}
export interface paramChain {
  id: string;
  type: "wasm" | "evm" | "move";
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
  type: "wasm" | "evm" | "move";
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
}

export type HistoricTransaction = {
  transactions: Transaction[];
  hasNextPage: boolean;
};

export interface AddressForm {
  name: string;
  address: string;
}

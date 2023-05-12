import { AccountType } from "@src/accounts/types";
import Chains from "@src/storage/entities/Chains";

type SelectedChain = Chain | null;
type Api = ApiPromise | ethers.providers.JsonRpcProvider | null;

export interface InitialState {
  chains: Chains;
  selectedChain: SelectedChain;
  api: Api;
  rpc: string | null;
  init: boolean;
  type: string;
}

export interface NetworkContext {
  state: InitialState;
  setSelectNetwork: (network: Chain) => void;
  getSelectedNetwork: () => Promise<Chain | null | undefined>;
  setNewRpc: (rpc: string) => void;
  refreshNetworks: (supportedAccounts?: AccountType[]) => void;
}

export type Action =
  | {
      type: "init";
      payload: {
        chains: Chains;
        selectedChain: SelectedChain;
        rpc: string;
        type: string;
      };
    }
  | {
      type: "select-network";
      payload: {
        selectedChain: SelectedChain;
        rpc?: string;
        type?: string;
        api?: Api;
      };
    }
  | {
      type: "set-api";
      payload: {
        api: Api;
        rpc?: string;
        type?: string;
      };
    }
  | {
      type: "refresh-networks";
      payload: {
        chains: Chains;
      };
    };

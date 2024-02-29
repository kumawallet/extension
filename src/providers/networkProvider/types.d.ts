import { AccountType } from "@src/accounts/types";
import { Chain, ChainsState } from "@src/types";

type SelectedChain = Chain | null;
type Api = ApiPromise | ethers.providers.JsonRpcProvider | null;

export interface InitialState {
  chains: ChainsState;
  selectedChain: SelectedChain;
  api: Api;
  init: boolean;
}

export interface NetworkContext {
  state: InitialState;
  setSelectNetwork: (network: Chain) => void;
  refreshNetworks: (supportedAccounts?: AccountType[]) => void;
  initializeNetwork: () => void;
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
      };
    }
  | {
      type: "refresh-networks";
      payload: {
        chains: Chains;
      };
    };

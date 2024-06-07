import { ChainStatus, NetworkStatus } from "@src/storage/entities/Provider";
import { ChainType, ChainsState, Provider } from "@src/types";

type SelectedChain = {
  [id: string]: chain;
};

type chain = {
  isTestnet?: boolean;
  type: ChainType;
  status: ChainStatus | null;
};

type Api = { [id: string]: Provider };

export interface InitialState {
  chains: ChainsState;
  selectedChain: SelectedChain;
  chainStatus: NetworkStatus;
}

export interface NetworkContext {
  state: InitialState;
  refreshNetworks: () => void;
}

export type Action =
  | {
      type: "select-network";
      payload: {
        selectedChain: Omit<SelectedChain, "status">;
      };
    }
  | {
      type: "refresh-networks";
      payload: {
        chains: Chains;
      };
    }
  | {
      type: "init-networks";
      payload: {
        chains: Chains;
      };
    }
  | {
      type: "update-status";
      payload: {
        status: NetworkStatus;
      };
    };

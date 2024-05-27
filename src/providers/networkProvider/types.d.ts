import { AccountType } from "@src/accounts/types";
import { ChainType, ChainsState, Provider } from "@src/types";

type SelectedChain = {
  [id: string]: chain;
};
type chain = {
  isTestnet?: boolean;
  type: ChainType;
};
type Api = { [id: string]: Provider };

export interface InitialState {
  chains: ChainsState;
  selectedChain: SelectedChain;
}

export interface NetworkContext {
  state: InitialState;
  refreshNetworks: (supportedAccounts?: AccountType[]) => void;
}

export type Action =
  | {
      type: "select-network";
      payload: {
        selectedChain: SelectedChain;
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
    };

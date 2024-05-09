import { AccountType } from "@src/accounts/types";
import { ChainsState } from "@src/types";

type SelectedChain = {
  [id: string]: chain
}
type chain = {
  isTestnet?: boolean;
  type: "wasm" | "evm" | "ol";
}
type Api =  { [id:string] :  ApiPromise | ethers.providers.JsonRpcProvider | {}}

export interface InitialState {
  chains: ChainsState;
  selectedChain: SelectedChain;
  api: Api;
  init: boolean;
}

export interface NetworkContext {
  state: InitialState;
  updateSelectNetwork: (id : string,  type: "wasm" | "evm" | "ol",isTestnet ?: boolean) => void;
  refreshNetworks: (supportedAccounts?: AccountType[]) => void;
  initializeNetwork: () => void;
}

export type Action =
  | {
      type: "init";
      payload: {
        chains: Chains;
        selectedChain: SelectedChain;
      };
    }
  | {
      type: "select-network";
      payload: {
        selectedChain: SelectedChain;
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

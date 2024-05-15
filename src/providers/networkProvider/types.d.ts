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
}

export interface NetworkContext {
  state: InitialState;
  refreshNetworks: (supportedAccounts?: AccountType[]) => void;
}

export type Action =
   {
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
    |{
      type: "init-networks";
      payload: {
        chains: Chains;
      };
    };

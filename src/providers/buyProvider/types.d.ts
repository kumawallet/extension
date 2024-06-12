type chain =  {
  "network-name": string;
  network: string;
  logo: string;
  symbol: string;
  prefix ?: number;
  type: string;
}


export interface InitialState {
  chains:chain[]
}


export interface assetsBuyContext {
  state: InitialState;
  createOrder: (symbol: string, address: string, network: string) => Promise<string>;
}

export type Action =
  {
      type: "init-chains";
      payload: {
        chains:chain[];
      };
    };

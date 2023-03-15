import { AccountType } from "@src/accounts/types";
import { MAINNETS, PARACHAINS, TESTNETS } from "@src/constants/chains";
import BaseEntity from "./BaseEntity";

export type Chain = {
  name: string;
  addressPrefix?: number;
  rpc: {
    wasm?: string;
    evm?: string;
  };
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  explorer: {
    evm?: {
      name: string;
      url: string;
    };
    wasm?: {
      name: string;
      url: string;
    };
  };
  logo: string;
  supportedAccounts: AccountType[];
  xcm?: string[];
};

export default class Chains extends BaseEntity {
  mainnets: Chain[];
  parachains: Chain[];
  testnets: Chain[];
  custom: Chain[];

  private static instance: Chains;

  private constructor() {
    super();
    this.mainnets = MAINNETS;
    this.parachains = PARACHAINS;
    this.testnets = TESTNETS;
    this.custom = [];
  }

  public static getInstance() {
    if (!Chains.instance) {
      Chains.instance = new Chains();
    }
    return Chains.instance;
  }

  static async init() {
    await Chains.set<Chains>(Chains.getInstance());
  }

  static async getDefaultValue<Chains>(): Promise<Chains> {
    const defaultChains = Chains.getInstance();
    defaultChains.mainnets = MAINNETS;
    defaultChains.parachains = PARACHAINS;
    defaultChains.testnets = TESTNETS;
    return defaultChains as Chains;
  }

  static async loadChains(): Promise<void> {
    const stored = await Chains.get<Chains>();
    if (!stored) throw new Error("failed_to_load_chains");
    const chains = Chains.getInstance();
    chains.mainnets = stored.mainnets;
    chains.parachains = stored.parachains;
    chains.testnets = stored.testnets;
    chains.custom = stored.custom;
  }

  static async saveCustomChain(chain: Chain) {
    const chains = await Chains.get<Chains>();
    if (!chains) throw new Error("failed_to_save_custom_chain");
    console.log("chains", chains);
    console.log("chain", chain);
    if (chains.isAlreadyAdded(chain)) throw new Error("chain_already_added");
    chains.custom = [...chains.custom, chain];
    console.log("chains updated", chains);
    await Chains.set<Chains>(chains);
  }

  static async removeCustomChain(chainName: string) {
    const chains = await Chains.get<Chains>();
    if (!chains) throw new Error("failed_to_remove_custom_chain");
    chains.custom = chains.custom.filter((c) => c.name !== chainName);
    await Chains.set<Chains>(chains);
  }

  static async getByName(chainName: string): Promise<Chain | undefined> {
    const chains = await Chains.get<Chains>();
    if (!chains) throw new Error("failed_to_get_chain_by_name");
    const chain = chains.mainnets.find((c) => c.name === chainName);
    if (chain) return chain;
    const parachain = chains.parachains.find((c) => c.name === chainName);
    if (parachain) return parachain;
    const testnet = chains.testnets.find((c) => c.name === chainName);
    if (testnet) return testnet;
    const custom = chains.custom.find((c) => c.name === chainName);
    if (custom) return custom;
    return undefined;
  }

  getAll() {
    return [
      ...this.mainnets,
      ...this.parachains,
      ...this.testnets,
      ...this.custom,
    ];
  }

  isAlreadyAdded(chain: Chain) {
    return (
      this.mainnets.some((c) => c.name === chain.name) ||
      this.parachains.some((c) => c.name === chain.name) ||
      this.testnets.some((c) => c.name === chain.name) ||
      this.custom.some((c) => c.name === chain.name)
    );
  }
}

import BaseEntity from "./BaseEntity";
import { Chain } from "@src/types";

export default class Chains extends BaseEntity {
  custom: Chain[];
  version: string = "";

  private static instance: Chains;

  private constructor() {
    super();

    this.custom = [];
  }

  static getName() {
    return "Chains";
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
    return defaultChains as Chains;
  }

  static async loadChains(): Promise<
    | {
        mainnets: Chain[];
        testnets: Chain[];
      }
    | undefined
  > {
    const stored = await Chains.get<Chains>();
    if (!stored) throw new Error("failed_to_load_chains");
    const chains = Chains.getInstance();
    chains.custom = stored.custom;
    return undefined;
  }

  static async saveCustomChain(chain: Chain) {
    const chains = await Chains.get<Chains>();
    if (!chains) throw new Error("failed_to_save_custom_chain");
    if (chains.isAlreadyAdded(chain)) throw new Error("chain_already_added");
    chains.custom = [...chains.custom, chain];
    await Chains.set<Chains>(chains);
  }

  static async removeCustomChain(chainName: string) {
    const chains = await Chains.get<Chains>();
    if (!chains) throw new Error("failed_to_remove_custom_chain");
    chains.custom = chains.custom.filter((c) => c.name !== chainName);
    await Chains.set<Chains>(chains);
  }

  isAlreadyAdded(chain: Chain) {
    return this.custom.some((c) => c.name === chain.name);
  }
}

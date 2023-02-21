import { Chain, MAINNETS, PARACHAINS, TESTNETS } from "@src/constants/chains";
import BaseEntity from "./BaseEntity";

export enum ChainType {
  MAINNET = "mainnets",
  PARACHAIN = "parachains",
  TESTNET = "testnets",
}

export default class Chains extends BaseEntity {
  mainnets: Chain[];
  parachains: Chain[];
  testnets: Chain[];

  private static instance: Chains;

  private constructor() {
    super();
    this.mainnets = MAINNETS;
    this.parachains = PARACHAINS;
    this.testnets = TESTNETS;
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
  }

  static async saveCustomChain(chain: Chain, chainType: ChainType) {
    const chains = await Chains.get<Chains>();
    if (!chains) throw new Error("failed_to_save_custom_chain");
    if (chains.isAlreadyAdded(chain)) throw new Error("chain_already_added");
    switch (chainType) {
      case ChainType.MAINNET:
        chains.addMainnet(chain);
        break;
      case ChainType.PARACHAIN:
        chains.addParachain(chain);
        break;
      case ChainType.TESTNET:
        chains.addTestnet(chain);
        break;
      default:
        throw new Error("invalid_chain_type");
    }
    await Chains.set<Chains>(chains);
  }

  static async removeCustomChain(chain: Chain, chainType: ChainType) {
    const chains = await Chains.get<Chains>();
    if (!chains) throw new Error("failed_to_remove_custom_chain");
    switch (chainType) {
      case ChainType.MAINNET:
        chains.removeMainnet(chain);
        break;
      case ChainType.PARACHAIN:
        chains.removeParachain(chain);
        break;
      case ChainType.TESTNET:
        chains.removeTestnet(chain);
        break;
      default:
        throw new Error("invalid_chain_type");
    }
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
    return undefined;
  }

  get() {
    return {
      mainnets: this.mainnets,
      parachains: this.parachains,
      testnets: this.testnets,
    };
  }

  getAll() {
    return [...this.mainnets, ...this.parachains, ...this.testnets];
  }

  set(mainnets: Chain[], parachains: Chain[], testnets: Chain[]) {
    this.mainnets = mainnets;
    this.parachains = parachains;
    this.testnets = testnets;
  }

  addMainnet(chain: Chain) {
    this.mainnets.push(chain);
  }

  addParachain(chain: Chain) {
    this.parachains.push(chain);
  }

  addTestnet(chain: Chain) {
    this.testnets.push(chain);
  }

  removeMainnet(chain: Chain) {
    this.mainnets = this.mainnets.filter((c) => c !== chain);
  }

  removeParachain(chain: Chain) {
    this.parachains = this.parachains.filter((c) => c !== chain);
  }

  removeTestnet(chain: Chain) {
    this.testnets = this.testnets.filter((c) => c !== chain);
  }

  getMainnets() {
    return this.mainnets;
  }

  getParachains() {
    return this.parachains;
  }

  getTestnets() {
    return this.testnets;
  }

  isAlreadyAdded(chain: Chain) {
    return (
      this.mainnets.some((c) => c.name === chain.name) ||
      this.parachains.some((c) => c.name === chain.name) ||
      this.testnets.some((c) => c.name === chain.name)
    );
  }
}

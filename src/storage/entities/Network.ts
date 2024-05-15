import { Chain, SelectedChain } from "@src/types";
import BaseEntity from "./BaseEntity";

export default class Network extends BaseEntity {
  SelectedChain: SelectedChain;
  Chain: Chain | null;

  private static instance: Network;
  constructor() {
    super();
    this.Chain = null;
    this.SelectedChain = {};
  }

  static getName() {
    return "Network";
  }

  public static getInstance() {
    if (!Network.instance) {
      Network.instance = new Network();
    }
    return Network.instance;
  }

  static async init() {
    await Network.set<Network>(Network.getInstance());
  }

  static async get<Network>(): Promise<Network> {
    const network = await super.get<Network>();
    if (!network) throw new Error("network_not_found");
    return network;
  }

  get() {
    return this.SelectedChain;
  }

  set(chains: SelectedChain) {
    this.SelectedChain = chains;
  }
}

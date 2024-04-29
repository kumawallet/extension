import { Chain } from "@src/types";
import BaseEntity from "./BaseEntity";

export default class Network extends BaseEntity {
  chain: Chain | null;

  private static instance: Network;

  constructor() {
    super();
    this.chain = null;
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

  static async getDefaultValue<Network>(): Promise<Network> {
    const defaultNetwork = Network.getInstance();
    defaultNetwork.chain = null;
    return defaultNetwork as Network;
  }

  static async get<Network>(): Promise<Network> {
    const network = await super.get<Network>();
    if (!network) throw new Error("network_not_found");
    return network;
  }

  get() {
    return this.chain;
  }

  set(chain: Chain) {
    this.chain = chain;
  }
}

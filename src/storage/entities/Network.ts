import { Chain } from "@src/contants/chains";
import Storable from "../Storable";
import { NETWORK } from "../../utils/constants";
import Storage from "../Storage";

export class Network extends Storable {
  chain: Chain | null;

  private static instance: Network;

  constructor() {
    super(NETWORK);
    this.chain = null;
  }

  public static getInstance() {
    if (!Network.instance) {
      Network.instance = new Network();
    }
    return Network.instance;
  }

  getChain() {
    return this.chain;
  }

  setChain(chain: Chain) {
    this.chain = chain;
  }

  static getDefaultNetwork() {
    const defaultNetwork = Network.getInstance();
    defaultNetwork.chain = null;
    return defaultNetwork;
  }

  static async set(network: Network) {
    await Storage.getInstance().set(NETWORK, network);
  }

  static async get(): Promise<Network> {
    const stored = await Storage.getInstance().get(NETWORK);
    if (!stored || !stored.chain) {
      const defaultNetwork = Network.getDefaultNetwork();
      await Network.set(defaultNetwork);
      return defaultNetwork;
    }
    const network = new Network();
    network.setChain(stored.chain);
    return network;
  }
}

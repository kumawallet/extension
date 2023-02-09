import { Chain } from "@src/contants/chains";
import Storable from "../Storable";
import { NETWORK } from "../../utils/constants";

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

  get() {
    return this.chain;
  }

  set(chain: Chain) {
    this.chain = chain;
  }

  static getDefaultNetwork() {
    try {
      const defaultNetwork = Network.getInstance();
      defaultNetwork.chain = null;
      return defaultNetwork;
    } catch (error) {
      throw new Error(error as string);
    }
  }
}

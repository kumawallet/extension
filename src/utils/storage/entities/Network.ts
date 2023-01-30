import { Chain, CHAINS } from "@src/contants/chains";
import Storable from "../Storable";
import { NETWORK } from "../../constants";

export class Network extends Storable {
  chain: Chain;

  private static instance: Network;

  constructor() {
    super(NETWORK);
    this.chain = CHAINS[0].chains[0];
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
}

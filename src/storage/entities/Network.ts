import { Chain, SelectedChain } from "@src/types";
import BaseEntity from "./BaseEntity";
import { EVM_CHAINS, SUBTRATE_CHAINS } from "@src/constants/chainsData";

export default class Network extends BaseEntity {
  SelectedChain: SelectedChain;
  Chain: Chain | null;

  private static instance: Network;
  constructor() {
    super();
    this.SelectedChain = {};
    this.Chain = null;
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
    const network: any = await Network.get();
    // console.log(network, "por aquiiii98495734875734")
    if (!network) throw new Error("SelectedChain_not_found");
    const allChains = [SUBTRATE_CHAINS, EVM_CHAINS]
      .map((chain: any) => chain.chains)
      .flat();

    if (network?.Chain?.supportedAccounts) {
      const newChainFormat = allChains.find(
        (chain) => network?.Chain?.name === chain.name
      );
      if (newChainFormat) {
        const id = newChainFormat.id;
        const type = newChainFormat.type;
        const isTestnet = newChainFormat.isTestnet;
        // console.log(" value default", {[id]: {
        //   isTestnet: isTestnet,
        //   type: type
        //  }})
        network.selectedChain[id] = {
          isTestnet: isTestnet,
          type: type,
        };
        //  console.log("network 1", network, "Por aqui es el trabajoooo")
        network.set(network);
      }
    } else {
      const id = allChains[0].id;
      const type = allChains[0].type;
      const isTestnet = allChains[0].isTestnet;
      network.selectedChain[id] = {
        isTestnet: isTestnet,
        type: type,
      };
      //  console.log("network", network, "Por aqui es el trabajoooo")
      network.set(network);
    }
    return network as Network;
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

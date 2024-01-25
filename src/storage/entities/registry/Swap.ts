import BaseEntity from "../BaseEntity";

export interface SwapData {
  id: string;
}

export default class Swap extends BaseEntity {
  data: {
    swaps: { [protocol: string]: SwapData[] };
  };

  constructor() {
    super();
    this.data = {
      swaps: {},
    };
  }

  static async getDefaultValue<Swap>(): Promise<Swap> {
    return new Swap() as Swap;
  }

  static async getSwapsByProtocol(protocol: string): Promise<SwapData[]> {
    const swap = await Swap.get<Swap>();
    if (!swap) throw new Error("failed_to_get_swaps");
    return swap.getSwapsByProtocol(protocol);
  }

  static async addSwap(protocol: string, swap: SwapData) {
    const _swap = await Swap.get<Swap>();
    if (!_swap) throw new Error("failed_to_add_swap");
    _swap.addSwap(protocol, swap);
    await Swap.set<Swap>(_swap);
  }

  getSwapsByProtocol(protocol: string): SwapData[] {
    return this.data.swaps[protocol] || [];
  }

  addSwap(protocol: string, swap: SwapData) {
    if (!this.data.swaps[protocol]) this.data.swaps[protocol] = [];
    this.data.swaps[protocol].push(swap);
  }
}

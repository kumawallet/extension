import { defaultAssetConfig } from "@src/constants/assets";
import BaseEntity from "./BaseEntity";

interface Asset {
  symbol: string;
  address: string;
  decimals: number;
}

export default class Assets extends BaseEntity {
  data: {
    [key: string]: Asset[];
  };

  constructor() {
    super();
    this.data = defaultAssetConfig;
  }

  static async getDefaultValue<Assets>(): Promise<Assets> {
    return new Assets() as Assets;
  }

  static async init() {
    await Assets.set<Assets>(new Assets());
  }

  static async addAsset(chain: string, asset: Asset) {
    const assets = await Assets.get<Assets>();
    if (!assets) throw new Error("failed_to_add_assets");
    assets.addAsset(chain, asset);
    await Assets.set<Assets>(assets);
  }

  static async getByChain(chain: string) {
    const assets = await Assets.get<Assets>();
    if (!assets) throw new Error("failed_to_load_assets");
    return assets.data[chain] || [];
  }

  addAsset(chain: string, asset: Asset) {
    if (!this.data[chain]) {
      this.data[chain] = [asset];
      return;
    }

    const _asset = this.data[chain].find(
      (ast) => ast.address === asset.address
    );

    if (_asset) throw new Error("asset_already_added");

    this.data[chain].push(asset);
  }
}

import { Asset } from "@src/providers/assetProvider/types";
import {
  formatAmountWithDecimals,
  getAssetUSDPrice,
  getNatitveAssetBalance,
  getSubtrateNativeBalance,
  getWasmAssets,
} from "@src/utils/assets";
import { BehaviorSubject } from "rxjs";
import { Chain, IAsset } from "@src/types";
import { ApiPromise } from "@polkadot/api";
import { Contract, ethers } from "ethers";
import { EVM_CHAINS, SUBTRATE_CHAINS } from "@src/constants/chainsData";
import { BN } from "@polkadot/util";
import Assets from "@src/storage/entities/Assets";
import erc20Abi from "@src/constants/erc20.abi.json";
import AccountEntity from "@src/storage/entities/Account";

type network = {
  [chainId: string]: {
    subs: any[];
    assets: Asset[];
  };
};
export default class AssetsBalance {
  public assets = new BehaviorSubject<{
    [key: string]: network;
  }>({});
  networks: string[] = [];
  chains = [SUBTRATE_CHAINS, EVM_CHAINS].flat();
  public async init() {
    this.assets.next({});
  }

  public async loadAssets(account: AccountEntity, api: any, chains: string[]) {
    await Promise.all(
      chains.map((chain: string) => this.setAssets(account, api[chain], chain))
    );
  }
  public async setAssets(account: AccountEntity, api: any, chain: string) {
    try {
      const _chain = this.chains.find((_chain) => _chain.id === chain);
      if (!this.networks.includes(chain)) this.networks.push(chain);

      if (_chain) {
        if (
          api.type === "evm" &&
          this.getType(account.type.toLowerCase()) === "evm"
        ) {
          const { nativeAssets, unsub } = await this.getNativeAsset(
            api,
            account,
            _chain
          );
          const { _assets, _unsubs } = await this.getOtherAssets(
            api,
            account,
            _chain
          );
          const subs = _unsubs || [];
          const assets = this.assets.getValue();
          const network: any =
            !assets[account.key] ||
            Object.keys(assets[account.key]).length === 0
              ? {}
              : { ...assets[account.key] };
          network[chain] = {
            subs: [...subs],
            assets: [
              {
                id: "-1",
                symbol: _chain?.symbol,
                decimals: _chain?.decimals,
                balance: String(nativeAssets.balance),
              },
              ...(_assets.map((asset: any) => ({
                ...asset,
              })) as Asset[]),
            ],
          };
          assets[account.key] = network;
          this.assets.next(assets);
          return;
        } else if (
          api.type === "wasm" &&
          this.getType(account.type.toLowerCase()) === "wasm"
        ) {
          const { nativeAssets, unsubs } = await this.getNativeAsset(
            api,
            account,
            _chain
          );
          const { _assets, _unsubs } = await this.getOtherAssets(
            api,
            account,
            _chain
          );
          const subs = _unsubs || [];
          const assets = this.assets.getValue();
          const network: any =
            !assets[account.key] ||
            Object.keys(assets[account.key]).length === 0
              ? {}
              : { ...assets[account.key] };
          network[chain] = {
            subs: [unsubs, ...subs],
            assets: [
              {
                id: "-1",
                symbol: _chain?.symbol,
                decimals: _chain?.decimals,
                balance: String(nativeAssets.balance),
                reserved: nativeAssets.reserved,
                frozen: nativeAssets.frozen,
                transferable: nativeAssets.transferable,
              },
              ...(_assets.map((asset: any) => ({
                ...asset,
              })) as Asset[]),
            ],
          };

          assets[account.key] = network;
          this.assets.next(assets);
          return;
        }
      }
    } catch (error) {
      throw new Error("failed_to_add_asset");
    }
  }
  public getAssets() {
    return this.assets;
  }
  public getNetwork() {
    return this.networks;
  }
  private getType = (type: string) => {
    if (type === "imported_wasm") {
      return type.slice(-4);
    } else if (type === "imported_evm") {
      return type.slice(-3);
    } else if (type === "evm" || type === "wasm") {
      return type;
    }
  };
  private getNativeAsset = async (
    api: {
      provider: ApiPromise | ethers.providers.JsonRpcProvider;
      type: "evm" | "wasm" | "ol";
    },
    account: AccountEntity,
    chain: Chain
  ) => {
    try {
      let unsubs;
      const nativeAssets: any = await getNatitveAssetBalance(
        api,
        account.value!.address,
        account
      );
      if (
        api.type === "wasm" &&
        this.getType(account.type.toLowerCase()) === "wasm"
      ) {
        await (api.provider as ApiPromise).query.system
          .account(
            account.value.address,
            ({
              data,
            }: {
              data: {
                free: string;
                reserved: string;
                miscFrozen?: string;
                frozen?: string;
                feeFrozen?: string;
              };
            }) => {
              const { transferable, reserved, balance, frozen } =
                getSubtrateNativeBalance(data);
              this.updateOneAsset(
                account.key,
                { transferable, reserved, balance, frozen },
                chain.symbol,
                chain.id
              );
            }
          )
          .then((result) => {
            unsubs = result;
          });
        return { nativeAssets, unsubs };
      } else if (
        api.type === "evm" &&
        this.getType(account.type.toLowerCase()) === "evm"
      ) {
        const _api = api.provider as ethers.providers.JsonRpcProvider;
        _api.off("block");
        _api.on("block", () => {
          _api.getBalance(account.value.address).then((balance: any) => {
            this.updateOneAsset(
              account.key,
              { balance },
              chain.symbol,
              chain.id
            );
          });
        });
        return { nativeAssets };
      }
      return { nativeAssets, unsubs };
    } catch (error) {
      throw new Error("failed_to_get_nativeAsset");
    }
  };

  private updateOneAsset(
    account: string,
    data: any,
    symbol: string,
    chain: string
  ) {
    const allAsset: { [key: string]: network } = this.assets.getValue();

    if (Object.keys(allAsset).length === 0 || !allAsset[account][chain]) return;

    if (allAsset[account][chain]) {
      const index = allAsset[account][chain].assets.findIndex((asset) => {
        return asset.symbol === symbol;
      });
      if (
        index > -1 &&
        !data.balance?.eq(allAsset[account][chain].assets[index].balance)
      ) {
        const _balance = Number(
          formatAmountWithDecimals(
            Number(data.balance),
            6,
            allAsset[account][chain].assets[index]?.decimals
          )
        );
        if (data?.frozen && data.reserved && data.transferable) {
          allAsset[account][chain].assets[index] = {
            ...allAsset[account][chain].assets[index],
            amount: Number(
              (
                (allAsset[account][chain].assets[index].price || 0) * _balance
              ).toFixed(2)
            ),
            balance: String(data.balance),
            frozen: data.frozen,
            reserved: data.reserved,
            transferable: data.transferable,
          };
        } else {
          allAsset[account][chain].assets[index] = {
            ...allAsset[account][chain].assets[index],
            amount: Number(
              (
                (allAsset[account][chain].assets[index].price || 0) * _balance
              ).toFixed(2)
            ),
            balance: String(data.balance),
          };
        }

        this.assets.next(allAsset);
        return;
      }
    }
  }
  public deleteAsset(
    account: AccountEntity,
    api: any,
    chains: string[],
    unSelectedNetwork: boolean = true
  ) {
    if (account && chains.length > 0) {
      if (this.getType(account.type.toLowerCase()) === "wasm") {
        const assets = this.assets.getValue();
        const _account: any = assets[account.key];
        const _chains = chains.filter(
          (chain) =>
            this.chains.find((_chain) => _chain.id === chain)?.type === "wasm"
        );
        _chains.forEach((chain) => {
          const network: any[] = _account[chain].subs;
          network.forEach((unsubs) => unsubs?.());
          delete assets[account.key][chain];
          if (Object.keys(assets[account.key]).length === 0) {
            delete assets[account.key];
          }
        });
        if (unSelectedNetwork) {
          const newnetwork = this.networks.filter(
            (network) => !chains.includes(network)
          );
          this.networks = newnetwork;
        }
        this.assets.next(assets);
      } else if (this.getType(account.type.toLowerCase()) === "evm") {
        const assets = this.assets.getValue();
        const _account = assets[account.key];
        const _chains = chains.filter(
          (chain) =>
            this.chains.find((_chain) => _chain.id === chain)?.type === "evm"
        );
        _chains.forEach((chain) => {
          const network: any[] = _account[chain].subs;
          api[chain].provider.off("block");
          network.forEach((unsubs) => unsubs.off("Transfer"));
          delete assets[account.key][chain];
          if (Object.keys(assets[account.key]).length === 0) {
            delete assets[account.key];
          }
        });
        if (unSelectedNetwork) {
          const newnetwork = this.networks.filter(
            (network) => !chains.includes(network)
          );
          this.networks = newnetwork;
        }
        this.assets.next(assets);
      }
    }
  }
  private getOtherAssets = async (
    _api: api,
    account: AccountEntity,
    chain: Chain
  ) => {
    let _assets: any[];
    let _unsubs: any[];
    if (
      _api.type === "wasm" &&
      this.getType(account.type.toLowerCase()) === "wasm"
    ) {
      const { assets, unsubs } = await getWasmAssets(
        _api.provider,
        chain.id,
        account?.value!.address,
        (amounts: {
          balance: BN;
          frozen: BN;
          reserved: BN;
          transferable: BN;
        }) => {
          this.updateOneAsset(account.key, amounts, chain.symbol, chain.id);
        }
      );
      _assets = assets;
      _unsubs = unsubs;
      return { _assets, _unsubs };
    } else if (
      _api.type === "evm" &&
      this.getType(account.type.toLowerCase()) === "evm"
    ) {
      const { assets, unsubs } = await this.loadAssetsFromStorage(
        chain,
        account,
        _api.provider
      );
      _assets = assets;
      _unsubs = unsubs;
      return { _assets, _unsubs };
    } else {
      _assets = [];
      _unsubs = [];
      return { _assets, _unsubs };
    }
  };
  private loadAssetsFromStorage = async (
    chain: Chain,
    account: AccountEntity,
    api: ethers.providers.JsonRpcProvider
  ) => {
    try {
      const assets: IAsset[] = [];
      const unsubs: any[] = [];
      const assetsFromStorage = await Assets.getByChain(chain.id);

      if (assetsFromStorage.length > 0 && account?.value?.address) {
        const accountAddress = account.value.address;

        await Promise.all(
          assetsFromStorage.map(async (asset, index) => {
            assets[index] = {
              address: asset.address,
              balance: "",
              id: String(index),
              decimals: asset.decimals,
              symbol: asset.symbol,
            };

            try {
              if (chain.type === "evm") {
                const contract = new Contract(asset.address, erc20Abi, api);
                unsubs.push(contract);

                const balance = await contract.balanceOf(accountAddress);

                assets[index].balance = balance;

                contract.removeAllListeners("Transfer");

                contract.on("Transfer", async (from, to) => {
                  const selfAddress = account?.value?.address;
                  if (from === selfAddress || to === selfAddress) {
                    const balance = await contract.balanceOf(accountAddress);
                    this.updateOneAsset(
                      account.key,
                      { balance },
                      chain.symbol,
                      chain.id
                    );
                  }
                });
              }
            } catch (error) {
              // captureError(error);
              assets[index].balance = new BN("0");
            }
          })
        );
      }

      return { assets, unsubs };
    } catch (error) {
      const assets: IAsset[] = [];
      const unsubs: any[] = [];
      return { assets, unsubs };
    }
  };
}

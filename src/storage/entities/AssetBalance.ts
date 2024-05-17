import { Asset } from "@src/providers/assetProvider/types";
import {
  formatAmountWithDecimals,
  getAssetUSDPrice,
  getNatitveAssetBalance,
  getSubtrateNativeBalance,
  getType,
  getWasmAssets,
} from "@src/utils/assets";
import { BehaviorSubject } from "rxjs";
import { Chain, ChainType, IAsset, SubstrateBalance } from "@src/types";
import { ApiPromise } from "@polkadot/api";
import { Contract, ethers } from "ethers";
import { EVM_CHAINS, SUBTRATE_CHAINS } from "@src/constants/chainsData";
import Assets from "@src/storage/entities/Assets";
import erc20Abi from "@src/constants/erc20.abi.json";
import AccountEntity from "@src/storage/entities/Account";
import { OL_CHAINS } from "@src/constants/chainsData/ol";
import { OlProvider } from "@src/services/ol/OlProvider";

type network = {
  [chainId: string]: {
    subs: any[];
    assets: Asset[];
  };
};
export default class AssetsBalance {
  public assets = new BehaviorSubject<{ [key: string]: network }>({});
  public _assets: { [key: string]: network } = {};
  networks: string[] = [];
  chains = [SUBTRATE_CHAINS, EVM_CHAINS, OL_CHAINS].flat();

  public async init() {
    this.assets.next({});
  }

  public async loadAssets(account: AccountEntity, api: any, chains: string[]) {
    await Promise.all(
      chains.map((chain: string) => this.setAssets(account, api[chain], chain))
    );
  }
  public async setAssets(account: AccountEntity, api: any, chainId: string) {
    try {
      const chain = this.chains.find((_chain) => _chain.id === chainId);
      if (!this.networks.includes(chainId)) this.networks.push(chainId);

      if (chain) {
        if (api.type !== getType(account.type.toLowerCase())) return;

        const [{ nativeAsset, unsubs: nativeUnsubs }, { _assets, _unsubs }] =
          await Promise.all([
            this.getNativeAsset(api, account, chain),
            this.getNonNativeAssets(api, account, chain),
          ]);

        const subs = [..._unsubs, ...nativeUnsubs] || [];

        this._assets[account.key] = {
          ...this._assets[account.key],
          [chainId]: {
            subs,
            assets: [nativeAsset, ..._assets],
          },
        };

        if (!chain.isTestnet) {
          const price = await this.getAssetsUSDPrice(
            this._assets[account.key][chainId].assets
          );
          this._assets[account.key][chainId].assets = this._assets[account.key][
            chainId
          ].assets.map((asset) => {
            asset.price = String(price[asset.symbol] ? price[asset.symbol] : 0);
            asset.amount = price[asset.symbol]
              ? Number(
                  price[asset.symbol] *
                    Number(
                      formatAmountWithDecimals(
                        Number(asset.balance),
                        6,
                        asset?.decimals
                      )
                    )
                ).toFixed(2)
              : "0";
            return asset;
          });
        } else {
          this._assets[account.key][chainId].assets = this._assets[account.key][
            chainId
          ].assets.map((asset) => {
            asset.price = "0";
            asset.amount = "0";
            return asset;
          });
        }
      }
    } catch (error) {
      const newnetworks = this.networks.filter(
        (network) => network !== chainId
      );
      this.networks = newnetworks;
      throw new Error("failed_to_add_asset");
    }
  }
  public getLocalAssets() {
    return this._assets;
  }
  public getAssets() {
    return this.assets;
  }
  public getNetwork() {
    return this.networks;
  }

  private getNativeAsset = async (
    api: {
      provider: ApiPromise | ethers.providers.JsonRpcProvider | OlProvider;
      type: ChainType;
    },
    account: AccountEntity,
    chain: Chain
  ) => {
    try {
      let unsubs: any[] = [];
      const nativeAsset = await getNatitveAssetBalance(
        api,
        account.value.address,
        account
      );

      const apiType = api.type;

      switch (apiType) {
        case ChainType.WASM:
          {
            const substrateProvider = api.provider as ApiPromise;
            await substrateProvider.query.system
              .account(account.value.address, ({ data }: SubstrateBalance) => {
                const { transferable, balance } =
                  getSubtrateNativeBalance(data);
                this.updateOneAsset(
                  account.key,
                  { transferable, balance },
                  "-1",
                  chain.id
                );
              })
              .then((result) => {
                unsubs = [result];
              });
          }
          break;
        case ChainType.EVM:
          {
            const evmProvider =
              api.provider as ethers.providers.JsonRpcProvider;

            evmProvider.off("block");
            evmProvider.on("block", () => {
              evmProvider.getBalance(account.value.address).then((balance) => {
                this.updateOneAsset(
                  account.key,
                  { balance: balance.toString() },
                  "-1",
                  chain.id
                );
              });
            });
          }
          break;
        case ChainType.OL:
          {
            const olProvider = api.provider as OlProvider;
            olProvider.onNewBlock(() => {
              olProvider.getBalance(account.value.address).then((balance) => {
                this.updateOneAsset(
                  account.key,
                  { balance: balance.toString() },
                  "-1",
                  chain.id
                );
              });
            });
          }
          break;
      }

      return {
        nativeAsset: {
          id: "-1",
          symbol: chain.symbol,
          decimals: chain.decimals,
          balance: nativeAsset.balance,
          transferable: nativeAsset.transferable,
        },
        unsubs,
      };
    } catch (error) {
      throw new Error("failed_to_get_nativeAsset");
    }
  };

  private updateOneAsset(
    account: string,
    data: {
      balance: string;
      transferable?: string;
    } = {
      balance: "0",
    },
    assetId: string,
    chain: string
  ) {
    if (Object.keys(this._assets).length === 0 || !this._assets[account][chain])
      return;

    if (this._assets[account][chain]) {
      const index = this._assets[account][chain].assets.findIndex((asset) => {
        return asset.id === assetId;
      });

      const balanceChanged =
        data.balance !== this._assets[account][chain].assets[index].balance;

      if (index > -1 && balanceChanged) {
        const _balance = Number(
          formatAmountWithDecimals(
            Number(data.balance),
            6,
            this._assets[account][chain].assets[index]?.decimals
          )
        );

        const amount = Number(
          Number(this._assets[account][chain].assets[index].price) * _balance
        ).toFixed(2);

        this._assets[account][chain].assets[index] = {
          ...this._assets[account][chain].assets[index],
          amount,
          balance: data.balance,
          transferable: data.transferable || data.balance,
        };

        this.assets.next(this._assets);
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
      const _account = this._assets[account.key];

      const accountType = getType(account.type.toLowerCase());
      const chainType = accountType;
      const chainsToUpdate = chains.filter(
        (chain) =>
          this.chains.find((_chain) => _chain.id === chain)?.type === chainType
      );

      chainsToUpdate.forEach((chainId) => {
        const network: any[] = _account[chainId].subs;

        // turn off the subscription
        switch (accountType) {
          case ChainType.WASM:
            {
              network.forEach((unsubs) => unsubs?.());
            }
            break;
          case ChainType.EVM:
            {
              api[chainId].provider.off("block");
              network.forEach((unsubs) => unsubs.off("Transfer"));
            }
            break;
          case ChainType.OL: {
            (api[chainId].provider as OlProvider).disconnect();
          }
        }

        // delete chain form the account, if no chain left delete the account
        delete this._assets[account.key][chainId];
        if (Object.keys(this._assets[account.key]).length === 0) {
          delete this._assets[account.key];
        }
      });

      if (unSelectedNetwork) {
        const newnetwork = this.networks.filter(
          (network) => !chains.includes(network)
        );
        this.networks = newnetwork;
      }
    }
  }

  private getNonNativeAssets = async (
    api: any,
    account: AccountEntity,
    chain: Chain
  ) => {
    let _assets: any[] = [];
    let _unsubs: any[] = [];

    const apiType = api.type;

    switch (apiType) {
      case ChainType.WASM:
        {
          const { assets, unsubs } = await getWasmAssets(
            api.provider,
            chain.id,
            account?.value?.address,
            (
              assetId,
              amounts: {
                balance: string;
                transferable: string;
              }
            ) => {
              this.updateOneAsset(account.key, amounts, assetId, chain.id);
            }
          );

          _assets = assets;
          _unsubs = unsubs;
        }
        break;
      case ChainType.EVM:
        {
          const { assets, unsubs } = await this.loadERC20Assets(
            chain,
            account,
            api.provider
          );
          _assets = assets;
          _unsubs = unsubs;
        }
        break;
    }

    return { _assets, _unsubs };
  };

  private loadERC20Assets = async (
    chain: Chain,
    account: AccountEntity,
    api: ethers.providers.JsonRpcProvider
  ) => {
    try {
      const assets: IAsset[] = [];
      const unsubs: any[] = [];
      const erc20Tokens = await Assets.getByChain(chain.id);

      if (erc20Tokens.length > 0 && account?.value?.address) {
        const accountAddress = account.value.address;

        await Promise.all(
          erc20Tokens.map(async (asset, index) => {
            assets[index] = {
              address: asset.address,
              balance: "",
              id: asset.address,
              decimals: asset.decimals,
              symbol: asset.symbol,
            };

            try {
              const contract = new Contract(asset.address, erc20Abi, api);
              unsubs.push(contract);

              const balance = await contract.balanceOf(accountAddress);

              assets[index].balance = String(balance);

              contract.removeAllListeners("Transfer");

              contract.on("Transfer", async (from, to) => {
                const selfAddress = account?.value?.address;
                if (from === selfAddress || to === selfAddress) {
                  const balance = await contract.balanceOf(accountAddress);
                  this.updateOneAsset(
                    account.key,
                    {
                      balance: balance.toString(),
                      transferable: balance.toString(),
                    },
                    asset.address,
                    chain.id
                  );
                }
              });
            } catch (error) {
              assets[index].balance = "0";
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

  private getAssetsUSDPrice = async (assets: Asset[]) => {
    try {
      const addresToQuery = assets.map((asset) => asset.symbol);
      const price = await getAssetUSDPrice(addresToQuery).catch(() => 0);
      return price;
    } catch (error) {
      throw new Error("failed_to_get_Asset_USDPrice");
    }
  };
}

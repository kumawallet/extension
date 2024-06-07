import {
  formatAmountWithDecimals,
  getAssetUSDPrice,
  getNativeAssetBalance,
  getSubtrateNativeBalance,
  getType,
  getWasmAssets,
} from "@src/utils/assets";
import { BehaviorSubject } from "rxjs";
import { Asset, Chain, ChainType, IAsset, SubstrateBalance } from "@src/types";
import { ApiPromise } from "@polkadot/api";
import { Contract, providers } from "ethers";
import { EVM_CHAINS, SUBTRATE_CHAINS } from "@src/constants/chainsData";
import Assets from "@src/storage/entities/Assets";
import erc20Abi from "@src/constants/erc20.abi.json";
import AccountEntity from "@src/storage/entities/Account";
import { OL_CHAINS } from "@src/constants/chainsData/ol";
import { OlProvider } from "@src/services/ol/OlProvider";
import { api } from "./Provider";
import { Codec } from "@polkadot/types-codec/types";

type Subcription = Codec | { off: (event: string) => void } | Contract;

type network = {
  [chainId: string]: {
    subs: Subcription[];
    assets: Asset[];
  };
};

export interface AssetBalance {
  [key: string]: network;
}

export default class AssetsBalance {
  public assets = new BehaviorSubject<AssetBalance>({});
  public _assets: { [key: string]: network } = {};
  networks: string[] = [];
  chains = [SUBTRATE_CHAINS, EVM_CHAINS, OL_CHAINS].flat();

  public async init() {
    this.assets.next({});
  }

  public async loadAssets(
    account: AccountEntity,
    api: Record<string, api>,
    chains: string[]
  ) {
    await Promise.all(
      chains.map((chain: string) => this.setAssets(account, api[chain], chain))
    );
  }

  public async setAssets(account: AccountEntity, api: api, chainId: string) {
    try {
      const chain = this.chains.find((_chain) => _chain.id === chainId);
      if (!this.networks.includes(chainId)) this.networks.push(chainId);

      if (chain) {
        const apiIsSameTypeAsAccount =
          api.type === getType(account.type.toLowerCase());

        if (!apiIsSameTypeAsAccount) return;

        const [{ nativeAsset, unsubs: nativeUnsubs }, { _assets, _unsubs }] =
          await Promise.all([
            this.getNativeAsset(api, account, chain),
            this.getNonNativeAssets(api, account, chain),
          ]);

        const subs = [..._unsubs, ...nativeUnsubs] || [];

        // @ts-expect-error --- *
        this._assets[account.key] = {
          ...this._assets[account.key],
          [chainId]: {
            subs,
            assets: [nativeAsset, ..._assets],
          },
        };

        const price = await this.getAssetsUSDPrice(
          this._assets[account.key][chainId].assets
        );

        this._assets[account.key][chainId].assets = this._assets[account.key][
          chainId
        ].assets.map((asset) => {
          asset.price = "0";
          asset.amount = "0";

          if (!chain.isTestnet) {
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
          }

          return asset;
        });
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
      provider: ApiPromise | providers.JsonRpcProvider | OlProvider;
      type: ChainType;
    },
    account: AccountEntity,
    chain: Chain
  ) => {
    try {
      let unsubs: Subcription[] = [];
      const nativeAsset = await getNativeAssetBalance(
        api,
        account.value!.address,
        account
      );

      const apiType = api.type;

      switch (apiType) {
        case ChainType.WASM:
          {
            const substrateProvider = api.provider as ApiPromise;
            await substrateProvider.query.system
              .account(account.value!.address, ({ data }: SubstrateBalance) => {
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
            const evmProvider = api.provider as providers.JsonRpcProvider;

            evmProvider.off("block");
            evmProvider.on("block", () => {
              evmProvider.getBalance(account.value!.address).then((balance) => {
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
              olProvider.getBalance(account.value!.address).then((balance) => {
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
    api: Record<string, api>,
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
        const network = _account[chainId].subs;

        // turn off the subscription
        switch (accountType) {
          case ChainType.WASM:
            {
              // @ts-expect-error --- off is a function
              network.forEach((unsubs) => unsubs?.());
            }
            break;
          case ChainType.EVM:
            {
              (api[chainId].provider as providers.JsonRpcProvider).off("block");
              // @ts-expect-error --- off is a function
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
    api: api,
    account: AccountEntity,
    chain: Chain
  ) => {
    let _assets: Asset[] = [];
    let _unsubs: Subcription[] = [];

    const apiType = api.type;

    switch (apiType) {
      case ChainType.WASM:
        {
          const { assets, unsubs } = await getWasmAssets(
            api.provider as ApiPromise,
            chain.id,
            account?.value?.address || "",
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
          _unsubs = unsubs as Subcription[];
        }
        break;
      case ChainType.EVM:
        {
          const { assets, unsubs } = await this.loadERC20Assets(
            chain,
            account,
            api.provider as providers.JsonRpcProvider
          );
          _assets = assets as Asset[];
          _unsubs = unsubs;
        }
        break;
    }

    return { _assets, _unsubs };
  };

  private loadERC20Assets = async (
    chain: Chain,
    account: AccountEntity,
    api: providers.JsonRpcProvider
  ) => {
    try {
      const assets: IAsset[] = [];
      const unsubs: Subcription[] = [];
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
      const unsubs: Subcription[] = [];
      return { assets, unsubs };
    }
  };

  private getAssetsUSDPrice = async (assets: Asset[]) => {
    try {
      const addresToQuery = assets.map((asset) => asset.symbol);
      const price = await getAssetUSDPrice(addresToQuery);
      return price;
    } catch (error) {
      return {};
    }
  };

  public async reset() {
    const allAssets = this.assets.getValue();

    for (const account in allAssets) {
      for (const network in allAssets[account]) {
        const { subs } = allAssets[account][network];

        for (const unsub of subs) {
          if ("off" in unsub) {
            // @ts-expect-error --- off is a function
            unsub.off("Transfer");
          } else {
            // @ts-expect-error --- off is a function
            unsub?.();
          }
        }
      }
    }

    this.assets.next({});
    this._assets = {};
    this.networks = [];
  }
}

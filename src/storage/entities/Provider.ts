import { SUBSTRATE_CHAINS, EVM_CHAINS } from "@src/constants/chainsData";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { BehaviorSubject } from "rxjs";
import { OlProvider } from "@src/services/ol/OlProvider";
import { ChainType } from "@src/types";
import { OL_CHAINS } from "@src/constants/chainsData/ol";
import { Provider as IProvider } from "@src/types";
import { JsonRpcProvider } from "ethers";

const RECONNECT_TIMEOUT = 20000;

export type api = {
  provider: IProvider;
  type: ChainType;
};

export type NetworkStatus = Record<string, string>;

export enum ChainStatus {
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
}

export class Provider {
  private providers: Record<string, api> = {};
  public statusNetwork = new BehaviorSubject<NetworkStatus>({});
  private intervals: {
    [key: string]: NodeJS.Timeout;
  } = {};

  public async setProvider(id: string, type: ChainType) {
    const status = this.statusNetwork.getValue();
    if (
      Object.keys(this.providers).includes(id) &&
      Object.keys(this.providers).length !== 0
    ) {
      if (type === ChainType.WASM) {
        const polkadotProvider = this.providers[id].provider as ApiPromise;
        if (!polkadotProvider.isConnected) await polkadotProvider.connect();
        this.intervals[id] = setInterval(async () => {
          try {
            if (!polkadotProvider.isConnected) {
              await polkadotProvider.connect();
            }
          } catch (error) {
            throw new Error("failed_to_connected_provider");
          }
        }, RECONNECT_TIMEOUT);
      } else if (type === ChainType.EVM) {
        const evmProvider = this.providers[id].provider as JsonRpcProvider;

        evmProvider._start();

        await evmProvider._waitUntilReady().then(() => {
          status[id] = ChainStatus.CONNECTED;
          this.statusNetwork.next(status);
        });

        this.intervals[id] = setInterval(async () => {
          const status = this.statusNetwork.getValue();
          evmProvider._start();
          await evmProvider._waitUntilReady().then(() => {
            if (status[id] === ChainStatus.CONNECTED) return;
            else {
              status[id] = ChainStatus.CONNECTED;
              this.statusNetwork.next(status);
            }
          });
        }, RECONNECT_TIMEOUT);
      } else if (type === ChainType.OL) {
        const olProvider = this.providers[id].provider as OlProvider;
        const isConnected = await olProvider.healthCheck();
        if (isConnected) {
          status[id] = ChainStatus.CONNECTED;
          this.statusNetwork.next(status);
        }

        this.intervals[id] = setInterval(async () => {
          const isConnected = await olProvider.healthCheck();
          if (isConnected) {
            status[id] = ChainStatus.CONNECTED;
            this.statusNetwork.next(status);
          }
        }, RECONNECT_TIMEOUT);
      }
    } else {
      const allChains = [SUBSTRATE_CHAINS, EVM_CHAINS, OL_CHAINS].flat();
      const _chain = allChains.find((chain) => chain.id === id);
      switch (type) {
        case ChainType.EVM: {
          const api = new JsonRpcProvider(_chain && (_chain.rpcs[0] as string));
          this.providers[id] = {
            provider: api,
            type: type,
          };
          status[id] = ChainStatus.CONNECTING;
          this.statusNetwork.next(status);
          api._start();

          await api._waitUntilReady().then(() => {
            if (status[id] !== ChainStatus.CONNECTED) {
              status[id] = ChainStatus.CONNECTED;
              this.statusNetwork.next(status);
            }
          });

          this.intervals[id] = setInterval(async () => {
            const status = this.statusNetwork.getValue();

            api._start();
            await api
              ._waitUntilReady()
              .then(() => {
                if (status[id] === ChainStatus.CONNECTED) return;
                else {
                  status[id] = ChainStatus.CONNECTED;
                  this.statusNetwork.next(status);
                }
              })
              .catch(async () => {
                const api = new JsonRpcProvider(
                  (_chain && _chain.rpcs[1]
                    ? _chain.rpcs[1]
                    : _chain && _chain.rpcs[0]) as string
                );
                this.providers[id] = {
                  provider: api,
                  type: type,
                };
                status[id] = ChainStatus.CONNECTING;
                this.statusNetwork.next(status);

                api._start();

                await api._waitUntilReady().then(() => {
                  if (status[id] !== ChainStatus.CONNECTED) {
                    status[id] = ChainStatus.CONNECTED;
                    this.statusNetwork.next(status);
                  }
                });
              });
          }, RECONNECT_TIMEOUT);
          break;
        }
        case ChainType.WASM:
          {
            const wsProvider = new WsProvider(_chain && _chain.rpcs, 10000);
            const api = new ApiPromise({ provider: wsProvider });
            this.providers[id] = {
              provider: api,
              type: type,
            };
            this.intervals[id] = setInterval(async () => {
              try {
                if (!(this.providers[id].provider as ApiPromise).isConnected) {
                  await (this.providers[id].provider as ApiPromise).connect();
                }
              } catch (error) {
                throw new Error("failed_to_connected_provider");
              }
            }, RECONNECT_TIMEOUT);
            this.activeListeners(api, id);
          }
          break;
        case ChainType.OL: {
          const olProvider = new OlProvider(_chain?.rpcs[0] as string);

          this.providers[id] = {
            provider: olProvider,
            type: type,
          };

          status[id] = ChainStatus.CONNECTING;
          this.statusNetwork.next(status);
          const isConnected = await olProvider.healthCheck();
          if (isConnected) {
            status[id] = ChainStatus.CONNECTED;
            this.statusNetwork.next(status);
          }

          this.intervals[id] = setInterval(async () => {
            const isConnected = await olProvider.healthCheck();
            if (isConnected) {
              status[id] = ChainStatus.CONNECTED;
              this.statusNetwork.next(status);
            }
          }, RECONNECT_TIMEOUT);

          break;
        }
      }
    }
  }

  public async disconnectChain(chain: string) {
    const status = this.statusNetwork.getValue();

    clearInterval(this.intervals[chain]);
    const chainType = this.providers[chain].type;

    switch (chainType) {
      case ChainType.WASM:
        await (this.providers[chain].provider as ApiPromise).disconnect();
        break;

      case ChainType.EVM:
      case ChainType.OL:
        {
          delete this.intervals[chain];
          status[chain] = ChainStatus.DISCONNECTED;
          this.statusNetwork.next(status);
        }
        break;
    }
  }

  public getProviders() {
    return this.providers;
  }

  public getChainStatus() {
    return this.statusNetwork;
  }

  public getProviderByChainId(chain: string) {
    return this.providers[chain];
  }

  public getOneChainStatus(chain: string) {
    const status = this.statusNetwork.getValue();
    return status[chain];
  }

  private activeListeners(api: ApiPromise, id: string) {
    const status = this.statusNetwork.getValue();
    api.on("ready", () => {
      status[id] = ChainStatus.CONNECTED;
      this.statusNetwork.next(status);
    });

    api.on("connected", () => {
      if (status[id]) {
        status[id] = ChainStatus.CONNECTED;
        this.statusNetwork.next(status);
        return;
      }
      status[id] = ChainStatus.CONNECTING;
      this.statusNetwork.next(status);
    });

    api.on("disconnected", () => {
      status[id] = ChainStatus.DISCONNECTED;
      this.statusNetwork.next(status);
    });

    api.on("error", () => {
      status[id] = ChainStatus.CONNECTING;
      api.disconnect();
      api.connect();
    });
  }

  public async reset() {
    const chainIds = Object.keys(this.providers);

    await Promise.all(
      chainIds.map(async (chain) => {
        await this.disconnectChain(chain);
      })
    );

    this.providers = {};
    this.statusNetwork = new BehaviorSubject<Record<string, string>>({});
    this.intervals = {};
  }
}

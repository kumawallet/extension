import { SUBTRATE_CHAINS, EVM_CHAINS } from "@src/constants/chainsData";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { ethers } from "ethers";
import { BehaviorSubject } from "rxjs";

export type api = {
  provider: ApiPromise | ethers.providers.JsonRpcProvider | {};
  type: "wasm" | "evm" | "ol";
};

export enum ChainStatus {
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  CONNECTING = "connecting",
}

export class Provider {
  private providers: Record<string, api> = {};
  public statusNetwork = new BehaviorSubject<Record<string, string>>({});
  private intervalsEVM: any = {};

  public async setProvider(id: string, type: "wasm" | "evm" | "ol") {
    if (
      Object.keys(this.providers).includes(id) &&
      Object.keys(this.providers).length !== 0
    ) {
      if (type === "wasm") {
        await (this.providers[id].provider as ApiPromise).connect();
        const intervalWasm = setInterval(() => {
          if ((this.providers[id].provider as ApiPromise).isConnected) {
            const status = this.statusNetwork.getValue();

            status[id] = ChainStatus.CONNECTED;
            this.statusNetwork.next(status);
            clearInterval(intervalWasm);
          }
        }, 6000);
      } else {
        await (
          this.providers[id].provider as ethers.providers.JsonRpcProvider
        ).ready.then(() => {
          const status = this.statusNetwork.getValue();

          if (status[id] === ChainStatus.DISCONNECTED) return;

          status[id] = ChainStatus.CONNECTED;
          this.statusNetwork.next(status);
        });
        this.intervalsEVM[id] = setInterval(async () => {
          // const status = this.statusNetwork.getValue();
          await (
            this.providers[id].provider as ethers.providers.JsonRpcProvider
          ).ready.then(() => {
            const status = this.statusNetwork.getValue();

            if (status[id] === ChainStatus.DISCONNECTED) return;

            if (status[id] === "connected") return;
            else {
              status[id] = ChainStatus.CONNECTED;
              this.statusNetwork.next(status);
            }
          });
        }, 6000);
      }
    } else {
      const allChains = [SUBTRATE_CHAINS, EVM_CHAINS].flat();
      const _chain = allChains.find((chain) => chain.id === id);
      switch (type) {
        case "evm": {
          const api = new ethers.providers.JsonRpcProvider(
            _chain && (_chain.rpcs[0] as string)
          );
          this.providers[id] = {
            provider: api,
            type: type,
          };
          status[id] = ChainStatus.CONNECTING;
          this.statusNetwork.next(status);
          await api.ready.then(() => {
            if (status[id] !== ChainStatus.CONNECTED) {
              status[id] = ChainStatus.CONNECTED;
              this.statusNetwork.next(status);
            }
          });

          this.intervalsEVM[id] = setInterval(async () => {
            const status = this.statusNetwork.getValue();
            await api.ready.then(() => {
              if (status[id] === "connected") return;
              else {
                status[id] = ChainStatus.CONNECTED;
                this.statusNetwork.next(status);
              }
            });
          }, 6000);
          break;
        }
        case "wasm":
          {
            const wsProvider = new WsProvider(_chain && _chain.rpcs);
            const api = new ApiPromise({ provider: wsProvider });
            this.providers[id] = {
              provider: api,
              type: type,
            };
            this.ActiveListeners(api, id);
          }
          break;
      }
    }
  }

  public async disconnectChain(chain: string) {
    const status = this.statusNetwork.getValue();
    if (this.providers[chain].type === "wasm") {
      await (this.providers[chain].provider as ApiPromise).disconnect();
    } else {
      clearInterval(this.intervalsEVM[chain]);
      delete this.intervalsEVM[chain];
      status[chain] = ChainStatus.DISCONNECTED;
      this.statusNetwork.next(status);
    }
  }
  public getProviders() {
    return this.providers;
  }
  public getChainStatus() {
    return this.statusNetwork;
  }
  public getOneProviders(chain: string) {
    return this.providers[chain];
  }

  public getOneChainStatus(chain: string) {
    const status = this.statusNetwork.getValue();
    return status[chain];
  }
  private ActiveListeners(api: ApiPromise, id: string) {
    const status = this.statusNetwork.getValue();
    api.on("ready", () => {
      status[id] = ChainStatus.CONNECTED;
      this.statusNetwork.next(status);
    });

    api.on("connected", () => {
      if (status[id]) {
        ChainStatus.CONNECTED;
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
}

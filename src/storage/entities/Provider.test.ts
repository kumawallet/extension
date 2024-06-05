import { ChainType } from "@src/types";
import { Provider } from "./Provider";
import { ApiPromise } from "@polkadot/api";
import { providers } from "ethers";
import { OlProvider } from "@src/services/ol/OlProvider";

const RECONNECT_TIMEOUT = 20000;

describe("Provider", () => {
  beforeAll(() => {
    vi.mock("ethers", async () => {
      const actual = await import("ethers");

      return {
        ...actual,
        providers: {
          ...actual.providers,
          JsonRpcProvider: class {
            ready = Promise.resolve(true);
          },
        },
      };
    });

    vi.mock("@polkadot/api", () => ({
      ApiPromise: vi.fn(() => ({
        connect: vi.fn(),
        isConnected: true,
        on: vi.fn(),
        disconnect: vi.fn(),
      })),
      WsProvider: vi.fn(() => ({})),
    }));

    vi.mock("@src/services/ol/OlProvider", () => ({
      OlProvider: vi.fn(() => ({
        healthCheck: vi.fn(),
      })),
    }));
  });

  it("should instance", () => {
    const provider = new Provider();
    expect(provider).toBeDefined();
  });

  describe("set providers", () => {
    describe("polkadot", () => {
      it("should set polkadot provider", async () => {
        const provider = new Provider();
        provider.setProvider("polkadot", ChainType.WASM);

        const providers = provider.getProviders();

        expect(providers.polkadot).toBeDefined();
      });

      it("should reconnect polkadot provider", async () => {
        const provider = new Provider();
        await provider.setProvider("polkadot", ChainType.WASM);

        const api = provider.getProviders().polkadot.provider as ApiPromise;
        await provider.setProvider("polkadot", ChainType.WASM);
        expect(api.connect).toHaveBeenCalled();
      });
    });

    describe("ethereum", () => {
      it("should set ethereum provider", () => {
        const provider = new Provider();
        provider.setProvider("ethereum", ChainType.EVM);

        const providers = provider.getProviders();
        expect(providers.ethereum).toBeDefined();
      });

      it("should reconnect ethereum provider", async () => {
        const provider = new Provider();
        await provider.setProvider("ethereum", ChainType.EVM);

        const api = provider.getProviders().ethereum
          .provider as providers.JsonRpcProvider;
        await provider.setProvider("ethereum", ChainType.EVM);

        const ready = await api.ready;

        expect(ready).toBe(true);
      });
    });

    describe("ol", () => {
      it("should set ol provider", () => {
        const provider = new Provider();
        provider.setProvider("ol", ChainType.OL);

        const providers = provider.getProviders();

        expect(providers.ol).toBeDefined();
      });

      it("should reconnect ol provider", async () => {
        const provider = new Provider();
        await provider.setProvider("ol", ChainType.OL);

        const api = provider.getProviders().ol.provider as OlProvider;
        await provider.setProvider("ol", ChainType.OL);

        expect(api.healthCheck).toHaveBeenCalled();
      });
    });
  });

  describe("disconnect chain", () => {
    it("should disconnect polkadot provider", async () => {
      const provider = new Provider();
      await provider.setProvider("polkadot", ChainType.WASM);

      const api = provider.getProviders().polkadot.provider as ApiPromise;

      await provider.disconnectChain("polkadot");

      expect(api.disconnect).toHaveBeenCalled();
    });

    it("should disconnect ethereum provider", async () => {
      const provider = new Provider();
      await provider.setProvider("ethereum", ChainType.EVM);

      await provider.disconnectChain("ethereum");

      const statuses = provider.getChainStatus().getValue();

      expect(statuses.ethereum).toBe("disconnected");
    });

    it("should disconnect ol provider", async () => {
      const provider = new Provider();
      await provider.setProvider("ol", ChainType.OL);

      await provider.disconnectChain("ol");

      const statuses = provider.getChainStatus().getValue();

      expect(statuses.ol).toBe("disconnected");
    });
  });

  it("get one provider", () => {
    const provider = new Provider();
    provider.setProvider("polkadot", ChainType.WASM);

    const polkadot = provider.getOneProviders("polkadot");

    expect(polkadot).toBeDefined();
  });

  it("get one chain status", () => {
    const provider = new Provider();
    provider.setProvider("ethereum", ChainType.EVM);

    const status = provider.getOneChainStatus("ethereum");

    expect(status).toBe("connecting");
  });

  it("reset", async () => {
    const provider = new Provider();
    provider.setProvider("ethereum", ChainType.EVM);

    await provider.reset();

    const status = provider.getChainStatus().getValue();
    const providers = provider.getProviders();

    expect(status).toEqual({});
    expect(providers).toEqual({});
  });
});

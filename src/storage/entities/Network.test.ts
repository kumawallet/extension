import Network from "./Network";
import { selectedEVMChainMock } from "@src/tests/mocks/chain-mocks";

describe("Network", () => {
  beforeAll(() => {
    vi.mock("./Accounts", () => ({
      default: {},
    }));
    vi.mock("./Account", () => ({
      default: {},
    }));
    vi.mock("./CacheAuth", () => ({
      default: {},
    }));
    vi.mock("./Vault", () => ({
      default: {},
    }));
    vi.mock("./BackUp", () => ({
      default: {},
    }));
    vi.mock("./settings/Settings", () => ({
      default: {},
    }));
    vi.mock("./registry/Registry", () => ({
      default: {},
    }));
    vi.mock("./activity/Activity", () => ({
      default: {},
    }));
    vi.mock("./Chains", () => ({
      default: {},
    }));
    vi.mock("./BaseEntity", () => {
      class baseEntityMock {
        static get() {
          return selectedEVMChainMock;
        }
        static set() {
          return "";
        }
      }
      return {
        default: baseEntityMock,
      };
    });
  });

  it("should instance", () => {
    const network = Network.getInstance();

    expect(network).toMatchObject({
      chain: null,
      selectedChain: {},
    });
  });

  it("should init", async () => {
    const network = await Network.init();

    expect(network).toBe(undefined);
  });

  it("should set new chain", async () => {
    Network.getInstance().set({ ethereum: selectedEVMChainMock });
    const network = await Network.get();

    expect(network).toMatchObject(selectedEVMChainMock);
  });

  it("should set new chain without static methods", async () => {
    const network = new Network();
    network.set({ ethereum: selectedEVMChainMock });
    const savedNetwork = network.get();

    expect(savedNetwork).toMatchObject({ ethereum: selectedEVMChainMock });
  });
});

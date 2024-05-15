import { HDKeyPair, SupportedKeyring } from "../types";
import WASMKeyring from "./WASMKeyring";

const mockMnemonic =
  "bag decide skirt parent embody rebuild parrot vapor bind dance assist say film swallow color";
describe("WASMKeyring", () => {
  beforeAll(() => {
    vi.mock("@src/storage/Auth", () => ({
      default: {
        password: "12345",
      },
    }));

    vi.mock("@polkadot/ui-keyring", () => ({
      default: {
        createFromUri: () => ({
          address: "13oi66HJu6d8AnNWQ1U2WFtt6P8APaj6zHTNah3xLB8TpzHT",
        }),
      },
    }));
  });

  it("should return next account path", () => {
    const wasmKeyring = new WASMKeyring(mockMnemonic);

    const path = wasmKeyring.getNextAccountPath();
    expect(path).toBe("/0");
  });

  it("should return address", async () => {
    const wasmKeyring = new WASMKeyring(mockMnemonic);

    const address = await wasmKeyring.getAddress(mockMnemonic);
    expect(address).toEqual("13oi66HJu6d8AnNWQ1U2WFtt6P8APaj6zHTNah3xLB8TpzHT");
  });

  describe("get key", () => {
    it("should return key", () => {
      const wasmKeyring = new WASMKeyring(mockMnemonic);

      const addressMock = "13oi66HJu6d8AnNWQ1U2WFtt6P8APaj6zHTNah3xLB8TpzHT";

      wasmKeyring.addKeyPair(addressMock, {
        path: "/0",
        key: mockMnemonic,
      } as HDKeyPair);
      const key = wasmKeyring.getKey(addressMock);
      expect(key).toBe(`${mockMnemonic}/0`);
    });

    it("should throw error if key pair not found", () => {
      const wasmKeyring = new WASMKeyring(mockMnemonic);

      const addressMock = "13oi66HJu6d8AnNWQ1U2WFtt6P8APaj6zHTNah3xLB8TpzHT";

      expect(() => wasmKeyring.getKey(addressMock)).toThrowError(
        "Key pair not found"
      );
    });
  });

  it("should return json object", () => {
    const keyring = WASMKeyring.fromJSON({
      mnemonic: mockMnemonic,
      keyPairs: {
        "13oi66HJu6d8AnNWQ1U2WFtt6P8APaj6zHTNah3xLB8TpzHT": {
          path: "/0",
        },
      },
    } as unknown as SupportedKeyring);

    expect(keyring.mnemonic).toBe(mockMnemonic);
  });
});

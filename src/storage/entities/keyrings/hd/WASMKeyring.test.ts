import {
  POLKADOT_ACCOUNT_MOCK,
  POLKADOT_SEED_MOCK,
} from "@src/tests/mocks/account-mocks";
import { HDKeyPair, SupportedKeyring } from "../types";
import WASMKeyring from "./WASMKeyring";

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
          address: POLKADOT_ACCOUNT_MOCK.value!.address,
        }),
      },
    }));
  });

  it("should return next account path", () => {
    const wasmKeyring = new WASMKeyring(POLKADOT_SEED_MOCK);

    const path = wasmKeyring.getNextAccountPath();
    expect(path).toBe("/0");
  });

  it("should return address", async () => {
    const wasmKeyring = new WASMKeyring(POLKADOT_SEED_MOCK);

    const address = await wasmKeyring.getAddress(POLKADOT_SEED_MOCK, 0);
    expect(address).toEqual(POLKADOT_ACCOUNT_MOCK.value!.address);
  });

  describe("get key", () => {
    it("should return key", () => {
      const wasmKeyring = new WASMKeyring(POLKADOT_SEED_MOCK);

      const addressMock = POLKADOT_ACCOUNT_MOCK.value!.address;

      wasmKeyring.addKeyPair(addressMock, {
        path: "/0",
        key: POLKADOT_SEED_MOCK,
      } as HDKeyPair);
      const key = wasmKeyring.getKey(addressMock);
      expect(key).toBe(`${POLKADOT_SEED_MOCK}/0`);
    });

    it("should throw error if key pair not found", () => {
      const wasmKeyring = new WASMKeyring(POLKADOT_SEED_MOCK);

      const addressMock = POLKADOT_ACCOUNT_MOCK.value!.address;

      expect(() => wasmKeyring.getKey(addressMock)).toThrowError(
        "Key pair not found"
      );
    });
  });

  it("should return json object", () => {
    const keyring = WASMKeyring.fromJSON({
      mnemonic: POLKADOT_SEED_MOCK,
      keyPairs: {
        [POLKADOT_ACCOUNT_MOCK.value!.address]: {
          path: "/0",
        },
      },
    } as unknown as SupportedKeyring);

    expect(keyring.mnemonic).toBe(POLKADOT_SEED_MOCK);
  });
});

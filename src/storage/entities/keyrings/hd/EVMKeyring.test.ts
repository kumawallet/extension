import EVMKeyring from "./EVMKeyring";
import { HDKeyPair, SupportedKeyring } from "../types";
import {
  EVM_ACCOUNT_MOCK,
  EVM_PRIVATE_KEY_MOCK,
  EVM_SEED_MOCK,
} from "@src/tests/mocks/account-mocks";

describe("EVMKeyring", () => {
  it("should return next account path", () => {
    const evmKeyring = new EVMKeyring(EVM_SEED_MOCK);

    const path = evmKeyring.getNextAccountPath();
    expect(path).toBe("m/44'/60'/0'/0/0");
  });

  it("should return address", async () => {
    const evmKeyring = new EVMKeyring(EVM_SEED_MOCK);

    const address = await evmKeyring.getAddress(EVM_SEED_MOCK);
    expect(address).toBe(EVM_ACCOUNT_MOCK.value!.address);
  });

  describe("get key", () => {
    it("should return key", () => {
      const evmKeyring = new EVMKeyring(EVM_SEED_MOCK);

      const addressMock = EVM_ACCOUNT_MOCK.value!.address;

      evmKeyring.addKeyPair(addressMock, {
        path: "m/44'/60'/0'/0/0",
        key: EVM_SEED_MOCK,
      } as HDKeyPair);
      const key = evmKeyring.getKey(addressMock);
      expect(key).toBe(EVM_SEED_MOCK);
    });

    it("should throw error if key pair not found", () => {
      const evmKeyring = new EVMKeyring(EVM_SEED_MOCK);

      const addressMock = EVM_ACCOUNT_MOCK.value!.address;

      expect(() => evmKeyring.getKey(addressMock)).toThrowError(
        "Key pair not found"
      );
    });
  });

  it("should return json object", () => {
    const keyring = EVMKeyring.fromJSON({
      mnemonic: EVM_SEED_MOCK,
      keyPairs: {
        [EVM_ACCOUNT_MOCK.value!.address]: {
          path: "m/44'/60'/0'/0/0",
        },
      },
    } as unknown as SupportedKeyring);

    expect(keyring.mnemonic).toBe(EVM_SEED_MOCK);
  });

  it("should throw error if mnemonic is invalid", () => {
    try {
      new EVMKeyring("invalid mnemonic");
    } catch (error) {
      expect(String(error)).toEqual("Error: Invalid mnemonic");
    }
  });

  it("should derive key pair", async () => {
    const evmKeyring = new EVMKeyring(EVM_SEED_MOCK);
    const address = await evmKeyring.deriveKeyPair(EVM_SEED_MOCK, 0);
    expect(address).toBe(EVM_ACCOUNT_MOCK.value!.address);
  });

  it("should return json object", () => {
    const evmKeyring = new EVMKeyring(EVM_SEED_MOCK);
    const result = evmKeyring.toJSON();

    expect(result.mnemonic).toBe(EVM_SEED_MOCK);
  });

  it("getDerivedPath", () => {
    const evmKeyring = new EVMKeyring(EVM_SEED_MOCK);
    const path = evmKeyring.getDerivedPath(EVM_SEED_MOCK, 0);
    expect(path).toBe(EVM_PRIVATE_KEY_MOCK);
  });
});

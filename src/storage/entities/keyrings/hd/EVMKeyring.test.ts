import EVMKeyring from "./EVMKeyring";
import { HDKeyPair, SupportedKeyring } from "../types";

const mockMnemonic =
  "bag decide skirt parent embody rebuild parrot vapor bind dance assist say film swallow color";
describe("EVMKeyring", () => {
  it("should return next account path", () => {
    const evmKeyring = new EVMKeyring(mockMnemonic);

    const path = evmKeyring.getNextAccountPath();
    expect(path).toBe("m/44'/60'/0'/0/0");
  });

  it("should return address", async () => {
    const evmKeyring = new EVMKeyring(mockMnemonic);

    const address = await evmKeyring.getAddress(mockMnemonic);
    expect(address).toBe("0x8792ae3fe19523E842888fE26a119d319a9A5Db5");
  });

  describe("get key", () => {
    it("should return key", () => {
      const evmKeyring = new EVMKeyring(mockMnemonic);

      const addressMock = "0x8792ae3fe19523E842888fE26a119d319a9A5Db5";

      evmKeyring.addKeyPair(addressMock, {
        path: "m/44'/60'/0'/0/0",
        key: mockMnemonic,
      } as HDKeyPair);
      const key = evmKeyring.getKey(addressMock);
      expect(key).toBe(mockMnemonic);
    });

    it("should throw error if key pair not found", () => {
      const evmKeyring = new EVMKeyring(mockMnemonic);

      const addressMock = "0x8792ae3fe19523E842888fE26a119d319a9A5Db5";

      expect(() => evmKeyring.getKey(addressMock)).toThrowError(
        "Key pair not found"
      );
    });
  });

  it("should return json object", () => {
    const keyring = EVMKeyring.fromJSON({
      mnemonic: mockMnemonic,
      keyPairs: {
        "0x8792ae3fe19523E842888fE26a119d319a9A5Db5": {
          path: "m/44'/60'/0'/0/0",
        },
      },
    } as unknown as SupportedKeyring);

    expect(keyring.mnemonic).toBe(mockMnemonic);
  });

  it("should throw error if mnemonic is invalid", () => {
    try {
      new EVMKeyring("invalid mnemonic");
    } catch (error) {
      expect(String(error)).toEqual("Error: Invalid mnemonic");
    }
  });

  it("should derive key pair", async () => {
    const evmKeyring = new EVMKeyring(mockMnemonic);
    const address = await evmKeyring.deriveKeyPair(mockMnemonic, 0);
    expect(address).toBe("0x8792ae3fe19523E842888fE26a119d319a9A5Db5");
  });

  it("should return json object", () => {
    const evmKeyring = new EVMKeyring(mockMnemonic);
    const result = evmKeyring.toJSON();

    expect(result.mnemonic).toBe(mockMnemonic);
  });
});

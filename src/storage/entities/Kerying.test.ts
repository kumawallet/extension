import { AccountKey, AccountType } from "@src/accounts/types";
import Keyring from "./Keyring";
import { ACCOUNT_PATH } from "@src/utils/constants";
import { vi } from "vitest";

const newKeyringMock = {
  key: "EVM-12345" as AccountKey,
  type: AccountType.EVM,
  seed: "1 2 3 4 5",
  path: ACCOUNT_PATH,
  privateKey: "12345",
  accountQuantity: 1,
};

describe("Keyring", () => {
  beforeAll(() => {
    vi.mock("./Vault", () => ({
      default: {},
    }));
  });

  it("should instance", () => {
    const keyring = new Keyring(
      newKeyringMock.key,
      newKeyringMock.type,
      newKeyringMock.seed,
      newKeyringMock.privateKey,
      newKeyringMock.accountQuantity
    );

    expect(keyring.key).toEqual(newKeyringMock.key);
    expect(keyring.type).toEqual(newKeyringMock.type);
    expect(keyring.seed).toEqual(newKeyringMock.seed);
    expect(keyring.privateKey).toEqual(newKeyringMock.privateKey);
    expect(keyring.accountQuantity).toEqual(newKeyringMock.accountQuantity);
    expect(keyring.path).toEqual(newKeyringMock.path);
  });

  it("should increment account quantity", () => {
    const keyring = new Keyring(
      newKeyringMock.key,
      newKeyringMock.type,
      newKeyringMock.seed,
      newKeyringMock.privateKey,
      newKeyringMock.accountQuantity
    );
    keyring.accountQuantity = newKeyringMock.accountQuantity + 1;
    keyring.increaseAccountQuantity();
    expect(keyring.accountQuantity).toEqual(3);
  });

  it("should decrease account quantity", () => {
    const keyring = new Keyring(
      newKeyringMock.key,
      newKeyringMock.type,
      newKeyringMock.seed,
      newKeyringMock.privateKey,
      newKeyringMock.accountQuantity
    );
    keyring.decreaseAccountQuantity();
    expect(keyring.accountQuantity).toEqual(0);
  });

  it("should return keyring as JSON", () => {
    const keyring = new Keyring(
      newKeyringMock.key,
      newKeyringMock.type,
      newKeyringMock.seed,
      newKeyringMock.privateKey,
      newKeyringMock.accountQuantity
    );

    const { key, ..._keyring } = newKeyringMock;

    key;
    const json = keyring.toJSON();
    expect(json).toEqual(_keyring);
  });

  describe("save", () => {
    it("should save in vault", async () => {
      const vaultGet = vi.fn().mockImplementation(() => ({
        addKeyring: vi.fn(),
      }));
      const vaultSet = vi.fn().mockImplementation(() => ({}));
      const Vault = await import("./Vault");
      Vault.default.set = vaultSet;
      Vault.default.get = vaultGet;

      await Keyring.save(newKeyringMock as Keyring);

      expect(vaultGet).toHaveBeenCalledOnce();
      expect(vaultSet).toHaveBeenCalledOnce();
    });

    it("should throw error", async () => {
      const vaultGet = vi.fn().mockImplementation(() => null);
      const Vault = await import("./Vault");
      Vault.default.get = vaultGet;

      try {
        await Keyring.save(newKeyringMock as Keyring);
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_save_keyring");
      }
    });
  });

  describe("remove", () => {
    it("should remove it in vault", async () => {
      const vaultGet = vi.fn().mockImplementation(() => ({
        removeKeyring: vi.fn(),
      }));
      const vaultSet = vi.fn().mockImplementation(() => ({}));
      const Vault = await import("./Vault");
      Vault.default.set = vaultSet;
      Vault.default.get = vaultGet;

      await Keyring.remove(newKeyringMock.key);

      expect(vaultGet).toHaveBeenCalledOnce();
      expect(vaultSet).toHaveBeenCalledOnce();
    });

    it("should throw error", async () => {
      const vaultGet = vi.fn().mockImplementation(() => null);
      const Vault = await import("./Vault");
      Vault.default.get = vaultGet;

      try {
        await Keyring.remove(newKeyringMock.key);
        throw new Error("bad test");
      } catch (error) {
        expect(String(error)).toEqual("Error: failed_to_remove_keyring");
      }
    });
  });
});

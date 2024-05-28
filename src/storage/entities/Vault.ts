import Storage from "../Storage";
import Auth from "../Auth";
import { AccountType, KeyringType } from "@src/accounts/types";
import { Keyrings, SupportedKeyring } from "./keyrings/types";
import EVMKeyring from "./keyrings/hd/EVMKeyring";
import WASMKeyring from "./keyrings/hd/WASMKeyring";
import ImportedEVMKeyring from "./keyrings/imported/ImportedEVMKeyring";
import ImportedWASMKeyring from "./keyrings/imported/ImportedWASMKeyring";
import OLKeyring from "./keyrings/hd/OLKeyring";
import ImportedOLKeyring from "./keyrings/imported/ImportedOLKeyring";

const STORAGE_NAME = "Vault";

export default class Vault {
  keyrings: Keyrings;

  private static instance: Vault;

  private constructor() {
    this.keyrings = {
      [AccountType.EVM]: undefined,
      [AccountType.WASM]: undefined,
      [AccountType.OL]: undefined,
      [AccountType.IMPORTED_EVM]: new ImportedEVMKeyring(),
      [AccountType.IMPORTED_WASM]: new ImportedWASMKeyring(),
      [AccountType.IMPORTED_OL]: new ImportedOLKeyring(),
    };
  }

  private static async getFromStorage(): Promise<Vault> {
    const vault = new Vault();
    const stored = await Storage.getInstance().storage.get(STORAGE_NAME);
    if (!stored || !stored[STORAGE_NAME]) throw new Error("vault_not_found");
    const data = (await Auth.getInstance().decryptVault(
      stored[STORAGE_NAME]
    )) as Vault;
    if (!data) {
      throw new Error("vault_not_found");
    }
    Vault.fromData(vault, data.keyrings);
    return vault;
  }

  static async getInstance(): Promise<Vault> {
    if (!this.instance) {
      this.instance = await Vault.getFromStorage();
    }
    return this.instance;
  }

  static async init() {
    await Vault.set(new Vault());
  }

  static migrations = async () => {
    const Allstored = await Storage.getInstance().storage.get(null);

    if (Allstored) {
      // migrate vault
      const foundOldVaultKey = Object.keys(Allstored).find(
        (key) => typeof Allstored[key] === "string" && key !== STORAGE_NAME
      );

      if (foundOldVaultKey) {
        const newVault = Allstored[foundOldVaultKey];
        await Storage.getInstance().storage.set({ [STORAGE_NAME]: newVault });
        await Storage.getInstance().storage.remove(foundOldVaultKey);
      }
    }
  };

  static alreadySignedUp = async () => {
    // migration
    await this.migrations();

    const stored = await Storage.getInstance().storage.get(null);

    return !!stored && Boolean(stored[STORAGE_NAME]);
  };

  static async getEncryptedVault(): Promise<string | undefined> {
    const stored = await Storage.getInstance().storage.get(STORAGE_NAME);
    if (!stored || !stored[STORAGE_NAME]) return undefined;
    return stored[STORAGE_NAME];
  }

  static fromData(
    vault: Vault,
    keyrings: {
      [key in KeyringType]: SupportedKeyring | undefined;
    }
  ): void {
    Object.keys(keyrings).forEach((keyringType: string) => {
      const keyring = keyrings[keyringType as KeyringType];
      if (keyring) {
        switch (keyringType) {
          case AccountType.EVM:
            vault.keyrings[keyringType] = EVMKeyring.fromJSON(keyring);
            break;
          case AccountType.WASM:
            vault.keyrings[keyringType] = WASMKeyring.fromJSON(keyring);
            break;
          case AccountType.OL:
            vault.keyrings[keyringType] = OLKeyring.fromJSON(keyring);
            break;
          case AccountType.IMPORTED_EVM:
            vault.keyrings[keyringType] = ImportedEVMKeyring.fromJSON(keyring);
            break;
          case AccountType.IMPORTED_WASM:
            vault.keyrings[keyringType] = ImportedWASMKeyring.fromJSON(keyring);
            break;
          case AccountType.IMPORTED_OL:
            vault.keyrings[keyringType] = ImportedOLKeyring.fromJSON(keyring);
            break;
        }
      }
    });
  }

  static async set(data: Vault): Promise<void> {
    const encryptedData = await Auth.getInstance().encryptVault(data);
    await Storage.getInstance().storage.set({ [STORAGE_NAME]: encryptedData });
    this.instance = await Vault.getFromStorage();
  }

  static async saveKeyring(keyring: SupportedKeyring) {
    const vault = await Vault.getInstance();
    vault.keyrings[keyring.type as KeyringType] = keyring;
    await Vault.set(vault);
  }

  static async getKeyring(
    type: Exclude<AccountType, AccountType.ALL>,
    createWithMnemonic?: string
  ): Promise<SupportedKeyring> {
    const vault = await Vault.getInstance();
    const keyring = vault.getKeyring(type);
    if (keyring) return keyring;
    if (createWithMnemonic) {
      return Vault.addHDKeyring(type, createWithMnemonic);
    }
    throw new Error("keyring_not_found");
  }

  private static async addHDKeyring(type: AccountType, mnemonic: string) {
    let keyring;

    switch (type) {
      case AccountType.EVM:
        keyring = new EVMKeyring(mnemonic);
        break;
      case AccountType.WASM:
        keyring = new WASMKeyring(mnemonic);
        break;
      case AccountType.OL:
        keyring = new OLKeyring(mnemonic);
        break;
      default:
        throw new Error("invalid_keyring_type");
    }

    await this.saveKeyring(keyring);
    return keyring;
  }

  static isInvalid(vault: Vault) {
    return !vault?.keyrings;
  }

  isEmpty() {
    return Object.values(this.keyrings).every((keyring) => !keyring);
  }

  setKeyring(type: KeyringType, keyring: SupportedKeyring) {
    this.keyrings[type] = keyring;
  }

  getKeyring(type: KeyringType) {
    return this.keyrings[type];
  }

  removeKeyring(type: KeyringType) {
    delete this.keyrings[type];
  }

  setKeyrings(keyrings: Keyrings) {
    this.keyrings = keyrings;
  }

  alreadyExists(type: KeyringType) {
    return this.keyrings[type] !== undefined;
  }
}

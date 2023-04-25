import Storage from "../Storage";
import Auth from "../Auth";
import { AccountType } from "../../accounts/types";
import { Keyrings, SupportedKeyring } from "./keyrings/types";
import EVMKeyring from "./keyrings/hd/EVMKeyring";
import WASMKeyring from "./keyrings/hd/WASMKeyring";
import ImportedEVMKeyring from "./keyrings/imported/ImportedEVMKeyring";
import ImportedWASMKeyring from "./keyrings/imported/ImportedWASMKeyring";
import HDKeyring from "./keyrings/hd/HDKeyring";

export default class Vault {
  keyrings: Keyrings;

  private static instance: Vault;

  private constructor() {
    this.keyrings = {
      [AccountType.EVM]: undefined,
      [AccountType.WASM]: undefined,
      [AccountType.IMPORTED_EVM]: new ImportedEVMKeyring(),
      [AccountType.IMPORTED_WASM]: new ImportedWASMKeyring(),
    };
  }

  private static async getFromStorage(): Promise<Vault> {
    const vault = new Vault();
    const stored = await Storage.getInstance().storage.get(this.name);
    if (!stored || !stored[this.name]) throw new Error("vault_not_found");
    if (!Auth.isSessionActive) await Auth.loadFromCache();
    const data = (await Auth.getInstance().decryptVault(
      stored[this.name]
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

  static async alreadySignedUp(): Promise<boolean> {
    const stored = await Storage.getInstance().storage.get(null);
    return !!stored && stored[this.name];
  }

  static async getEncryptedVault(): Promise<string | undefined> {
    const stored = await Storage.getInstance().storage.get(this.name);
    if (!stored || !stored[this.name]) return undefined;
    return stored[this.name];
  }

  static fromData(
    vault: Vault,
    keyrings: {
      [key in AccountType]: SupportedKeyring | undefined;
    }
  ): void {
    Object.keys(keyrings).forEach((keyringType: string) => {
      const keyring = keyrings[keyringType as AccountType];
      const mnemonic = (keyring as HDKeyring)?.mnemonic;
      if (keyring) {
        switch (keyringType) {
          case AccountType.EVM:
            if (!mnemonic) throw new Error("invalid_mnemonic");
            vault.keyrings[keyringType] = EVMKeyring.fromJSON(keyring);
            break;
          case AccountType.WASM:
            if (!mnemonic) throw new Error("invalid_mnemonic");
            vault.keyrings[keyringType] = WASMKeyring.fromJSON(keyring);
            break;
          case AccountType.IMPORTED_EVM:
            vault.keyrings[keyringType] = ImportedEVMKeyring.fromJSON(keyring);
            break;
          case AccountType.IMPORTED_WASM:
            vault.keyrings[keyringType] = ImportedWASMKeyring.fromJSON(keyring);
            break;
        }
      }
    });
  }

  static async set(data: Vault): Promise<void> {
    const encryptedData = await Auth.getInstance().encryptVault(data);
    await Storage.getInstance().storage.set({ [this.name]: encryptedData });
    this.instance = await Vault.getFromStorage();
  }

  static async saveKeyring(keyring: SupportedKeyring) {
    const vault = await Vault.getInstance();
    vault.keyrings[keyring.type] = keyring;
    await Vault.set(vault);
  }

  static async getKeyring(
    type: AccountType,
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
    const keyring =
      type === AccountType.EVM
        ? new EVMKeyring(mnemonic)
        : new WASMKeyring(mnemonic);
    await this.saveKeyring(keyring);
    return keyring;
  }

  static isInvalid(vault: Vault) {
    return !vault?.keyrings;
  }

  isEmpty() {
    return Object.values(this.keyrings).every((keyring) => !keyring);
  }

  setKeyring(type: AccountType, keyring: SupportedKeyring) {
    this.keyrings[type] = keyring;
  }

  getKeyring(type: AccountType) {
    return this.keyrings[type];
  }

  removeKeyring(type: AccountType) {
    delete this.keyrings[type];
  }

  setKeyrings(keyrings: Keyrings) {
    this.keyrings = keyrings;
  }

  alreadyExists(type: AccountType) {
    return this.keyrings[type] !== undefined;
  }
}

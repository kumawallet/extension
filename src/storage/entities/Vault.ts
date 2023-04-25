import BaseEntity from "./BaseEntity";
import Storage from "../Storage";
import Auth from "../Auth";
import { AccountType } from "../../accounts/types";
import { Keyrings, SupportedKeyring } from "./keyrings/types";
import EVMKeyring from "./keyrings/hd/EVMKeyring";
import WASMKeyring from "./keyrings/hd/WASMKeyring";
import ImportedEVMKeyring from "./keyrings/imported/ImportedEVMKeyring";
import ImportedWASMKeyring from "./keyrings/imported/ImportedWASMKeyring";

export default class Vault extends BaseEntity {
  keyrings: Keyrings;

  constructor() {
    super();
    this.keyrings = {
      [AccountType.EVM]: undefined,
      [AccountType.WASM]: undefined,
      [AccountType.IMPORTED_EVM]: undefined,
      [AccountType.IMPORTED_WASM]: undefined,
    };
  }

  static async init() {
    await Vault.set<Vault>(new Vault());
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

  static async get<Vault>(): Promise<Vault | undefined> {
    const stored = await Storage.getInstance().storage.get(this.name);
    if (!stored || !stored[this.name]) return this.getDefaultValue();
    if (!Auth.isSessionActive) await Auth.loadFromCache();
    const data = await Auth.getInstance().decryptVault(stored[this.name]);
    if (!data) throw new Error("invalid_credentials");
    return this.fromData(data);
  }

  static async set<Vault>(data: Vault): Promise<void> {
    const encryptedData = await Auth.getInstance().encryptVault(data as any);
    await super.set(encryptedData);
  }

  static async saveKeyring(keyring: SupportedKeyring) {
    const vault = await Vault.get<Vault>();
    if (!vault) throw new Error("vault_not_found");
    vault.keyrings[keyring.type] = keyring;
    await Vault.set(vault);
  }

  static async getKeyring(
    type: AccountType,
    seed?: string
  ): Promise<SupportedKeyring> {
    const vault = await Vault.get<Vault>();
    if (!vault) throw new Error("vault_not_found");
    const keyring = vault.keyrings[type] as SupportedKeyring;
    if (keyring) return keyring;
    switch (type) {
      case AccountType.EVM:
        if (!seed) throw new Error("invalid_seed");
        return new EVMKeyring(seed);
      case AccountType.WASM:
        if (!seed) throw new Error("invalid_seed");
        return new WASMKeyring(seed);
      case AccountType.IMPORTED_EVM:
        return new ImportedEVMKeyring();
      case AccountType.IMPORTED_WASM:
        return new ImportedWASMKeyring();
      default:
        throw new Error("invalid_keyring_type");
    }
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

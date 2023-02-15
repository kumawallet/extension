import { AccountKey, AccountType } from "@src/accounts/types";
import BaseEntity from "./BaseEntity";
import Keyring from "./Keyring";
import Storage from "../Storage";
import Auth from "../Auth";
import CacheAuth from "./CacheAuth";

export default class Vault extends BaseEntity {
  keyrings: { [key: AccountKey]: Keyring };

  constructor() {
    super();
    this.keyrings = {};
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
    if (!Auth.password || !Auth.isUnlocked) {
      await CacheAuth.loadFromCache();
    }
    const data = await Auth.getInstance().decryptVault(stored[this.name]);
    if (!data) throw new Error("invalid_credentials");
    return this.fromData(data);
  }

  static async set<Vault>(data: Vault): Promise<void> {
    const encryptedData = await Auth.getInstance().encryptVault(data as any);
    await super.set(encryptedData);
  }

  static async showPrivateKey(key: AccountKey): Promise<string | undefined> {
    const vault = await Vault.get<Vault>();
    if (!vault) throw new Error("failed_to_show_private_key");
    return vault?.keyrings[key]?.privateKey;
  }

  isEmpty() {
    return Object.keys(this.keyrings).length === 0;
  }

  addKeyring(keyring: Keyring) {
    this.keyrings[keyring.key] = keyring;
  }

  getKeyring(key: AccountKey) {
    return this.keyrings[key];
  }

  updateKeyring(key: AccountKey, value: Keyring) {
    this.keyrings[key] = value;
  }

  removeKeyring(key: AccountKey) {
    delete this.keyrings[key];
  }

  setKeyrings(keyrings: { [key: AccountKey]: Keyring }) {
    this.keyrings = keyrings;
  }

  getAll() {
    return Object.keys(this.keyrings).map((key) => {
      const { type, seed, privateKey, accountQuantity } =
        this.keyrings[key as AccountKey];
      return new Keyring(
        key as AccountKey,
        type,
        seed,
        privateKey,
        accountQuantity
      );
    });
  }

  getKeyringsByType(type: AccountType) {
    return this.getAll().find((keyring) => keyring.type === type);
  }

  allreadyExists(key: AccountKey) {
    return this.keyrings[key] !== undefined;
  }
}

import { VAULT } from "../../utils/constants";
import Keyring from "./Keyring";
import { AccountKey } from "./Accounts";
import Storable from "../Storable";
import Storage from "../Storage";
import { AccountType } from "@src/accounts/AccountManager";

export default class Vault extends Storable {
  keyrings: { [key: AccountKey]: Keyring };

  constructor() {
    super(VAULT);
    this.keyrings = {};
  }

  static async get(): Promise<Vault | undefined> {
    const stored = await Storage.getInstance().get(VAULT);
    if (!stored || !stored.keyrings) return undefined;
    const vault = new Vault();
    vault.setKeyrings(stored.keyrings);
    return vault;
  }

  static async set(vault: Vault) {
    await Storage.getInstance().set(VAULT, vault);
  }

  static async remove() {
    await Storage.getInstance().remove(VAULT);
  }

  static async showPrivateKey(key: AccountKey): Promise<string | undefined> {
    const vault = await Vault.get();
    if (!vault) throw new Error("Vault not found");
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

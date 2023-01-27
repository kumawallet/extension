import { VAULT } from "../../../utils/constants";
import Keyring from "./Keyring";
import { AccountKey } from "./Accounts";
import Storable from "../Storable";
import { AccountType } from "@src/utils/handlers/AccountManager";

export default class Vault extends Storable {
  keyrings: { [key: AccountKey]: Keyring };

  constructor() {
    super(VAULT);
    this.keyrings = {};
  }

  isEmpty() {
    return Object.keys(this.keyrings).length === 0;
  }

  add(keyring: Keyring) {
    this.keyrings[keyring.key] = keyring;
  }

  set(keyrings: { [key: AccountKey]: Keyring }) {
    this.keyrings = keyrings;
  }

  remove(key: AccountKey) {
    delete this.keyrings[key];
  }

  get(key: AccountKey) {
    return this.keyrings[key];
  }

  getAll() {
    return Object.keys(this.keyrings).map((key) => {
      const {
        key: _key,
        type,
        seed,
        privateKey,
      } = this.keyrings[key as AccountKey];
      return new Keyring(_key, type, seed, privateKey);
    });
  }

  getKeyringsByType(type: AccountType) {
    return this.getAll().find((keyring) => keyring.type === type);
  }

  update(key: AccountKey, value: Keyring) {
    this.keyrings[key] = value;
  }

  allreadyExists(key: AccountKey) {
    return this.keyrings[key] !== undefined;
  }
}
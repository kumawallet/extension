import { VAULT } from "../../utils/constants";
import Keyring from "./Keyring";
import { AccountKey } from "./Accounts";
import Storable from "../Storable";
import { AccountType } from "@src/utils/AccountManager";

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

  update(key: AccountKey, value: Keyring) {
    this.keyrings[key] = value;
  }

  allreadyExists(key: AccountKey) {
    return this.keyrings[key] !== undefined;
  }
}

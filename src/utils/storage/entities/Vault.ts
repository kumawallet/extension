import { VAULT } from "../../../utils/constants";
import Keyring from "./Keyring";
import { Storable } from "../Storage";
import { AccountKey } from "./Accounts";

export default class Vault extends Storable {
  #keyrings: { [key: AccountKey]: Keyring };

  constructor() {
    super(VAULT);
    this.#keyrings = {};
  }

  isEmpty() {
    return Object.keys(this.#keyrings).length === 0;
  }

  add(keyring: Keyring) {
    this.#keyrings[keyring.key] = keyring;
  }

  set(keyrings: { [key: AccountKey]: Keyring }) {
    this.#keyrings = keyrings;
  }

  remove(key: AccountKey) {
    delete this.#keyrings[key];
  }

  get(key: AccountKey) {
    return this.#keyrings[key];
  }

  update(key: AccountKey, value: Keyring) {
    this.#keyrings[key] = value;
  }

  allreadyExists(key: AccountKey) {
    return this.#keyrings[key] !== undefined;
  }
}

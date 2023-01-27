import { AccountType } from "../../../utils/handlers/AccountManager";
import { AccountKey } from "./Accounts";
import { ACCOUNT_PATH } from "../../constants";

export default class Keyring {
  readonly #key: AccountKey;
  readonly #type: AccountType;
  readonly #seed: string;
  readonly #path: string;
  readonly #privateKey: string;
  #accountQuantity: number;

  constructor(
    key: AccountKey,
    type: AccountType,
    seed: string,
    privateKey: string,
    accountQuantity?: number
  ) {
    this.#key = key;
    this.#accountQuantity = accountQuantity || 0;
    this.#path = ACCOUNT_PATH;
    this.#seed = seed;
    this.#type = type;
    this.#privateKey = privateKey;
  }

  get key() {
    return this.#key;
  }

  get type() {
    return this.#type;
  }

  get seed() {
    return this.#seed;
  }

  get path() {
    return this.#path;
  }

  get privateKey() {
    return this.#privateKey;
  }

  get accountQuantity() {
    return this.#accountQuantity;
  }

  set accountQuantity(accountQuantity: number) {
    this.#accountQuantity = accountQuantity;
  }

  nextKey() {
    this.increaseAccountQuantity();
    switch (this.#type) {
      case AccountType.EVM:
        return this.#path.slice(0, -1) + this.#accountQuantity;
      case AccountType.WASM:
        return `${this.#seed}/${this.#accountQuantity}`;
      default:
        throw new Error("Invalid account type");
    }
  }

  increaseAccountQuantity() {
    this.#accountQuantity++;
  }

  decreaseAccountQuantity() {
    this.#accountQuantity--;
  }

  toJSON() {
    return {
      type: this.#type,
      seed: this.#seed,
      path: this.#path,
      accountQuantity: this.#accountQuantity,
    };
  }
}

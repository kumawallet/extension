import { AccountType } from "../../../utils/handlers/AccountManager";
import { AccountKey } from "./Accounts";
import { ACCOUNT_PATH } from "../../constants";

export default class Keyring {
  readonly key: AccountKey;
  readonly #type: AccountType;
  readonly #seed: string;
  readonly #path: string;
  #accountQuantity: number;

  constructor(key: AccountKey, type: AccountType, seed: string) {
    this.key = key;
    this.#accountQuantity = 0;
    this.#path = ACCOUNT_PATH;
    this.#seed = seed;
    this.#type = type;
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

  get accountQuantity() {
    return this.#accountQuantity;
  }

  set accountQuantity(accountQuantity: number) {
    this.#accountQuantity = accountQuantity;
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

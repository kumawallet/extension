import { AccountType } from "../../accounts/AccountManager";
import { AccountKey } from "./Accounts";
import { ACCOUNT_PATH } from "../../utils/constants";

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
    this.#accountQuantity = accountQuantity || 1;
    this.#path = type == AccountType.EVM ? ACCOUNT_PATH : seed;
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

import { AccountKey, AccountType } from "@src/accounts/types";
import { ACCOUNT_PATH } from "../../utils/constants";
import Vault from "./Vault";

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

  static async save(keyring: Keyring): Promise<void> {
    const vault = await Vault.get<Vault>();
    if (!vault) throw new Error("failed_to_save_keyring");
    vault.addKeyring(keyring);
    await Vault.set(vault);
  }

  static async remove(keyring: AccountKey): Promise<void> {
    const vault = await Vault.get<Vault>();
    if (!vault) throw new Error("failed_to_remove_keyring");
    vault.removeKeyring(keyring);
    await Vault.set(vault);
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
      ...(this.#privateKey && { privateKey: this.#privateKey }),
    };
  }
}

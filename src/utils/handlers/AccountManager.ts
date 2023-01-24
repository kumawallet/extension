import Account, { AccountKey } from "../storage/Account";
import Storage from "../storage/Storage";

export enum AccountType {
  EVM = "EVM",
  WASM = "WASM",
}

export default abstract class AccountManager {
  #storage: Storage;
  abstract type: AccountType;

  constructor() {
    this.#storage = new Storage();
  }

  formatAddress(address: string): AccountKey {
    if (address.startsWith("WASM") || address.startsWith("EVM")) {
      return address as AccountKey;
    }
    return `${this.type}-${address}`;
  }

  saveAccount(account: Account, callback?: () => void) {
    const { key, value } = account;
    this.#storage.saveAccount(key, value, callback);
  }

  async getAccount(key: AccountKey): Promise<Account> {
    if (!key) throw new Error("Account key is required");
    return this.#storage.getAccount(key);
  }

  async add(account: Account, callback?: () => void) {
    const { key } = account;
    const exists = await this.getAccount(key);
    if (exists) {
      console.log("EXISTS", exists)
      //throw new Error("Account already exists");
    }
    this.saveAccount(account, callback);
  }

  async changeName(key: AccountKey, newName: string) {
    const account = await this.getAccount(key);
    account.value.name = newName;
    this.saveAccount(account);
  }

  async forget(key: AccountKey, callback?: () => void) {
    this.#storage.removeAccount(key, callback);
  }

  abstract addAccount(seed: string, name: string): Promise<void>;

  //async getAll(): Promise<Account[]> {
    //let accounts: Account[] = [];
    //this.#storage.all()
    // this.store.all((items) => (accounts = items));
    //return accounts;
  //}
}

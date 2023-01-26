import Account, { AccountKey } from "../storage/Account";
import Storage from "../storage/Storage";

export enum AccountType {
  EVM = "EVM",
  WASM = "WASM",
}

export default abstract class AccountManager {
  #storage: Storage;
  abstract type: AccountType;

  constructor(storage: Storage) {
    this.#storage = storage;
  }

  formatAddress(address: string): AccountKey {
    if (address.startsWith("WASM") || address.startsWith("EVM")) {
      return address as AccountKey;
    }
    return `${this.type}-${address}`;
  }

  saveAccount(account: Account, callback?: () => void) {
    this.#storage.saveAccount(account, callback);
  }

  async getAccount(key: AccountKey): Promise<Account | undefined> {
    if (!key) throw new Error("Account key is required");
    return this.#storage.getAccount(key);
  }

  async add(account: Account, callback?: () => void) {
    const { key } = account;
    const exists = await this.getAccount(key);
    if (exists) {
      throw new Error("Account already exists");
    }
    this.saveAccount(account, callback);
  }

  async changeName(key: AccountKey, newName: string) {
    const account = await this.getAccount(key);
    if (!account) throw new Error("Account not found");
    account.value.name = newName;
    this.saveAccount(account);
  }

  async forget(key: AccountKey, callback?: () => void) {
    this.#storage.removeAccount(key, callback);
  }

  async showPrivateKey(): Promise<string> {
    const { selectedAccount } = await this.#storage.getVault();
    if (!selectedAccount) throw new Error("No account selected");
    const account = await this.getAccount(selectedAccount);
    if (!account) throw new Error("Account not found");
    return account.value.privateKey;
  }

  abstract addAccount(seed: string, name: string): Promise<void>;

  async getAll(): Promise<Account[]> {
    const { accounts } = await this.#storage.getVault();
    return Object.keys(accounts).map((key) => accounts[key as AccountKey]);
  }
}

import { Account, AccountKey } from "../storage/entities/Accounts";
import Keyring from "../storage/entities/Keyring";
import Vault from "../storage/entities/Vault";
import Storage from "../storage/Storage";

export enum AccountType {
  EVM = "EVM",
  WASM = "WASM",
  IMPORTED_EVM = "IMPORTED_EVM",
  IMPORTED_WASM = "IMPORTED_WASM",
}

export default abstract class AccountManager {
  #storage: Storage;
  abstract type: AccountType;

  constructor() {
    this.#storage = Storage.getInstance();
  }

  abstract addAccount(seed: string, name: string): Promise<void>;

  formatAddress(address: string): AccountKey {
    if (address.startsWith("WASM") || address.startsWith("EVM") || address.startsWith("IMPORTED")) {
      return address as AccountKey;
    }
    return `${this.type}-${address}`;
  }

  async saveAccount(account: Account) {
    this.#storage.addAccount(account);
  }

  async saveKeyring(keyring: Keyring) {
    const stored = await this.#storage.getVault();
    if (!stored) throw new Error("Vault not found");
    const vault = new Vault();
    vault.set(stored);
    vault.add(keyring);
    this.#storage.setVault(vault);
  }

  async getAccount(key: AccountKey): Promise<Account | undefined> {
    if (!key) throw new Error("Account key is required");
    return this.#storage.getAccount(key);
  }

  async changeName(key: AccountKey, newName: string) {
    const account = await this.getAccount(key);
    if (!account) throw new Error("Account not found");
    account.value.name = newName;
    this.#storage.updateAccount(account);
  }

  async forget(key: AccountKey) {
    this.#storage.removeAccount(key);
  }

  async showPrivateKey(): Promise<string> {
    const selectedAccount = await this.#storage.getSelectedAccount();
    if (!selectedAccount) throw new Error("No account selected");
    const vault = await this.#storage.getVault();
    if (!vault) throw new Error("Vault not found");
    return vault?.keyrings[selectedAccount]?.seed;
  }

  async getAll(): Promise<Account[]> {
    const accounts = await this.#storage.getAccounts();
    return Object.keys(accounts.accounts).map((key) => accounts.get(key as AccountKey));
  }
}

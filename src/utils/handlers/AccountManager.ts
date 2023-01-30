import { Account, AccountKey, Accounts } from "../storage/entities/Accounts";
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

  abstract addAccount(
    seed: string,
    name: string,
    path?: string,
    keyring?: Keyring
  ): Promise<void>;

  async derive(name: string, vault: Vault) {
    const keyring = await vault.getKeyringsByType(this.type);
    if (!keyring) throw new Error("Keyring not found");

    const newPath = keyring.nextKey();
    this.addAccount(keyring.seed, name, newPath, keyring);
  }

  formatAddress(address: string): AccountKey {
    if (
      address.startsWith("WASM") ||
      address.startsWith("EVM") ||
      address.startsWith("IMPORTED")
    ) {
      return address as AccountKey;
    }
    return `${this.type}-${address}`;
  }

  async saveAccount(account: Account) {
    this.#storage.addAccount(account);
  }

  async saveKeyring(keyring: Keyring) {
    this.#storage.saveKeyring(keyring);
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

  async showPrivateKey(): Promise<string | undefined> {
    const selectedAccount = await this.#storage.getSelectedAccount();
    if (!selectedAccount) return undefined;
    const vault = await this.#storage.getVault();
    if (!vault) throw new Error("Vault not found");
    return vault?.keyrings[selectedAccount.key]?.privateKey;
  }

  async getAll(): Promise<Accounts | undefined> {
    const accounts = await this.#storage.getAccounts();
    if (!accounts) return undefined;
    return accounts;
  }
}

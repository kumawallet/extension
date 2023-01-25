import State from "./storage/Vault";
import AccountManager, { AccountType } from "./handlers/AccountManager";
import EVMHandler from "./handlers/EVMHandler";
import WASMHandler from "./handlers/WASMHandler";
import Account, { AccountKey } from "./storage/Account";
import Auth from "./storage/Auth";

const storage = chrome.storage.local;

export default class Extension {
  #accountType: AccountType;

  constructor(accountType: AccountType = AccountType.EVM) {
    this.#accountType = accountType;
  }

  get accountType(): AccountType {
    return this.#accountType;
  }

  set accountType(accountType: AccountType) {
    this.#accountType = accountType;
  }

  get accountManager(): AccountManager {
    switch (this.#accountType) {
      case AccountType.EVM:
        return new EVMHandler();
      case AccountType.WASM:
        return new WASMHandler();
      default:
        throw new Error("Invalid account type");
    }
  }

  get auth(): Auth {
    return new Auth();
  }

  addAccount({ seed, name }: any) {
    this.accountManager.addAccount(seed, name);
  }

  removeAccount(key: AccountKey) {
    this.accountManager.forget(key);
  }

  changeAccountName({ key, newName }: any) {
    this.accountManager.changeName(key, newName);
  }

  changePassword(seedOrPrivateKey: string, newPassword: string) {
    this.auth.changePassword(seedOrPrivateKey, newPassword);
  }

  async signIn(password: string) {
    const vault = await this.accountManager.getEncryptedVault();
    this.auth.signIn(password, vault);
  }

  exportAccount() {
    //this.accountManager.export();
  }

  async getAccount(key: AccountKey): Promise<Account | undefined> {
    return this.accountManager.getAccount(key);
  }

  async getAllAccounts(): Promise<Account[]> {
    const accounts: Account[] = [];
    const accountsInStorage = await storage.get(null);
    Object.keys(accountsInStorage).forEach((key) => {
      if (key.includes("WASM") || key.includes("EVM")) {
        accounts.push(new Account(key as AccountKey, accountsInStorage[key]));
      }
    });

    return accounts;
  }
}

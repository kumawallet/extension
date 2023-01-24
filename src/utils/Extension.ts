import State from "./storage/State";
import AccountManager, { AccountType } from "./handlers/AccountManager";
import EVMHandler from "./handlers/EVMHandler";
import WASMHandler from "./handlers/WASMHandler";
import { formatAccount } from "./account-utils";

const storage = chrome.storage.local;

export default class Extension {
  readonly #state: State;
  #accountType: AccountType;

  constructor(state: State, accountType: AccountType = AccountType.EVM) {
    this.#state = state;
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

  addAccount({ seed, name }: any) {

    this.accountManager.add(seed, name);
  }

  changeAccountName({ key, newName }: any) {
    this.accountManager.changeName(key, newName);
  }

  changeAccountPassword() {
    this.accountManager.changePassword();
  }

  signInAccount() {
    this.accountManager.signIn();
  }

  forgetAccount() {
    this.accountManager.forget();
  }

  exportAccount() {
    this.accountManager.export();
  }

  getAccount() {
    this.accountManager.get();
  }

  async getAllAccounts() {
    const accouts: any[] = [];

    const accountsInStorage = await storage.get(null);

    Object.keys(accountsInStorage).forEach((key) => {
      if (key.includes("WASM") || key.includes("EVM")) {
        const { address, type } = formatAccount(key);
        accouts.push({
          [address]: {
            ...accountsInStorage[key],
            accountType: type,
          },
        });
      }
    });

    return accouts;
  }
}

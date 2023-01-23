import State from "./storage/State";
import AccountManager from "./handlers/AccountManagerInterface";
import EVMHandler from "./handlers/EVMHandler";
import WASMHandler from "./handlers/WASMHandler";

export enum AccountType {
  EVM = "EVM",
  WASM = "WASM",
}

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

  createAccount({ password, seed }: any) {
    this.accountManager.create(password, seed);
  }

  importAccount({ password, seed }: any) {
    this.accountManager.import(password, seed);
  }

  changeAccountName() {
    this.accountManager.changeName();
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

  getAllAccounts() {
    return this.accountManager.getAll();
  }
}

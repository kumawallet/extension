import AccountManager from "./AccountManagerInterface";
import { BrowserStore } from "../storage/BrowserStore";

export default class WASMHandler implements AccountManager {
  private readonly store: BrowserStore = new BrowserStore();

  constructor() {}

  create(password: string, seed: string) {
    // validate allready exists
    // validate password
    // validate seed
    // keyring.addFromUri(seed, { name: 'default' });
    this.store.set(password, seed);
  }
  import(password: string, seed: string) {}
  changeName() {}
  changePassword() {}
  signIn() {}
  forget() {}
  export() {}
  get() {}
  getAll(): any[] {
    let accounts: any[] = [];
    this.store.all((items) => (accounts = items));
    return accounts;
  }
  derive() {}
}

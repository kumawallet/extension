import AccountManager from "./AccountManagerInterface";

const storage = chrome.storage.local;

export default class WASMHandler implements AccountManager {

  create(password: string, seed: string) {
    // validate allready exists
    // validate password
    // validate seed
    // keyring.addFromUri(seed, { name: 'default' });
    storage.set({ password, seed }, () => console.log("Account created"));
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

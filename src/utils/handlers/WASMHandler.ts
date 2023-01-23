import AccountManager from "./AccountManagerInterface";

export default class WASMHandler implements AccountManager {
  create(password: string, seed: string) {
    // validate allready exists
    // validate password
    // validate seed
    // keyring.addFromUri(seed, { name: 'default' });
  }
  import(password: string, seed: string) {

  }
  changeName() {}
  changePassword() {}
  signIn() {}
  forget() {}
  export() {}
  get() {}
  getAll() {}
  derive() {}
}

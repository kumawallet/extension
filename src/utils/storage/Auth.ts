import Storage from "./Storage";

export default class Auth {
  #storage: Storage;
  constructor() {
    this.#storage = new Storage();
  }

  changePassword(
    seedOrPrivateKey: string,
    newPassword: string,
    callback?: () => void
  ) {
    //
    //(newPassword, callback)
  }

  signIn(password: string, callback?: () => void) {
    //
    //isUnlocked = true;
    // save on storage the decrypted PK
  }

  signOut() {
    //
    //isUnLocked = false;
  }
}

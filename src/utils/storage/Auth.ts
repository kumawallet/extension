import Storage from "./Storage";
import passworder from "@metamask/browser-passworder";

export default class Auth {
  #storage: Storage;
  #isUnlocked: boolean;
  #vault: any | undefined; // This is the storage data decrypted on memory
  #password: string | undefined;

  constructor() {
    this.#storage = new Storage();
    this.#isUnlocked = false;
    this.#password = undefined;
    this.#vault = this.loadVault();
  }

  get isUnlocked() {
    return this.#isUnlocked;
  }

  get vault(): any {
    return this.#vault;
  }

  async signUp({ password }: any, callback?: () => void) { 
    try {
      const encryptedVault = await passworder.encrypt(password, {});
      this.#storage.setVault(encryptedVault, callback);
      this.#vault = encryptedVault;
      this.#password = password;
      this.#isUnlocked = true;
    } catch (error) {
      throw new Error(error as string);
    }
  }

  async loadVault() {
    try {
      const encryptedVault  = await this.#storage.getVault();
      this.#vault = encryptedVault || undefined;
    } catch (error) {
      throw new Error(error as string);
    }
  }

  async signIn({ password }: any, callback?: () => void) {
    try {
      this.#vault = await passworder.decrypt(password, this.#vault.vault);
      if (!this.#vault) {
        throw new Error("Invalid password");
      }
      this.#password = password;
      this.#isUnlocked = true;
      callback && callback();
    } catch (error) {
      this.#password = undefined;
      throw new Error(error as string);
    }
  }

  signOut() {
    try {
      this.#isUnlocked = false;
      this.#password = undefined;
      this.#vault = undefined;
    } catch (error) {
      throw new Error(error as string);
    }
  }
}

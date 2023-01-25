import Storage from "./Storage";
import passworder from "@metamask/browser-passworder";

export default class Auth {
  #storage: Storage;
  #isUnlocked: boolean;
  #vault: any; // This is the storage data decrypted on memory
  #password: string | undefined;

  constructor() {
    this.#storage = new Storage();
    this.#isUnlocked = false;
    this.#password = undefined;
  }

  get isUnlocked() {
    return this.#isUnlocked;
  }

  get vault(): any {
    return this.#vault;
  }

  async encryptVault(callback?: () => void) {
    try {
      const encryptedVault = await passworder.encrypt(
        this.#password as string,
        this.#vault
      );
      this.#storage.setVault(encryptedVault, callback);
    } catch (error) {
      throw new Error(error as string);
    }
  }

  async loadVault() {
    try {
      this.#vault = await this.#storage.getVault();
    } catch (error) {
      throw new Error(error as string);
    }
  }

  async signUp({ password }: any, callback?: () => void) {
    try {
      this.#vault = {};
      this.#password = password;
      this.encryptVault(callback);
      this.#isUnlocked = true;
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

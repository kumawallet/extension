import passworder from "@metamask/browser-passworder";
import Vault from "./Vault";

export default class Auth {
  #isUnlocked: boolean;
  #password: string | undefined;

  constructor() {
    this.#isUnlocked = false;
    this.#password = undefined;
  }

  get isUnlocked() {
    return this.#isUnlocked;
  }

  async decryptVault(vault: string) {
    try {
      if (!this.#isUnlocked || !this.#password) {
        throw new Error("Vault is not unlocked");
      }
      return (await passworder.decrypt(
        this.#password as string,
        vault
      )) as Vault;
    } catch (error) {
      throw new Error(error as string);
    }
  }

  async encryptVault(vault: Vault) {
    try {
      if (!this.#isUnlocked || !this.#password) {
        throw new Error("Vault is not unlocked");
      }
      return passworder.encrypt(
        this.#password as string,
        vault
      );
    } catch (error) {
      throw new Error(error as string);
    }
  }

  async signUp({ password }: any, callback?: () => void) {
    try {
      this.#password = password;
      this.#isUnlocked = true;
      callback && callback();
    } catch (error) {
      throw new Error(error as string);
    }
  }

  async signIn(password: string, vault: string, callback?: () => void) {
    try {
      const decryptedVault = (await passworder.decrypt(password, vault)) as Vault;
      if (!decryptedVault) {
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
    } catch (error) {
      throw new Error(error as string);
    }
  }
}

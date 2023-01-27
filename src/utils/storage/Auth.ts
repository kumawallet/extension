import passworder from "@metamask/browser-passworder";
import Vault from "./entities/Vault";

export default class Auth {
  #isUnlocked: boolean;
  #password: string | undefined;

  private static instance: Auth;

  private constructor() {
    this.#isUnlocked = false;
    this.#password = undefined;
  }

  public static getInstance() {
    if (!Auth.instance) {
      Auth.instance = new Auth();
    }
    return Auth.instance;
  }

  static get isUnlocked() {
    return Auth.getInstance().#isUnlocked;
  }

  static get password() {
    return Auth.getInstance().#password;
  }

  static setAuth({ password, isUnlocked }: any) {
    Auth.getInstance().#password = password;
    Auth.getInstance().#isUnlocked = isUnlocked;
  }

  async decryptVault(vault: string) {
    try {
      if (!this.#isUnlocked || !this.#password) {
        throw new Error("Vault is not unlocked");
      }
      return (await passworder.decrypt(
        this.#password as string,
        vault
      ));
    } catch (error) {
      throw new Error(error as string);
    }
  }

  async encryptVault(vault: Vault) {
    try {
      if (!this.#isUnlocked || !this.#password) {
        throw new Error("Vault is not unlocked");
      }
      return passworder.encrypt(this.#password as string, vault);
    } catch (error) {
      throw new Error(error as string);
    }
  }

  async signUp({ password }: any) {
    try {
      this.#password = password;
      this.#isUnlocked = true;
    } catch (error) {
      throw new Error(error as string);
    }
  }

  async signIn(password: string, vault: string) {
    try {
      if (!vault) throw new Error("Vault not found");
      const decryptedVault = (await passworder.decrypt(
        password,
        vault
      )) as Vault;
      if (!decryptedVault) {
        throw new Error("Invalid password");
      }
      this.#password = password;
      this.#isUnlocked = true;
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

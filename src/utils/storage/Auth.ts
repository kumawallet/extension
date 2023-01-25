import Storage from "./Storage";
import passworder from "@metamask/browser-passworder";

export default class Auth {
  #storage: Storage;
  #password: string;
  #isUnlocked: boolean;
  #vault: any;

  constructor() {
    this.#storage = new Storage();
    this.#password = "";
    this.#isUnlocked = false;
  }

  get isUnlocked() {
    return this.#isUnlocked;
  }

  get vault(): any {
    return this.#vault;
  }

  changePassword(
    seedOrPrivateKey: string,
    newPassword: string,
    callback?: () => void
  ) {
    //
    //(newPassword, callback)
  }

  async loadVault() {
    try {
      const encryptedVault = await this.#storage.getStorage().get("vault");
      console.log("encrypted vault", encryptedVault);
      this.#vault = encryptedVault;
    } catch (error) {
      throw new Error(error as string);
    }
  }

  async signIn({ password, seed }: any, callback?: () => void) {
    try {
      const encryptedSeed = await passworder.encrypt(password, seed);
      this.#storage.saveAccount("vault" as any, encryptedSeed as any);
      this.#isUnlocked = true;
      this.#password = password;
    } catch (error) {
      throw new Error(error as string);
    }
  }

  async unlock(password: string, callback?: () => void): Promise<boolean> {
    try {
      const { vault: encryptedVault } = await this.#storage
        .getStorage()
        .get("vault");
      if (!encryptedVault) {
        throw new Error("There is no vault");
      }

      console.log(encryptedVault);

      const decryptedVault = await passworder.decrypt(
        password,
        encryptedVault as any
      );

      if (!decryptedVault) {
        throw new Error("Invalid password");
      }
      this.#vault = decryptedVault;
      this.#password = password;
      this.#isUnlocked = true;
      return true;
    } catch (error) {
      throw new Error(error as string);
    }
  }

  signOut() {
    //
    //isUnLocked = false;
  }
}

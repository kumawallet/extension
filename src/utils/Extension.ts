import { VAULT } from "./constants";
import AccountManager, { AccountType } from "./AccountManager";
import { Account, AccountKey } from "./storage/entities/Accounts";
import Auth from "./storage/Auth";
import Storage from "./storage/Storage";
import { Chain } from "@src/contants/chains";
import { Network } from "./storage/entities/Network";

export default class Extension {
  private static async init(password: string, force?: boolean) {
    try {
      await Auth.getInstance().signUp({ password });
      await Storage.getInstance().init(force);
      await Storage.getInstance().cachePassword();
    } catch (error) {
      console.error(error);
      throw new Error(error as string);
    }
  }

  static async signUp({ seed, name = "New Account", password }: any) {
    try {
      if (!seed || !password) throw new Error("Missing data");
      await this.init(password);
      await AccountManager.addWASMAccount(seed, name);
      await AccountManager.addEVMAccount(seed, name);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  static async importAccount({
    name = "New Account",
    privateKeyOrSeed,
    password,
    accountType,
  }: any) {
    try {
      if (!privateKeyOrSeed || !password) throw new Error("Missing data");
      await this.init(password);
      await AccountManager.importAccount({
        name,
        privateKeyOrSeed,
        accountType,
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  static removeAccount(key: AccountKey) {
    AccountManager.forget(key);
  }

  static changeAccountName({ key, newName }: any) {
    AccountManager.changeName(key, newName);
  }

  static async signIn(password: string) {
    try {
      // Get encrypted vault from storage
      const { vault } = await Storage.getInstance().getStorage().get(VAULT);
      // Decrypt vault with password
      await Auth.getInstance().signIn(password, vault);
      // Cache password
      await Storage.getInstance().cachePassword();
      return true;
    } catch (error) {
      console.log("error", error);
      return false;
    }
  }

  static isVaultInitialized() {
    return Storage.getInstance().isVaultInitialized();
  }

  static isUnlocked() {
    return Auth.isUnlocked;
  }

  static showPrivateKey() {
    return AccountManager.showPrivateKey();
  }

  static async getAccount(key: AccountKey): Promise<Account | undefined> {
    return AccountManager.getAccount(key);
  }

  static async getAllAccounts(): Promise<Account[]> {
    const accounts = await AccountManager.getAll();
    if (!accounts) return [];
    return accounts.getAll();
  }

  static async derivateAccount(
    name: string,
    type: AccountType
  ): Promise<Account> {
    const vault = await Storage.getInstance().getVault();
    if (!vault) throw new Error("Vault not found");
    return AccountManager.derive(name, vault, type);
  }

  static async setNetwork(chain: Chain): Promise<boolean> {
    const vault = await Storage.getInstance().getVault();
    if (!vault) throw new Error("Vault not found");
    const network = Network.getInstance();
    network.set(chain);
    await Storage.getInstance().setNetwork(network);
    return true;
  }
}

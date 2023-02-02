import { VAULT } from "./constants";
import AccountManager from "./AccountManager";
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

  static async createAccounts({
    seed,
    name = "New Account",
    password,
    isSignUp = true,
  }: any) {
    try {
      if (!seed) throw new Error("Cannot create accounts without seed");
      if (isSignUp) {
        if (!password) throw new Error("Missing password");
        await this.init(password, true);
      }
      const isUnlocked = await Extension.isUnlocked();
      if (!isUnlocked) throw new Error("Vault is locked");
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
    isSignUp = true,
  }: any) {
    try {
      if (!privateKeyOrSeed) throw new Error("Cannot import accounts without seed or private key");
      if (isSignUp) {
        if (!password) throw new Error("Missing password");
        await this.init(password, true);
      }
      const isUnlocked = await Extension.isUnlocked();
      if (!isUnlocked) throw new Error("Vault is locked");
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

  static async areKeyringsInitialized(): Promise<boolean> {
    try {
      const vault = await Storage.getInstance().getVault();
      if (!vault) return false;
      return AccountManager.areKeyringsInitialized(vault);
    } catch (error) {
      console.error(error);
      return false;
    }
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

  static async deriveAccount({ name, accountType }: any): Promise<Account> {
    const vault = await Storage.getInstance().getVault();
    if (!vault) throw new Error("Vault not found");
    return AccountManager.derive(name, vault, accountType);
  }

  static async setNetwork(chain: Chain): Promise<boolean> {
    const vault = await Storage.getInstance().getVault();
    if (!vault) throw new Error("Vault not found");
    const network = Network.getInstance();
    network.set(chain);
    await Storage.getInstance().setNetwork(network);
    return true;
  }

  static async setSelectedAccount(account: Account) {
    await Storage.getInstance().setSelectedAccount(account);
  }
}

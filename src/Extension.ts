import { VAULT } from "./utils/constants";
import AccountManager, { AccountType } from "./accounts/AccountManager";
import { Account, AccountKey } from "./storage/entities/Accounts";
import Auth from "./storage/Auth";
import Storage from "./storage/Storage";
import { Chain } from "@src/contants/chains";
import { Network } from "./storage/entities/Network";

export default class Extension {
  private static async init(
    password: string,
    recoveryPhrase: string,
    force?: boolean
  ) {
    try {
      await Auth.getInstance().signUp({ password });
      await Storage.getInstance().init(force);
      await Storage.getInstance().cachePassword();
      await AccountManager.saveBackup(recoveryPhrase);
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
    if (!seed) throw new Error("Cannot create accounts without seed");
    if (isSignUp) {
      if (!password) throw new Error("Missing password");
      await this.init(password, seed, true);
    }
    const isUnlocked = await Extension.isUnlocked();
    if (!isUnlocked) throw new Error("Vault is locked");
    await AccountManager.addWASMAccount(seed, name);
    await AccountManager.addEVMAccount(seed, name);
    return true;
  }

  static async importAccount({
    name = "New Account",
    privateKeyOrSeed,
    password,
    accountType,
    isSignUp = true,
  }: any) {
    if (!privateKeyOrSeed)
      throw new Error("Cannot import accounts without seed or private key");
    if (isSignUp) {
      if (!password) throw new Error("Missing password");
      await this.init(password, privateKeyOrSeed, true);
    }
    const isUnlocked = await Extension.isUnlocked();
    if (!isUnlocked) throw new Error("Vault is locked");
    await AccountManager.importAccount({
      name,
      privateKeyOrSeed,
      accountType,
    });
  }

  static async restorePassword({ recoveryPhrase, newPassword }: any) {
    if (!recoveryPhrase)
      throw new Error("Cannot restore password without seed or private key");
    if (!newPassword) throw new Error("Missing password");
    await AccountManager.restorePassword(recoveryPhrase, newPassword);
  }

  static removeAccount(key: AccountKey) {
    AccountManager.forget(key);
  }

  static changeAccountName({ key, newName }: any) {
    AccountManager.changeName(key, newName);
  }

  static async signIn(password: string) {
    const { vault } = await Storage.getInstance().storage.get(VAULT);
    await Auth.getInstance().signIn(password, vault);
    await Storage.getInstance().cachePassword();
  }

  static alreadySignedUp() {
    return Storage.getInstance().alreadySignedUp();
  }

  static async areAccountsInitialized(): Promise<boolean> {
    try {
      const accounts = await Storage.getInstance().getAccounts();
      if (!accounts) return false;
      return AccountManager.areAccountsInitialized(accounts);
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  static async signOut() {
    Auth.getInstance().signOut();
    await Storage.getInstance().clearCache();
  }

  static async isUnlocked() {
    await Storage.getInstance().loadFromCache();
    return Auth.isUnlocked;
  }

  static async showPrivateKey(): Promise<string | undefined> {
    const selectedAccount = await Storage.getInstance().getSelectedAccount();
    if (!selectedAccount || !selectedAccount.key) return undefined;
    return AccountManager.showPrivateKey(selectedAccount.key);
  }

  static async getAccount(key: AccountKey): Promise<Account | undefined> {
    return AccountManager.getAccount(key);
  }

  static async getAllAccounts(
    type: AccountType[] | null = null
  ): Promise<Account[]> {
    const accounts = await AccountManager.getAll(type);
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

  static async getSelectedAccount(): Promise<Account | undefined> {
    return Storage.getInstance().getSelectedAccount();
  }
}

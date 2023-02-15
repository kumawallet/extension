import { Chain } from "@src/constants/chains";
import { AccountKey, AccountType } from "./accounts/types";
import Storage from "./storage/Storage";
import AccountManager from "./accounts/AccountManager";
import Setting from "./storage/entities/settings/Setting";
import Network from "./storage/entities/Network";
import Accounts from "./storage/entities/Accounts";
import Account from "./storage/entities/Account";
import Vault from "./storage/entities/Vault";
import Auth from "./storage/Auth";
import CacheAuth from "./storage/entities/CacheAuth";
import SelectedAccount from "./storage/entities/SelectedAccount";
import Settings from "./storage/entities/settings/Settings";
import { SettingType } from "./storage/entities/settings/types";

export default class Extension {
  private static async init(
    password: string,
    recoveryPhrase: string,
    force?: boolean
  ) {
    try {
      await Auth.getInstance().signUp(password);
      await Storage.getInstance().init(force);
      await CacheAuth.cachePassword();
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
    // TODO: validate privateKeyOrSeed, accounType

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

  static async restorePassword(recoveryPhrase: string, newPassword: string) {
    if (!recoveryPhrase)
      throw new Error("Cannot restore password without seed or private key");
    if (!newPassword) throw new Error("Missing password");
    await AccountManager.restorePassword(recoveryPhrase, newPassword);
  }

  static removeAccount(key: AccountKey) {
    AccountManager.forget(key);
  }

  static changeAccountName(key: AccountKey, newName: string) {
    AccountManager.changeName(key, newName);
  }

  static async signIn(password: string) {
    const vault = await Vault.getEncryptedVault();
    if (!vault) throw new Error("Vault not found");
    await Auth.getInstance().signIn(password, vault);
    await CacheAuth.cachePassword();
  }

  static alreadySignedUp() {
    return Vault.alreadySignedUp();
  }

  static async areAccountsInitialized(): Promise<boolean> {
    try {
      const accounts = await Accounts.get<Accounts>();
      if (!accounts) return false;
      return AccountManager.areAccountsInitialized(accounts);
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  static async signOut() {
    Auth.getInstance().signOut();
    await CacheAuth.clear();
  }

  static async isUnlocked() {
    await CacheAuth.loadFromCache();
    return Auth.isUnlocked;
  }

  static async showPrivateKey(): Promise<string | undefined> {
    const selectedAccount = await SelectedAccount.get<SelectedAccount>();
    if (!selectedAccount || !selectedAccount.key) return undefined;
    return Vault.showPrivateKey(selectedAccount.key);
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
    const vault = await Vault.get<Vault>();
    if (!vault) throw new Error("Vault not found");
    return AccountManager.derive(name, vault, accountType);
  }

  static async setNetwork(chain: Chain): Promise<boolean> {
    const vault = await Vault.get<Vault>();
    if (!vault) throw new Error("Vault not found");
    const network = Network.getInstance();
    network.set(chain);
    await Network.set<Network>(network);
    return true;
  }

  static async setSelectedAccount(account: Account) {
    const selected = new SelectedAccount();
    selected.fromAccount(account);
    await SelectedAccount.set<SelectedAccount>(selected);
  }

  static async getSelectedAccount(): Promise<Account | undefined> {
    return SelectedAccount.get<SelectedAccount>();
  }

  static async getNetwork(): Promise<Network> {
    return Network.get();
  }

  static async getGeneralSettings(): Promise<Setting[]> {
    const settings = await Settings.get<Settings>();
    if (!settings) throw new Error("Settings not found");
    return settings.getAll(SettingType.GENERAL);
  }
}

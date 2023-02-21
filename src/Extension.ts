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
import Registry from "./storage/entities/registry/Registry";
import Contact from "./storage/entities/registry/Contact";
import Record from "./storage/entities/activity/Record";
import Activity from "./storage/entities/activity/Activity";

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

  static async createAccounts(
    seed: string,
    name: string,
    password: string,
    isSignUp = true
  ) {
    if (!seed) throw new Error("seed_required");
    if (isSignUp) {
      if (!password) throw new Error("password_required");
      await this.init(password, seed, true);
    }
    const isUnlocked = await Extension.isUnlocked();
    if (!isUnlocked) throw new Error("failed_to_create_accounts");
    await AccountManager.addWASMAccount(seed, name);
    await AccountManager.addEVMAccount(seed, name);
    return true;
  }

  static async importAccount(
    name: string,
    privateKeyOrSeed: string,
    password: string | undefined,
    accountType: AccountType,
    isSignUp = true
  ) {
    // TODO: validate privateKeyOrSeed, accounType

    if (!privateKeyOrSeed) throw new Error("private_key_or_seed_required");
    if (isSignUp) {
      if (!password) throw new Error("password_required");
      await this.init(password, privateKeyOrSeed, true);
    }
    const isUnlocked = await Extension.isUnlocked();
    if (!isUnlocked) throw new Error("failed_to_import_account");
    await AccountManager.importAccount({
      name,
      privateKeyOrSeed,
      accountType,
    });
  }

  static async restorePassword(recoveryPhrase: string, newPassword: string) {
    if (!recoveryPhrase) throw new Error("private_key_or_seed_required");
    if (!newPassword) throw new Error("password_required");
    await AccountManager.restorePassword(recoveryPhrase, newPassword);
  }

  static removeAccount(key: AccountKey) {
    AccountManager.remove(key);
  }

  static changeAccountName(key: AccountKey, newName: string) {
    AccountManager.changeName(key, newName);
  }

  static async signIn(password: string) {
    try {
      const vault = await Vault.getEncryptedVault();
      if (!vault) throw new Error("failed_to_sign_in");
      await Auth.getInstance().signIn(password, vault);
      await CacheAuth.cachePassword();
    } catch (error) {
      Auth.getInstance().signOut();
      throw error;
    }
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

  static async showSeed(): Promise<string | undefined> {
    const selectedAccount = await SelectedAccount.get<SelectedAccount>();
    if (!selectedAccount || !selectedAccount.key) return undefined;
    return Vault.showSeed(selectedAccount.key);
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

  static async deriveAccount(
    name: string,
    accountType: AccountType
  ): Promise<Account> {
    const vault = await Vault.get<Vault>();
    if (!vault) throw new Error("failed_to_derive_account");
    return AccountManager.derive(name, vault, accountType);
  }

  static async setNetwork(chain: Chain): Promise<boolean> {
    const vault = await Vault.get<Vault>();
    if (!vault) throw new Error("failed_to_set_network");
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
    if (!settings) throw new Error("failed_to_get_settings");
    return settings.getAll(SettingType.GENERAL);
  }

  static async getContacts(): Promise<Contact[]> {
    const registry = await Registry.get<Registry>();
    if (!registry) throw new Error("failed_to_get_registry");
    return registry.getAllContacts();
  }

  static async getRegistryAddresses() {
    const registry = await Registry.get<Registry>();
    if (!registry) throw new Error("failed_to_get_registry");
    const { chain } = await Network.get<Network>();
    if (!chain) throw new Error("failed_to_get_network");
    const types = chain.supportedAccounts || [];
    const accounts = await AccountManager.getAll(types);
    if (!accounts) throw new Error("failed_to_get_accounts");
    return {
      ownAccounts: accounts
        .getAll()
        .map(
          (account) => new Contact(account.value.name, account.value.address)
        ),
      contacts: registry.getAllContacts(),
      recent: registry.getRecent(chain.name),
    };
  }

  static async saveContact(contact: Contact) {
    const registry = await Registry.get<Registry>();
    if (!registry) throw new Error("failed_to_get_registry");
    registry.addContact(contact);
    await Registry.set<Registry>(registry);
  }

  static async removeContact(address: string) {
    await Registry.removeContact(address);
  }

  static async getActivity(): Promise<Record[]> {
    return Activity.getRecords();
  }
}

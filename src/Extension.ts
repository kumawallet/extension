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
import { SettingKey, SettingType } from "./storage/entities/settings/types";
import Registry from "./storage/entities/registry/Registry";
import Contact from "./storage/entities/registry/Contact";
import Record from "./storage/entities/activity/Record";
import Activity from "./storage/entities/activity/Activity";
import Chains, { Chain } from "./storage/entities/Chains";
import Register from "./storage/entities/registry/Register";
import { RecordStatus } from "./storage/entities/activity/types";
import Assets from "./storage/entities/Assets";
import TrustedSites from "./storage/entities/TrustedSites";

export default class Extension {
  private static async init(
    password: string,
    recoveryPhrase: string,
    force?: boolean
  ) {
    try {
      await Auth.getInstance().signUp(password);
      // AUDIT: executes #isUnlocked = true;
      await Storage.getInstance().init(force);
      await CacheAuth.cachePassword();
      await AccountManager.saveBackup(recoveryPhrase);
      // AUDIT: password is being encrypted with salt and cached.
      // AUDIT: at the same time it's being encrypted w/the recovery phrase and saved in persistent storage, to decrypt all the Vault(keyrings). 
      // AUDIT:   This should be avoided in case of a security breach, as the storage can be exposed, All the Keyrings are encrypted with this password.
      // AUDIT:   Recovery mecanism is done with the recovery phrase, which re-generates all the private_keys.
      // AUDIT: review further, could lead to a security issue in the long run when handling password in different places, keep it consistent.
    } catch (error) {
      console.error(error);
      throw new Error(error as string);
    }
  }

  static async createAccounts(
    seed: string,
    name: string,
    password?: string,
    isSignUp = true
    // AUDIT: redundant parameter, every createAccount call is a signUp. 
    // AUDIT: Not tested in tests. Could lead to unexpected behaviour when called with false.
  ) {
    if (!seed) throw new Error("seed_required");
    if (isSignUp) {
      if (!password) throw new Error("password_required");
      await this.init(password, seed, true);
    }
    const isUnlocked = await Extension.isUnlocked();
    if (!isUnlocked) throw new Error("failed_to_create_accounts");

    const evmAccount = await AccountManager.addEVMAccount(seed, name);
    const wasmAccount = await AccountManager.addWASMAccount(seed, name);

    const selectedAccount = await Extension.getSelectedAccount();

    if (isSignUp) {
      await this.setSelectedAccount(wasmAccount);
    } else {
      await this.setSelectedAccount(
        selectedAccount?.type.includes("EVM") ? evmAccount : wasmAccount
      );
    }

    return true;
  }

  static async importAccount(
    name: string,
    privateKeyOrSeed: string,
    password: string | undefined,
    accountType: AccountType,
    isSignUp = true
  ) {
    //AUDIT: not taking into account if i load the seed, works only with the private key
    //AUDIT: repeated code from createAccounts, refactor suggested
    if (!privateKeyOrSeed) throw new Error("private_key_or_seed_required");
    if (isSignUp) {
      if (!password) throw new Error("password_required");
      await this.init(password, privateKeyOrSeed, true);  
    }
    const isUnlocked = await Extension.isUnlocked();
    if (!isUnlocked) throw new Error("failed_to_import_account");
    const account = await AccountManager.importAccount({
      name,
      privateKeyOrSeed,
      accountType,
    });
    this.setSelectedAccount(account);
  }

  static async restorePassword(recoveryPhrase: string, newPassword: string) {
    // AUDIT: could use here bip39.validateMnemonic(recoveryPhrase) to validate the recovery phrase
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

  static async resetWallet() {
    if (!Auth.isUnlocked) throw new Error("wallet_not_unlocked");
    await Storage.getInstance().resetWallet();
    localStorage.removeItem("welcome");
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
    if (!selectedAccount || !selectedAccount.value.keyring) return undefined;
    return Vault.showPrivateKey(selectedAccount.value.keyring);
  }

  static async showSeed(): Promise<string | undefined> {
    const selectedAccount = await SelectedAccount.get<SelectedAccount>();
    if (!selectedAccount || !selectedAccount.value.keyring) return undefined;
    return Vault.showSeed(selectedAccount.value.keyring);
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
    const account = await AccountManager.derive(name, vault, accountType);
    await this.setSelectedAccount(account);
    return account;
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
    // AUDIT: should this be treated as a singleton or do we want to create a SelectedAccount each time?
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

  static async getAdvancedSettings(): Promise<Setting[]> {
    const settings = await Settings.get<Settings>();
    if (!settings) throw new Error("failed_to_get_settings");
    return settings.getAll(SettingType.ADVANCED);
  }

  static async getSetting(type: SettingType, key: SettingKey): Promise<Setting | undefined> {
    const settings = await Settings.get<Settings>();
    if (!settings) throw new Error("failed_to_get_settings");
    return settings.get(type, key);
  }

  static async updateSetting(type: SettingType, key: SettingKey, value: any) {
    const settings = await Settings.get<Settings>();
    if (!settings) throw new Error("failed_to_get_settings");
    settings.update(type, key, value);
    await Settings.set<Settings>(settings);
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

  static async getAllChains(): Promise<Chains> {
    const chains = await Chains.get<Chains>();
    if (!chains) throw new Error("failed_to_get_chains");
    return chains;
  }

  static async saveCustomChain(chain: Chain) {
    await Chains.saveCustomChain(chain);
  }

  static async removeCustomChain(chainName: string) {
    await Chains.removeCustomChain(chainName);
  }

  static async getXCMChains(chainName: string): Promise<Chain[]> {
    const { xcm } = (await Chains.getByName(chainName)) || {};
    if (!xcm) throw new Error("failed_to_get_chain");
    const chains = await Chains.get<Chains>();
    if (!chains) throw new Error("failed_to_get_chains");
    return chains.getAll().filter((chain) => xcm.includes(chain.name));
  }

  static async addActivity(txHash: string, record: Record) {
    await Activity.addRecord(txHash, record);
    const { address, network } = record;
    const register = new Register(address, Date.now());
    await Registry.addRecent(network, register);
  }

  static async updateActivity(
    txHash: string,
    status: RecordStatus,
    error?: string | undefined
  ) {
    await Activity.updateRecordStatus(txHash, status, error);
  }

  static async addAsset(chain: string, asset: any) {
    return Assets.addAsset(chain, asset);
  }

  static async getAssetsByChain(chain: string) {
    return Assets.getByChain(chain);
  }

  static async getTrustedSites(): Promise<string[]> {
    return TrustedSites.getAll();
  }

  static async addTrustedSite(site: string) {
    return TrustedSites.addSite(site);
  }

  static async removeTrustedSite(site: string) {
    return TrustedSites.removeSite(site);
  }
}

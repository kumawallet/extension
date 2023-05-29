import { AccountKey, AccountType } from "./accounts/types";
import Storage from "./storage/Storage";
import AccountManager from "./accounts/AccountManager";
import Setting from "./storage/entities/settings/Setting";
import Network from "./storage/entities/Network";
import Accounts from "./storage/entities/Accounts";
import Account from "./storage/entities/Account";
import Vault from "./storage/entities/Vault";
import Auth from "./storage/Auth";
import SelectedAccount from "./storage/entities/SelectedAccount";
import Settings from "./storage/entities/settings/Settings";
import {
  SettingKey,
  SettingType,
  SettingValue,
} from "./storage/entities/settings/types";
import Registry from "./storage/entities/registry/Registry";
import Contact from "./storage/entities/registry/Contact";
import Record from "./storage/entities/activity/Record";
import Activity from "./storage/entities/activity/Activity";
import Chains, { Chain } from "./storage/entities/Chains";
import Register from "./storage/entities/registry/Register";
import { RecordStatus } from "./storage/entities/activity/types";
import Assets from "./storage/entities/Assets";
import TrustedSites from "./storage/entities/TrustedSites";
import { PASSWORD_REGEX, PRIVATE_KEY_OR_SEED_REGEX } from "./utils/constants";

export default class Extension {
  private static validatePasswordFormat(password: string) {
    if (!password) throw new Error("password_required");
    if (!PASSWORD_REGEX.test(password)) throw new Error("password_invalid");
  }

  private static validatePrivateKeyOrSeedFormat(privateKeyOrSeed: string) {
    if (!privateKeyOrSeed) throw new Error("private_key_or_seed_required");
    if (!PRIVATE_KEY_OR_SEED_REGEX.test(privateKeyOrSeed))
      throw new Error("private_key_or_seed_invalid");
  }

  private static async signUp(password = "", privateKeyOrSeed: string) {
    try {
      Extension.validatePasswordFormat(password);
      Extension.validatePrivateKeyOrSeedFormat(privateKeyOrSeed);
      await Storage.init(password, privateKeyOrSeed);
    } catch (error) {
      Storage.getInstance().resetWallet();
      Auth.signOut();
      throw error;
    }
  }

  static isAuthorized(): boolean {
    return Auth.isAuthorized();
  }

  static async createAccounts(
    seed: string,
    name: string,
    password?: string,
    isSignUp = true
  ) {
    if (isSignUp) {
      await Extension.signUp(password, seed);
    }
    const wasmAccount = await AccountManager.addAccount(
      AccountType.WASM,
      seed,
      name
    );
    const evmAccount = await AccountManager.addAccount(
      AccountType.EVM,
      seed,
      name
    );

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
    type: AccountType.IMPORTED_EVM | AccountType.IMPORTED_WASM,
    isSignUp = true
  ) {
    if (isSignUp) {
      await Extension.signUp(password, privateKeyOrSeed);
    }
    const account = await AccountManager.importAccount(
      name,
      privateKeyOrSeed,
      type
    );
    this.setSelectedAccount(account);
  }

  static async restorePassword(privateKeyOrSeed: string, newPassword: string) {
    Extension.validatePasswordFormat(newPassword);
    Extension.validatePrivateKeyOrSeedFormat(privateKeyOrSeed);
    await AccountManager.restorePassword(privateKeyOrSeed, newPassword);
  }

  static removeAccount(key: AccountKey) {
    AccountManager.remove(key);
  }

  static async changeAccountName(key: AccountKey, newName: string) {
    const account = await AccountManager.changeName(key, newName);
    await SelectedAccount.set<SelectedAccount>(account);
  }

  static async resetWallet() {
    if (!Auth.isAuthorized()) {
      throw new Error("not_authorized");
    }
    await Storage.getInstance().resetWallet();
    localStorage.removeItem("welcome");
  }

  static async signIn(password: string) {
    await Auth.signIn(password);
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
      return false;
    }
  }

  static async signOut() {
    Auth.signOut();
  }

  static async isSessionActive() {
    return Auth.isSessionActive();
  }

  static async showKey(): Promise<string | undefined> {
    const selectedAccount = await SelectedAccount.get<SelectedAccount>();
    if (!selectedAccount || !selectedAccount?.value?.keyring) return undefined;
    const { keyring: type, address } = selectedAccount.value;
    const keyring = await Vault.getKeyring(type);
    return keyring.getKey(address);
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
    type: AccountType
  ): Promise<Account> {
    const account = await AccountManager.derive(name, type);
    await this.setSelectedAccount(account);
    return account;
  }

  static async setNetwork(chain: Chain): Promise<boolean> {
    const network = Network.getInstance();
    network.set(chain);
    await Network.set<Network>(network);
    return true;
  }

  static async setSelectedAccount(account: Account) {
    await SelectedAccount.set<SelectedAccount>(
      SelectedAccount.fromAccount(account)
    );
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

  static async getSetting(
    type: SettingType,
    key: SettingKey
  ): Promise<Setting | undefined> {
    const settings = await Settings.get<Settings>();
    if (!settings) throw new Error("failed_to_get_settings");
    return settings.get(type, key);
  }

  static async updateSetting(
    type: SettingType,
    key: SettingKey,
    value: SettingValue
  ) {
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

  static async addAsset(
    chain: string,
    asset: { symbol: string; address: string; decimals: number }
  ) {
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

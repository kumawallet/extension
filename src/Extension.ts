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
  private static validatePassword(password: string) {
    if (!password) throw new Error("password_required");
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
    if (!passwordRegex.test(password)) throw new Error("password_invalid");
  }

  private static validatePrivateKeyOrSeed(privateKeyOrSeed: string) {
    if (!privateKeyOrSeed) throw new Error("private_key_or_seed_required");
    const privateKeyOrSeedRegex =
      /^(0x)?[0-9a-fA-F]{64}|^([a-zA-Z]+ )+[a-zA-Z]+$/;
    if (!privateKeyOrSeedRegex.test(privateKeyOrSeed))
      throw new Error("private_key_or_seed_invalid");
  }

  private static async signUp(password = "", privateKeyOrSeed: string) {
    try {
      Extension.validatePassword(password);
      Extension.validatePrivateKeyOrSeed(privateKeyOrSeed);
      Auth.getInstance().setAuth(password);
      //  await AccountManager.saveBackup(recoveryPhrase);
      await Storage.getInstance().init();
    } catch (error) {
      Storage.getInstance().resetWallet();
      Auth.signOut();
      throw error;
    }
  }

  static async isAuthorized() {
    const isUnlocked = await Extension.isUnlocked();
    if (!isUnlocked) throw new Error("failed_to_import_account");
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
    await Extension.isAuthorized();
    const { evmName, wasmName } = await AccountManager.getDefaultNames(name);
    const evmAccount = await AccountManager.addAccount(
      AccountType.EVM,
      seed,
      evmName
    );
    const wasmAccount = await AccountManager.addAccount(
      AccountType.WASM,
      seed,
      wasmName
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
    await Extension.isAuthorized();
    const account = await AccountManager.importAccount(
      name,
      privateKeyOrSeed,
      type
    );
    this.setSelectedAccount(account);
  }

  static async restorePassword(recoveryPhrase: string, newPassword: string) {
    Extension.validatePassword(newPassword);
    Extension.validatePrivateKeyOrSeed(recoveryPhrase);
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
      await Auth.signIn(password, vault);
    } catch (error) {
      Auth.signOut();
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
    Auth.signOut();
  }

  static async isUnlocked() {
    await Auth.loadFromCache();
    return Auth.isUnlocked;
  }

  static async showKey(): Promise<string | undefined> {
    const selectedAccount = await SelectedAccount.get<SelectedAccount>();
    if (!selectedAccount || !selectedAccount?.value?.keyring) return undefined;
    const { keyring: id, address } = selectedAccount.value;
    const keyring = await Vault.getKeyring(id);
    return keyring.getPrivateKey(address);
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
    const vault = await Vault.get<Vault>();
    if (!vault) throw new Error("failed_to_set_network");
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

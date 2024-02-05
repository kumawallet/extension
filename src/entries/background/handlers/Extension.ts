import {
  PASSWORD_REGEX,
  PRIVATE_KEY_OR_SEED_REGEX,
} from "@src/utils/constants";

import Storage from "@src/storage/Storage";
import AccountManager from "@src/accounts/AccountManager";
import Setting from "@src/storage/entities/settings/Setting";
import Network from "@src/storage/entities/Network";
import Accounts from "@src/storage/entities/Accounts";
import Account from "@src/storage/entities/Account";
import Vault from "@src/storage/entities/Vault";
import Auth from "@src/storage/Auth";
import SelectedAccount from "@src/storage/entities/SelectedAccount";
import Settings from "@src/storage/entities/settings/Settings";
import { SettingType } from "@src/storage/entities/settings/types";
import Registry from "@src/storage/entities/registry/Registry";
import Contact from "@src/storage/entities/registry/Contact";
import Record from "@src/storage/entities/activity/Record";
import Activity from "@src/storage/entities/activity/Activity";
import Chains, { Chain } from "@src/storage/entities/Chains";
import Register from "@src/storage/entities/registry/Register";
import Assets from "@src/storage/entities/Assets";
import TrustedSites from "@src/storage/entities/TrustedSites";
import Swap from "@src/storage/entities/registry/Swap";
import { AccountType } from "@src/accounts/types";
import { version } from "@src/utils/env";
import {
  MessageTypes,
  RequestAddActivity,
  RequestAddAsset,
  RequestAddSwap,
  RequestAddTrustedSite,
  RequestChangeAccountName,
  RequestCreateAccount,
  RequestDeriveAccount,
  RequestGetAccount,
  RequestGetAllAccounts,
  RequestGetAssetsByChain,
  RequestGetSetting,
  RequestGetXCMChains,
  RequestImportAccount,
  RequestRemoveAccout,
  RequestRemoveContact,
  RequestRemoveCustomChain,
  RequestRemoveTrustedSite,
  RequestRestorePassword,
  RequestSaveContact,
  RequestSaveCustomChain,
  RequestSetNetwork,
  RequestSignIn,
  RequestSignUp,
  RequestSwapProtocol,
  RequestTypes,
  RequestUpdateActivity,
  RequestUpdateSetting,
  ResponseType,
} from "./request-types";
// import { Port } from "./types";

export default class Extension {
  get version() {
    return version;
  }

  private validatePasswordFormat(password: string) {
    if (!password) throw new Error("password_required");
    if (!PASSWORD_REGEX.test(password)) throw new Error("password_invalid");
  }

  private validatePrivateKeyOrSeedFormat(privateKeyOrSeed: string) {
    if (!privateKeyOrSeed) throw new Error("private_key_or_seed_required");
    if (!PRIVATE_KEY_OR_SEED_REGEX.test(privateKeyOrSeed))
      throw new Error("private_key_or_seed_invalid");
  }

  private isAuthorized(): boolean {
    return Auth.isAuthorized();
  }

  private async signUp({ password, privateKeyOrSeed }: RequestSignUp) {
    try {
      this.validatePasswordFormat(password);
      this.validatePrivateKeyOrSeedFormat(privateKeyOrSeed);
      await Storage.init(password, privateKeyOrSeed);
    } catch (error) {
      Storage.getInstance().resetWallet();
      Auth.signOut();
      throw error;
    }
  }

  private async createAccounts({
    seed,
    name,
    password,
    isSignUp,
  }: RequestCreateAccount) {
    if (isSignUp) {
      await this.signUp({
        password: password as string,
        privateKeyOrSeed: seed,
      });
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

    const selectedAccount = await this.getSelectedAccount();

    if (isSignUp) {
      await this.setSelectedAccount(wasmAccount);
    } else {
      await this.setSelectedAccount(
        selectedAccount?.type.includes("EVM") ? evmAccount : wasmAccount
      );
    }

    return true;
  }

  private async importAccount({
    name,
    privateKeyOrSeed,
    password = "",
    type,
    isSignUp = true,
  }: RequestImportAccount) {
    if (isSignUp) {
      await this.signUp({ password, privateKeyOrSeed });
    }
    const account = await AccountManager.importAccount(
      name,
      privateKeyOrSeed,
      type
    );
    this.setSelectedAccount(account);
  }

  private async restorePassword({
    privateKeyOrSeed,
    newPassword,
  }: RequestRestorePassword) {
    this.validatePasswordFormat(newPassword);
    this.validatePrivateKeyOrSeedFormat(privateKeyOrSeed);
    await AccountManager.restorePassword(privateKeyOrSeed, newPassword);
  }

  private removeAccount({ key }: RequestRemoveAccout) {
    AccountManager.remove(key);
  }

  private async changeAccountName({ key, newName }: RequestChangeAccountName) {
    const account = await AccountManager.changeName(key, newName);
    await SelectedAccount.set<SelectedAccount>(account);
  }

  private async resetWallet() {
    if (!Auth.isAuthorized()) {
      throw new Error("not_authorized");
    }
    await Storage.getInstance().resetWallet();
  }

  private async signIn({ password }: RequestSignIn) {
    await Auth.signIn(password);
  }

  private alreadySignedUp() {
    return Vault.alreadySignedUp();
  }

  private async areAccountsInitialized(): Promise<boolean> {
    try {
      const accounts = await Accounts.get<Accounts>();
      if (!accounts) return false;
      return AccountManager.areAccountsInitialized(accounts);
    } catch (error) {
      return false;
    }
  }

  private async signOut() {
    Auth.signOut();
  }

  private async isSessionActive() {
    return Auth.isSessionActive();
  }

  private async showKey(): Promise<string | undefined> {
    const selectedAccount = await SelectedAccount.get<SelectedAccount>();
    if (!selectedAccount || !selectedAccount?.value?.keyring) return undefined;
    const { keyring: type } = selectedAccount.value;

    const address = selectedAccount.key.split("-")[1];

    const keyring = await Vault.getKeyring(type);
    return keyring.getKey(address);
  }

  private async getAccount({
    key,
  }: RequestGetAccount): Promise<Account | undefined> {
    return AccountManager.getAccount(key);
  }

  private async getAllAccounts({
    type = null,
  }: RequestGetAllAccounts): Promise<Account[]> {
    const accounts = await AccountManager.getAll(type);
    if (!accounts) return [];
    return accounts.getAll();
  }

  private async deriveAccount({
    name,
    type,
  }: RequestDeriveAccount): Promise<Account> {
    const account = await AccountManager.derive(name, type);
    await this.setSelectedAccount(account);
    return account;
  }

  private async setNetwork({ chain }: RequestSetNetwork): Promise<boolean> {
    const network = Network.getInstance();
    network.set(chain);
    await Network.set<Network>(network);
    return true;
  }

  private async setSelectedAccount(account: Account) {
    await SelectedAccount.set<SelectedAccount>(
      SelectedAccount.fromAccount(account)
    );
  }

  private async getSelectedAccount(): Promise<Account | undefined> {
    return SelectedAccount.get<SelectedAccount>();
  }

  private async getNetwork(): Promise<Network> {
    return Network.get<Network>();
  }

  private async getGeneralSettings(): Promise<Setting[]> {
    const settings = await Settings.get<Settings>();
    if (!settings) throw new Error("failed_to_get_settings");
    return settings.getAll(SettingType.GENERAL);
  }

  private async getAdvancedSettings(): Promise<Setting[]> {
    const settings = await Settings.get<Settings>();
    if (!settings) throw new Error("failed_to_get_settings");
    return settings.getAll(SettingType.ADVANCED);
  }

  private async getSetting({
    type,
    key,
  }: RequestGetSetting): Promise<Setting | undefined> {
    const settings = await Settings.get<Settings>();
    if (!settings) throw new Error("failed_to_get_settings");
    return settings.get(type, key);
  }

  private async updateSetting({ type, key, value }: RequestUpdateSetting) {
    const settings = await Settings.get<Settings>();
    if (!settings) throw new Error("failed_to_get_settings");
    settings.update(type, key, value);
    await Settings.set<Settings>(settings);
  }

  private async getContacts(): Promise<Contact[]> {
    const registry = await Registry.get<Registry>();
    if (!registry) throw new Error("failed_to_get_registry");
    return registry.getAllContacts();
  }

  private async getRegistryAddresses() {
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
      recent: registry.getRecentAddresses(chain.name),
    };
  }

  private async saveContact({ contact }: RequestSaveContact) {
    await Registry.addContact(contact);
  }

  private async removeContact({ address }: RequestRemoveContact) {
    await Registry.removeContact(address);
  }

  private async getActivity(): Promise<Record[]> {
    return Activity.getRecords();
  }

  private async getAllChains(): Promise<Chains> {
    const newChains = await Chains.loadChains();
    const chains = await Chains.get<Chains>();
    if (!chains) throw new Error("failed_to_get_chains");

    if (newChains) {
      const network = await Network.get<Network>();
      const selectedNetwork = network.chain;
      const selectedNetworkInMainnets = newChains.mainnets.find(
        (chain) =>
          chain.nativeCurrency.symbol === selectedNetwork?.nativeCurrency.symbol
      );

      const selectedNetworkInTestnets = newChains.testnets.find(
        (chain) =>
          chain.nativeCurrency.symbol === selectedNetwork?.nativeCurrency.symbol
      );

      let chainToUpdate = null;

      if (selectedNetworkInMainnets) {
        chainToUpdate = selectedNetworkInMainnets;
      }

      if (selectedNetworkInTestnets) {
        chainToUpdate = selectedNetworkInTestnets;
      }

      if (chainToUpdate) {
        network.chain = chainToUpdate;
        await Network.set<Network>(network);
      }
    }

    return chains;
  }

  private async saveCustomChain({ chain }: RequestSaveCustomChain) {
    await Chains.saveCustomChain(chain);
  }

  private async removeCustomChain({ chainName }: RequestRemoveCustomChain) {
    await Chains.removeCustomChain(chainName);
  }

  private async getXCMChains({
    chainName,
  }: RequestGetXCMChains): Promise<Chain[]> {
    const { xcm } = (await Chains.getByName(chainName)) || {};
    if (!xcm) throw new Error("failed_to_get_chain");
    const chains = await Chains.get<Chains>();
    if (!chains) throw new Error("failed_to_get_chains");
    return chains.getAll().filter((chain) => xcm.includes(chain.name));
  }

  private async addActivity({ txHash, record }: RequestAddActivity) {
    await Activity.addRecord(txHash, record);
    const { address, network } = record;
    const register = new Register(address, Date.now());
    await Registry.addRecentAddress(network, register);
  }

  private async updateActivity({
    txHash,
    status,
    error,
  }: RequestUpdateActivity) {
    await Activity.updateRecordStatus(txHash, status, error);
  }

  private async addAsset({ chain, asset }: RequestAddAsset) {
    return Assets.addAsset(chain, asset);
  }

  private async getAssetsByChain({ chain }: RequestGetAssetsByChain) {
    return Assets.getByChain(chain);
  }

  private async getTrustedSites(): Promise<string[]> {
    return TrustedSites.getAll();
  }

  private async addTrustedSite({ site }: RequestAddTrustedSite) {
    return TrustedSites.addSite(site);
  }

  private async removeTrustedSite({ site }: RequestRemoveTrustedSite) {
    return TrustedSites.removeSite(site);
  }

  private async getSwapsByProtocol({ protocol }: RequestSwapProtocol) {
    return Swap.getSwapsByProtocol(protocol);
  }

  private async addSwap({ protocol, swap }: RequestAddSwap) {
    return Swap.addSwap(protocol, swap);
  }

  async handle<TMessageType extends MessageTypes>(
    id: string,
    type: TMessageType,
    request: RequestTypes[TMessageType]
    // port: Port
  ): Promise<ResponseType<TMessageType>> {
    switch (type) {
      case "pri(accounts.createAccounts)":
        return this.createAccounts(request as RequestCreateAccount);
      case "pri(accounts.importAccount)":
        return this.importAccount(request as RequestImportAccount);
      case "pri(accounts.restorePassword)":
        return this.restorePassword(request as RequestRestorePassword);
      case "pri(accounts.removeAccount)":
        return this.removeAccount(request as RequestRemoveAccout);
      case "pri(accounts.changeAccountName)":
        return this.changeAccountName(request as RequestChangeAccountName);
      case "pri(accounts.areAccountsInitialized)":
        return this.areAccountsInitialized();
      case "pri(accounts.getAccount)":
        return this.getAccount(request as RequestGetAccount);
      case "pri(accounts.getAllAccounts)":
        return this.getAllAccounts(request as RequestGetAllAccounts);
      case "pri(accounts.deriveAccount)":
        return this.deriveAccount(request as RequestDeriveAccount);
      case "pri(accounts.setSelectedAccount)":
        return this.setSelectedAccount(request as Account);
      case "pri(accounts.getSelectedAccount)":
        return this.getSelectedAccount();

      case "pri(auth.isAuthorized)":
        return this.isAuthorized();
      case "pri(auth.resetWallet)":
        return this.resetWallet();
      case "pri(auth.signIn)":
        return this.signIn(request as RequestSignIn);
      case "pri(auth.signOut)":
        return this.signOut();
      case "pri(auth.alreadySignedUp)":
        return this.alreadySignedUp();
      case "pri(auth.isSessionActive)":
        return this.isSessionActive();
      case "pri(auth.showKey)":
        return this.showKey();

      case "pri(network.setNetwork)":
        return this.setNetwork(request as RequestSetNetwork);
      case "pri(network.getNetwork)":
        return this.getNetwork();
      case "pri(network.getAllChains)":
        return this.getAllChains();
      case "pri(network.saveCustomChain)":
        return this.saveCustomChain(request as RequestSaveCustomChain);
      case "pri(network.removeCustomChain)":
        return this.removeCustomChain(request as RequestRemoveCustomChain);
      case "pri(network.getXCMChains)":
        return this.getXCMChains(request as RequestGetXCMChains);

      case "pri(settings.getGeneralSettings)":
        return this.getGeneralSettings();
      case "pri(settings.getAdvancedSettings)":
        return this.getAdvancedSettings();
      case "pri(settings.getSetting)":
        return this.getSetting(request as RequestGetSetting);
      case "pri(settings.updateSetting)":
        return this.updateSetting(request as RequestUpdateSetting);

      case "pri(contacts.getContacts)":
        return this.getContacts();
      case "pri(contacts.getRegistryAddresses)":
        return this.getRegistryAddresses();
      case "pri(contacts.saveContact)":
        return this.saveContact(request as RequestSaveContact);
      case "pri(contacts.removeContact)":
        return this.removeContact(request as RequestRemoveContact);

      case "pri(activity.getActivity)":
        return this.getActivity();
      case "pri(activity.addActivity)":
        return this.addActivity(request as RequestAddActivity);
      case "pri(activity.updateActivity)":
        return this.updateActivity(request as RequestUpdateActivity);

      case "pri(assets.addAsset)":
        return this.addAsset(request as RequestAddAsset);
      case "pri(assets.getAssetsByChain)":
        return this.getAssetsByChain(request as RequestGetAssetsByChain);

      case "pri(trustedSites.getTrustedSites)":
        return this.getTrustedSites();
      case "pri(trustedSites.addTrustedSite)":
        return this.addTrustedSite(request as RequestAddTrustedSite);
      case "pri(trustedSites.removeTrustedSite)":
        return this.removeTrustedSite(request as RequestRemoveTrustedSite);

      case "pri(swap.getSwapsByProtocol)":
        return this.getSwapsByProtocol(request as RequestSwapProtocol);
      case "pri(swap.addSwap)":
        return this.addSwap(request as RequestAddSwap);

      default:
        throw new Error(`Unable to handle message of type ${type}`);
    }
  }
}

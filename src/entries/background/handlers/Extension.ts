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
import Chains from "@src/storage/entities/Chains";
import Register from "@src/storage/entities/registry/Register";
import Assets from "@src/storage/entities/Assets";
import TrustedSites from "@src/storage/entities/TrustedSites";
import { AccountKey, AccountType, AccountTypes } from "@src/accounts/types";
import { version } from "@src/utils/env";
import {
  MessageTypes,
  RequestAddActivity,
  RequestAddAsset,
  RequestAddTrustedSite,
  RequestChangeAccountName,
  RequestChangePassword,
  RequestCreateAccount,
  RequestDeriveAccount,
  RequestGetAccount,
  RequestGetAllAccounts,
  RequestGetAssetsByChain,
  RequestGetSetting,
  RequestImportAccount,
  RequestRemoveAccout,
  RequestRemoveContact,
  RequestRemoveCustomChain,
  RequestRemoveTrustedSite,
  RequestSaveContact,
  RequestSaveCustomChain,
  RequestSetNetwork,
  RequestSignIn,
  RequestSignUp,
  RequestTypes,
  RequestUpdateActivity,
  RequestUpdateSetting,
  RequestValidatePassword,
  RequestSetAutoLock,
  ResponseType,
  RequestUpdateContact,
  RequestDeleteSelectNetwork,
  RequestShowKey,
  RequestUpdateTx,
  RequestSetAccountToActivity,
} from "./request-types";
import { Signer, Wallet, providers, utils } from "ethers";
import { ApiPromise } from "@polkadot/api";
import keyring from "@polkadot/ui-keyring";
import { RecordStatus, RecordType } from "@src/storage/entities/activity/types";
import { BN } from "@polkadot/util";
import notificationIcon from "/icon-128.png";
import { Chain, Transaction, SelectedChain } from "@src/types";
import { Port } from "./types";
import { BehaviorSubject } from "rxjs";
import { createSubscription } from "./subscriptions";
import { Provider } from "@src/storage/entities/Provider";
import { Transaction as TransactionEntity } from "@src/storage/entities/Transaction";
import AssetBalance from "@src/storage/entities/AssetBalance";
import { EVM_CHAINS, SUBTRATE_CHAINS } from "@src/constants/chainsData";
import { OlProvider } from "@src/services/ol/OlProvider";
import { OL_CHAINS } from "@src/constants/chainsData/ol";
import TransactionHistory from "@src/storage/entities/TransactionHistory";
import {
  validatePasswordFormat,
  validatePrivateKeyOrSeedFormat,
} from "@src/utils/account-utils";
import { AddressOrPair } from "@polkadot/api/types";
import { Browser } from "@src/utils/constants";

export default class Extension {
  private provider = new Provider();
  private assetsBalance = new AssetBalance();
  private chains = new BehaviorSubject<SelectedChain>({});
  private tx = new TransactionEntity();
  private transactionHistory = new TransactionHistory();

  constructor() {
    this.subscriptionStatusProvider();
    this.initNetworks();
    this.initTransactionHistory();
  }

  get version() {
    return version;
  }

  private async isAuthorized(): Promise<boolean> {
    const isAuthorized = Auth.isAuthorized();

    if (isAuthorized) {
      await this.migrateAccouts();
    }

    return Auth.isAuthorized();
  }

  private async changePassword({
    currentPassword,
    newPassword,
  }: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    validatePasswordFormat(currentPassword);
    validatePasswordFormat(newPassword);

    await AccountManager.changePassword(currentPassword, newPassword);
  }

  private async initTransactionHistory() {
    const selectedAccount = await this.getSelectedAccount().catch(() => null);

    this.transactionHistory.setAccount(
      selectedAccount?.value ? selectedAccount : null
    );
  }

  private async initNetworks() {
    Network.getInstance();
    const network = (await Network.get().catch(() => null)) as Network | null;
    if (!network) return;
    const allChains: Chain[] = [SUBTRATE_CHAINS, EVM_CHAINS, OL_CHAINS].flat();
    const chain = this.chains.getValue();

    // @ts-expect-error --- migration
    if (network && network?.Chain?.supportedAccounts) {
      const newChainFormat = allChains.find(
        (chain) => network?.Chain?.name === chain.name
      );
      if (newChainFormat) {
        const id = newChainFormat.id;
        const type = newChainFormat.type;
        const isTestnet = newChainFormat.isTestnet;
        await this.setNetwork({ isTestnet, id, type });
      }
    }
    if (network && Object.keys(network.SelectedChain).length === 0) {
      const id = allChains[0].id;
      const type = allChains[0].type;
      const isTestnet = allChains[0].isTestnet;
      await this.setNetwork({ isTestnet, id, type });
    }

    if (
      network &&
      Object.keys(network.SelectedChain).length !== 0 &&
      Object.keys(chain).length === 0
    ) {
      this.chains.next(network.SelectedChain);
      await Promise.all(
        Object.keys(network.SelectedChain).map((chain) =>
          this.provider.setProvider(chain, network.SelectedChain[chain].type)
        )
      );
      await Promise.all(
        Object.keys(network.SelectedChain).map((chain) =>
          this.transactionHistory.addChain({ chainId: chain })
        )
      );
    }
  }

  private async signUp({ password, privateKeyOrSeed }: RequestSignUp) {
    try {
      validatePasswordFormat(password);
      validatePrivateKeyOrSeedFormat(privateKeyOrSeed);
      await Storage.init(password, privateKeyOrSeed);
      await this.initNetworks();
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
    await AccountManager.addAccount(AccountType.EVM, seed, name);

    await AccountManager.addAccount(AccountType.OL, seed, name);

    await this.setSelectedAccount(wasmAccount);

    return true;
  }

  private subscriptionStatusProvider = () => {
    this.provider.statusNetwork.subscribe(async (data) => {
      const [selectedAccount, allAccounts] = await Promise.all([
        SelectedAccount.get().catch(() => null),
        Accounts.get().catch(() => null),
      ]);

      if (!selectedAccount) return;

      const networksAssest = this.assetsBalance.getNetwork();
      const newNetwork = Object.keys(data).filter(
        (chain) =>
          !networksAssest.includes(chain) && data[chain] === "connected"
      );
      const deleteNetwork = networksAssest.filter(
        (network) =>
          Object.keys(data).includes(network) &&
          data[network] === "disconnected" &&
          !Object.keys(this.chains.getValue()).includes(network)
      );
      const provider = this.provider.getProviders();

      if (newNetwork.length !== 0) {
        if ((selectedAccount as Account).value) {
          await this.assetsBalance.loadAssets(
            selectedAccount as Account,
            provider,
            newNetwork
          );
          this.assetsBalance.assets.next(this.assetsBalance._assets);

          await this.transactionHistory.addChain({
            chainId: newNetwork[0],
          });
        } else {
          await Promise.all(
            Object.keys((allAccounts as Accounts).data).map((accountKey) => {
              this.transactionHistory.addChain({
                chainId: newNetwork[0],
              });

              return this.assetsBalance.loadAssets(
                (allAccounts as Accounts).data[
                  accountKey as AccountTypes
                ] as Account,
                provider,
                newNetwork
              );
            })
          );
          this.assetsBalance.assets.next(this.assetsBalance._assets);
        }
      }

      if (deleteNetwork.length !== 0) {
        if ((selectedAccount as Account).value) {
          this.assetsBalance.deleteAsset(
            selectedAccount as Account,
            provider,
            deleteNetwork
          );
          this.assetsBalance.assets.next(this.assetsBalance._assets);
        } else {
          Object.keys((allAccounts as Accounts).data).forEach((accountKey) => {
            return this.assetsBalance.deleteAsset(
              (allAccounts as Accounts).data[accountKey as AccountTypes],
              provider,
              deleteNetwork
            );
          });
          this.assetsBalance.assets.next(this.assetsBalance._assets);
        }
      }
    });
  };

  private async importAccount({
    name,
    privateKeyOrSeed,
    password = "",
    accountTypesToImport,
    isSignUp = true,
  }: RequestImportAccount) {
    if (isSignUp) {
      await this.signUp({ password, privateKeyOrSeed });
    }

    let firstAccountCreated;

    if (accountTypesToImport.includes(AccountType.WASM)) {
      firstAccountCreated = await AccountManager.importAccount(
        name,
        privateKeyOrSeed,
        AccountType.IMPORTED_WASM
      );
    }

    if (accountTypesToImport.includes(AccountType.EVM)) {
      const account = await AccountManager.importAccount(
        name,
        privateKeyOrSeed,
        AccountType.IMPORTED_EVM
      );

      if (!firstAccountCreated) {
        firstAccountCreated = account;
      }
    }

    if (accountTypesToImport.includes(AccountType.OL)) {
      const account = await AccountManager.importAccount(
        name,
        privateKeyOrSeed,
        AccountType.IMPORTED_OL
      );

      if (!firstAccountCreated) {
        firstAccountCreated = account;
      }
    }

    this.setSelectedAccount(firstAccountCreated!);
  }

  private removeAccount({ key }: RequestRemoveAccout) {
    AccountManager.remove(key);
  }

  private async changeAccountName({ key, newName }: RequestChangeAccountName) {
    const account = await AccountManager.changeName(key, newName);
    await SelectedAccount.set<SelectedAccount>(account as SelectedAccount);
  }

  private async resetWallet() {
    await Storage.getInstance().resetWallet();
    await this.provider.reset();
    await this.assetsBalance.reset();
  }

  private async signIn({ password }: RequestSignIn) {
    await Auth.signIn(password);
    await this.migrateAccouts();
  }

  private async setAutoLock({ time }: RequestSetAutoLock) {
    await Auth.setAutoLock(time);
  }
  private async unlock() {
    await Auth.unLock();
  }
  private async getLock() {
    const lock = await Auth.getLock();
    return lock;
  }
  private async validatePassword({
    password,
    key,
    keyring,
  }: RequestValidatePassword) {
    await Auth.validatePassword(password);
    if (!keyring || !password || !key) return undefined;
    const address = key.split("-")[1];

    return this.showKey({
      address,
    });
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
    const Allstored = await Storage.getInstance().storage.get(null);

    if (Allstored) {
      // migrate vault
      const foundOldVaultKey = Object.keys(Allstored).find((key) => {
        if (key === "Auth") return false;
        const object = Allstored[key];

        if (object.timeout > -1) {
          return true;
        }
      });

      if (foundOldVaultKey) {
        const newVault = Allstored[foundOldVaultKey];
        await Storage.getInstance().storage.set({ ["Network"]: newVault });
        await Storage.getInstance().storage.remove(foundOldVaultKey);
      }
    }

    return Auth.isSessionActive();
  }

  private async showKey({
    address,
  }: RequestShowKey): Promise<string | undefined> {
    // TODO: update from derivated accounts
    const accounts = (await AccountManager.getAll())?.getAll();

    if (!accounts) return undefined;

    const account = accounts.find(({ value }) => value.address === address);

    if (!account) return undefined;

    if (account?.value.parentAddress) {
      const keyring = await Vault.getKeyring(account.type);
      // return keyring.getKey(address);

      const seed = keyring.getKey(account?.value.parentAddress);

      const derived = keyring.getDerivedPath(seed, account?.value.path);

      return derived;
    } else {
      const keyring = await Vault.getKeyring(account.type);
      return keyring.getKey(address);
    }
  }

  private async getAccount({
    key,
  }: RequestGetAccount): Promise<Account | undefined> {
    return AccountManager.getAccount(key);
  }

  private migrateAccouts = async () => {
    const vault = await Vault.getInstance();

    // @ts-expect-error --- migration
    const needToMigrated = Boolean(vault.keyrings["WASM"]?.mnemonic);

    if (!needToMigrated) return;

    const accounts = await AccountManager.getAll();

    // @ts-expect-error --- migration

    Object.keys(vault.keyrings).forEach(async (key: AccountType) => {
      const _keyring = vault.keyrings[key];

      // @ts-expect-error --- migration

      const hasMnemonicInRoot = Boolean(_keyring?.mnemonic);

      if (hasMnemonicInRoot && _keyring) {
        // @ts-expect-error --- migration

        const mnemonic = _keyring.mnemonic;

        let parentAddress = "";

        parentAddress =
          Object.keys(_keyring.keyPairs).find((address) => {
            return (
              // @ts-expect-error --- migration

              _keyring.keyPairs[address].path === "/0" ||
              // @ts-expect-error --- migration

              _keyring.keyPairs[address].path === "m/44'/60'/0'/0/0"
            );
          }) || "";

        // @ts-expect-error --- migration

        _keyring.mnemonic = "";

        if (!parentAddress) return;

        Object.keys(_keyring.keyPairs).forEach(async (address: string) => {
          if (!_keyring.keyPairs[address].key && address === parentAddress) {
            _keyring.keyPairs[address].key = mnemonic;
          } else {
            // delete _keyring.keyPairs[address];

            // @ts-expect-error --- migration

            const keyFound = Object.keys(accounts?.data).find(
              // @ts-expect-error --- migration

              (_key: AccountKey) => _key === `${key}-${address}`
            );

            if (keyFound) {
              // @ts-expect-error --- migration

              accounts!.data[keyFound].value.parentAddress = parentAddress;
            }
          }
        });
      }
    });

    await Accounts.updateAll(accounts!);

    vault.setKeyrings(vault.keyrings);
  };

  private getAccountsToDerive = async () => {
    const accounts = (await AccountManager.getAll())?.getAll() || [];
    if (!accounts) return [];

    const accountWithoutParentAddress = accounts.filter(
      ({ value }) => !value.parentAddress || value.isDerivable
    );

    return accountWithoutParentAddress;
  };

  private async getAllAccounts({
    type = null,
  }: RequestGetAllAccounts): Promise<Account[]> {
    // migrations

    const accounts = await AccountManager.getAll(type);
    if (!accounts) return [];
    return accounts.getAll();
  }

  private async deriveAccount({
    name,
    type,
    address,
  }: RequestDeriveAccount): Promise<Account> {
    const account = await AccountManager.derive(name, type, address);
    await this.setSelectedAccount(account);
    return account;
  }

  private async setNetwork({
    isTestnet,
    id,
    type,
  }: RequestSetNetwork): Promise<SelectedChain> {
    const chains: SelectedChain = this.chains.getValue();
    chains[id] = {
      isTestnet: isTestnet,
      type: type,
    };
    this.chains.next(chains);
    const network = Network.getInstance();
    network.set(chains);
    await Network.set<Network>(network);
    await this.provider.setProvider(id, type);
    await this.transactionHistory.addChain({ chainId: id });

    return chains;
  }

  private async deleteSelectNetwork({ id }: RequestDeleteSelectNetwork) {
    const chains: SelectedChain = this.chains.getValue();
    delete chains[id];
    this.chains.next(chains);
    //save Object
    const network = Network.getInstance();
    network.set(chains);
    this.chains.next(chains);
    await Network.set<Network>(network);
    await this.provider.disconnectChain(id);
    await this.transactionHistory.removeChains({ chainIds: [id] });
    return chains;
  }
  private networksSubscribe = (id: string, port: Port) => {
    const cb = createSubscription<"pri(network.subscription)">(id, port);
    const subscription = this.chains.subscribe((data) => cb(data));
    port.onDisconnect.addListener(() => {
      subscription.unsubscribe();
    });
    return this.chains.getValue();
  };
  private assetsSubscribe = (id: string, port: Port) => {
    const cb = createSubscription<"pri(assestsBanlance.subscription)">(
      id,
      port
    );
    const subscription = this.assetsBalance.assets.subscribe((data) =>
      cb(data)
    );
    port.onDisconnect.addListener(() => {
      subscription.unsubscribe();
    });
    return this.assetsBalance.assets.getValue();
  };

  /**
   *
   * @param account if account is nullm that means that all account are selected
   */
  private async setSelectedAccount(account: Account | null) {
    const networkSelected = this.assetsBalance.getNetwork();
    const allAccounts = (await Accounts.get()) as Accounts;
    const provider = this.provider.getProviders();
    const selectedAccount = (await SelectedAccount.get()) as SelectedAccount;

    if (!account && selectedAccount.value) {
      const filterAccount = Object.keys(allAccounts.data).filter(
        (_account) => ![selectedAccount.key].includes(_account as AccountKey)
      );
      await Promise.all(
        filterAccount.map((accountKey) => {
          return this.assetsBalance.loadAssets(
            allAccounts.data[accountKey as AccountTypes],
            provider,
            networkSelected
          );
        })
      );
      this.assetsBalance.assets.next(this.assetsBalance._assets);
    } else if (account && !selectedAccount.value) {
      const filterAccount = Object.keys(allAccounts.data).filter(
        (_account) => _account !== account.key
      );
      await Promise.all(
        filterAccount.map((account) => {
          this.assetsBalance.deleteAsset(
            allAccounts.data[account as AccountTypes],
            provider,
            networkSelected,
            false
          );
        })
      );
      this.assetsBalance.assets.next(this.assetsBalance._assets);
    } else if (account && selectedAccount.value) {
      this.assetsBalance.deleteAsset(
        selectedAccount,
        provider,
        networkSelected,
        false
      );
      await this.assetsBalance.loadAssets(account, provider, networkSelected);
      this.assetsBalance.assets.next(this.assetsBalance._assets);
    }
    this.transactionHistory.setAccount(account);

    await SelectedAccount.set<SelectedAccount>(
      SelectedAccount.fromAccount(account)
    );
  }

  private async getSelectedAccount(): Promise<Account | undefined> {
    return SelectedAccount.get<SelectedAccount>();
  }

  private async getNetwork(): Promise<Network> {
    const Allstored = await Storage.getInstance().storage.get(null);

    if (Allstored) {
      // migrate vault
      const foundOldVaultKey = Object.keys(Allstored).find((key) => {
        if (key === "Network") return false;
        const object = Allstored[key];

        if (object.chain) {
          return true;
        }
      });

      if (foundOldVaultKey) {
        const newVault = Allstored[foundOldVaultKey];
        await Storage.getInstance().storage.set({ ["Network"]: newVault });
        await Storage.getInstance().storage.remove(foundOldVaultKey);
      }
    }

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
    const Chains = await Network.get<Network>();
    if (!Chains) throw new Error("failed_to_get_network");
    const accounts = await AccountManager.getAll();
    if (!accounts) throw new Error("failed_to_get_accounts");

    const ownAccounts = accounts
      .getAll()
      .map((account) => new Contact(account.value.name, account.value.address));

    const contacts = registry.getAllContacts();

    return {
      accounts: [ownAccounts, contacts].flat(),
    };
  }

  private async saveContact({ contact }: RequestSaveContact) {
    await Registry.addContact(contact);
  }

  private async removeContact({ address }: RequestRemoveContact) {
    await Registry.removeContact(address);
  }

  private async updateContact({ address, name }: RequestUpdateContact) {
    await Registry.updateContact(address, name);
  }

  private async getActivity(): Promise<Record[]> {
    // return Activity.getRecords();
    return [];
  }

  private activitySubscribe = (id: string, port: Port) => {
    const cb = createSubscription<"pri(activity.activitySubscribe)">(id, port);
    const subscription = this.transactionHistory.transactions.subscribe(() =>
      cb(this.transactionHistory.getTransactions())
    );
    port.onDisconnect.addListener(() => {
      subscription.unsubscribe();
    });

    return this.transactionHistory.getTransactions();
  };

  private async setAccountToActivity({ address }: RequestSetAccountToActivity) {
    const allAccounts = await AccountManager.getAll();

    const account = allAccounts
      ?.getAll()
      .find(({ value }) => value.address === address);

    if (!account) return;

    await this.transactionHistory.setAccount(account);
  }

  private async saveCustomChain({ chain }: RequestSaveCustomChain) {
    await Chains.saveCustomChain(chain);
  }

  private async removeCustomChain({ chainName }: RequestRemoveCustomChain) {
    await Chains.removeCustomChain(chainName);
  }

  private async getCustomChains(): Promise<Chain[]> {
    const Allstored = await Storage.getInstance().storage.get(null);

    if (Allstored) {
      // migrate chains
      const foundOldVaultKey = Object.keys(Allstored).find((key) => {
        if (key === "Chains") return false;
        const object = Allstored[key];

        if (object.custom) {
          return true;
        }
      });
      if (foundOldVaultKey) {
        const newVault = Allstored[foundOldVaultKey];
        await Storage.getInstance().storage.set({ ["Chains"]: newVault });
        await Storage.getInstance().storage.remove(foundOldVaultKey);
      }
    }

    const chains = await Chains.get<Chains>();
    if (!chains) throw new Error("failed_to_get_chains");
    return chains.custom;
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
    fee,
  }: RequestUpdateActivity) {
    // @ts-expect-error -- *
    await Activity.updateRecordStatus(txHash, status, error, fee);
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

  private async updateTx({ tx }: RequestUpdateTx) {
    const providers = this.provider.getProviders();

    const seed = await this.showKey({
      address: tx.senderAddress,
    });

    let signer;

    const provider = providers[tx.originNetwork!.id];

    if (tx.originNetwork?.type === "evm") {
      signer = new Wallet(
        seed as string,
        provider.provider as unknown as providers.JsonRpcProvider
      );
    } else if (tx.originNetwork?.type === "wasm") {
      signer = keyring.keyring.addFromMnemonic(seed as string);
    } else if (tx.originNetwork.type === "ol") {
      signer = seed;
    }

    this.tx.updateTx({
      ...tx,
      provider,
      signer,
    });
  }

  private getFeeSubscribe(id: string, port: Port) {
    const cb = createSubscription<"pri(send.getFeeSubscribe)">(id, port);
    const subscription = this.tx.tx.subscribe(async () =>
      cb(await this.tx.getFee())
    );
    port.onDisconnect.addListener(() => {
      subscription.unsubscribe();
      this.tx.clear();
    });
  }

  private async sendSubstrateTx() {
    try {
      const {
        provider,
        signer,
        senderAddress,
        amount,
        asset,
        destinationAddress,
        originNetwork,
        targetNetwork,
      } = this.tx.tx.getValue();

      const tip = this.tx.tip;
      const tx = this.tx.substrateTx;
      const isSwap = this.tx.isSwap;

      const substateProvider = provider?.provider as unknown as ApiPromise;

      const { block } = await substateProvider.rpc.chain.getBlock();

      const unsub = await tx!.signAndSend(
        signer as AddressOrPair,
        {
          tip: tip || undefined,
        },
        async ({ events, txHash, status }) => {
          if (String(status.type) === "InBlock") {
            let fee = "";
            let tip = "";

            events.forEach(({ event }) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const eventData = event.toHuman()?.data as any;

              if (eventData?.actualFee) {
                fee = eventData.actualFee.replace(/,/g, "");
              }

              if (eventData?.tip) {
                tip = eventData.tip.replace(/,/g, "");
              }
            });

            const hash = txHash.toString();
            const timestamp = Math.round(new Date().getTime() / 1000);

            const transaction: Transaction = {
              id: hash,
              amount: amount,
              asset: asset!.symbol,
              blockNumber: Number(block.header.number.toString()),
              fee,
              hash,
              originNetwork: originNetwork?.name as string,
              targetNetwork: targetNetwork?.name as string,
              sender: senderAddress,
              recipient: destinationAddress,
              status: RecordStatus.PENDING,
              tip,
              timestamp,
              type: RecordType.TRANSFER,
              isSwap: isSwap || false,
            };

            await this.addActivity({
              txHash: hash,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              record: transaction as unknown as any,
            });
            this.transactionHistory.addTransactionToChain({
              chainId: originNetwork?.id as string,
              transaction,
              originNetwork: originNetwork as Chain,
              targetNetwork: targetNetwork as Chain,
            });
          }
          if (status.isFinalized) {
            const failedEvents = events.filter(({ event }) =>
              substateProvider?.events.system.ExtrinsicFailed.is(event)
            );
            let status = RecordStatus.PENDING;
            let error = undefined;
            if (failedEvents.length > 0) {
              failedEvents.forEach(
                ({
                  event: {
                    data: [_error],
                  },
                }: {
                  event: {
                    data: Partial<{
                      isModule: boolean;
                      asModule:
                        | Uint8Array
                        | {
                            error: BN;
                            index: BN;
                          }
                        | {
                            error: BN | Uint8Array;
                            index: BN;
                          };
                      toString: () => string;
                    }>[];
                  };
                }) => {
                  if (_error.isModule) {
                    const decoded = substateProvider.registry.findMetaError(
                      _error.asModule as
                        | Uint8Array
                        | {
                            error: BN;
                            index: BN;
                          }
                        | {
                            error: BN | Uint8Array;
                            index: BN;
                          }
                    );
                    const { docs, method, section } = decoded;
                    error = `${section}.${method}: ${docs.join(" ")}`;
                  } else {
                    error = _error.toString?.();
                  }
                }
              );
              status = RecordStatus.FAIL;
            } else {
              status = RecordStatus.SUCCESS;
            }
            const hash = txHash.toString();
            await this.updateActivity({ txHash: hash, status, error });
            this.sendTxNotification({ title: `tx ${status}`, message: hash });
            this.transactionHistory.updateTransaction({
              chainId: originNetwork?.id as string,
              id: hash,
              status,
            });

            unsub();
          }
        }
      );

      return true;
    } catch (error) {
      this.sendTxNotification({
        title: "tx error",
        message: "",
      });
    }
  }

  private async sendEvmTx() {
    try {
      const {
        signer,
        senderAddress,
        amount,
        asset,
        destinationAddress,
        originNetwork,
        targetNetwork,
        provider,
      } = this.tx.tx.getValue();

      const evmTx = this.tx.evmTx as providers.TransactionRequest;
      const isSwap = this.tx.isSwap;
      const evmProvider =
        provider?.provider as unknown as providers.JsonRpcProvider;

      const tx = await (signer as Signer).sendTransaction(evmTx);
      const txHash = tx.hash;

      const transaction: Transaction = {
        id: txHash,
        amount: amount,
        asset: asset!.symbol,
        blockNumber: tx.blockNumber!,
        hash: txHash,
        originNetwork: originNetwork?.name as string,
        recipient: destinationAddress,
        targetNetwork: targetNetwork?.name as string,
        sender: senderAddress,
        status: RecordStatus.PENDING,
        type: RecordType.TRANSFER,
        tip: "",
        timestamp: tx.timestamp!,
        fee: "",
        isSwap: isSwap || false,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await this.addActivity({ txHash, record: transaction as any });
      this.transactionHistory.addTransactionToChain({
        chainId: originNetwork?.id as string,
        transaction,
        originNetwork: originNetwork as Chain,
        targetNetwork: targetNetwork as Chain,
      });

      const txReceipt = await evmProvider.getTransaction(txHash);

      const result = await txReceipt.wait();

      const status =
        result.status === 1 ? RecordStatus.SUCCESS : RecordStatus.FAIL;

      const { gasUsed, effectiveGasPrice } = result;

      const fee = utils.formatEther(gasUsed.mul(effectiveGasPrice).toString());

      const error = "";
      await this.updateActivity({ txHash, status, error, fee });
      this.sendTxNotification({ title: `tx ${status}`, message: txHash });
      this.transactionHistory.updateTransaction({
        chainId: originNetwork?.id as string,
        id: txHash,
        status,
      });
      return true;
    } catch (error) {
      this.sendTxNotification({ title: `tx failed`, message: "" });
    }
  }

  private async sendOLTx() {
    const {
      provider,
      signer,
      senderAddress,
      amount,
      asset,
      destinationAddress,
      originNetwork,
      targetNetwork,
    } = this.tx.tx.getValue();

    const olProvider = provider?.provider as unknown as OlProvider;

    const tx = await olProvider.transfer({
      pk: signer as string,
      sender: senderAddress,
      recipient: destinationAddress,
      amount: amount,
    });

    const hash = tx.hash;
    const status = tx.success ? RecordStatus.SUCCESS : RecordStatus.FAIL;

    const transaction: Transaction = {
      id: tx?.hash,
      amount: amount,
      asset: asset!.symbol,
      blockNumber: tx.blockNumber,
      hash: tx?.hash as string,
      originNetwork: originNetwork?.name as string,
      recipient: destinationAddress,
      targetNetwork: targetNetwork?.name as string,
      sender: senderAddress,
      status,
      type: RecordType.TRANSFER,
      tip: "",
      timestamp: tx?.timestamp,
      fee: tx?.fee || "",
      isSwap: false,
      version: tx?.version as string,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await this.addActivity({ txHash: hash, record: transaction as any });
    this.transactionHistory.addTransactionToChain({
      chainId: originNetwork?.id as string,
      transaction,
      originNetwork: originNetwork as Chain,
      targetNetwork: targetNetwork as Chain,
    });
    this.sendTxNotification({ title: `tx ${status}`, message: hash });

    return true;
  }

  private async sendTx() {
    const originNetwork = this.tx.tx.getValue().originNetwork;
    if (originNetwork?.type === "evm") {
      return this.sendEvmTx();
    } else if (originNetwork?.type === "wasm") {
      return this.sendSubstrateTx();
    } else if (originNetwork?.type === "ol") {
      return this.sendOLTx();
    }
  }

  private sendTxNotification({
    title,
    message,
  }: {
    title: string;
    message: string;
  }) {
    Browser.notifications.create("id", {
      title,
      message,
      iconUrl: notificationIcon,
      type: "basic",
    });
  }

  async handle<TMessageType extends MessageTypes>(
    id: string,
    type: TMessageType,
    request: RequestTypes[TMessageType],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    port: Port
  ): Promise<ResponseType<TMessageType>> {
    switch (type) {
      case "pri(accounts.getAccountsToDerive)":
        return this.getAccountsToDerive();
      case "pri(accounts.createAccounts)":
        return this.createAccounts(request as RequestCreateAccount);
      case "pri(accounts.importAccount)":
        return this.importAccount(request as RequestImportAccount);
      case "pri(accounts.changePassword)":
        return this.changePassword(request as RequestChangePassword);
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
      case "pri(auth.validatePassword)":
        return this.validatePassword(request as RequestValidatePassword);
      case "pri(auth.setAutoLock)":
        return this.setAutoLock(request as RequestSetAutoLock);
      case "pri(auth.unlock)":
        return this.unlock();
      case "pri(auth.getLock)":
        return this.getLock();
      case "pri(auth.signOut)":
        return this.signOut();
      case "pri(auth.alreadySignedUp)":
        return this.alreadySignedUp();
      case "pri(auth.isSessionActive)":
        return this.isSessionActive();
      case "pri(auth.showKey)":
        return this.showKey(request as RequestShowKey);

      case "pri(network.setNetwork)":
        return this.setNetwork(request as RequestSetNetwork);
      case "pri(network.deleteSelectNetwork)":
        return this.deleteSelectNetwork(request as RequestDeleteSelectNetwork);
      case "pri(network.getNetwork)":
        return this.getNetwork();
      case "pri(network.saveCustomChain)":
        return this.saveCustomChain(request as RequestSaveCustomChain);
      case "pri(network.removeCustomChain)":
        return this.removeCustomChain(request as RequestRemoveCustomChain);
      case "pri(network.getCustomChains)":
        return this.getCustomChains();
      case "pri(network.subscription)":
        return this.networksSubscribe(id, port);
      case "pri(assestsBanlance.subscription)":
        return this.assetsSubscribe(id, port);
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
      case "pri(contacts.updateContact)":
        return this.updateContact(request as RequestUpdateContact);
      case "pri(contacts.removeContact)":
        return this.removeContact(request as RequestRemoveContact);

      case "pri(activity.activitySubscribe)":
        return this.activitySubscribe(id, port);
      // case "pri(activity.getHistoricActivity)":
      //   return this.getHistoricActivity();
      case "pri(activity.getActivity)":
        return this.getActivity();
      case "pri(activity.addActivity)":
        return this.addActivity(request as RequestAddActivity);
      case "pri(activity.updateActivity)":
        return this.updateActivity(request as RequestUpdateActivity);
      case "pri(activity.setAccountToActivity)":
        return this.setAccountToActivity(
          request as RequestSetAccountToActivity
        );

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

      case "pri(send.updateTx)":
        return this.updateTx(request as RequestUpdateTx);
      case "pri(send.getFeeSubscribe)":
        return this.getFeeSubscribe(id, port);
      case "pri(send.sendTx)":
        return this.sendTx();

      default:
        throw new Error(`Unable to handle message of type ${type}`);
    }
  }
}

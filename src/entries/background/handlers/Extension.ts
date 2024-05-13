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
import Chains from "@src/storage/entities/Chains";
import Register from "@src/storage/entities/registry/Register";
import Assets from "@src/storage/entities/Assets";
import TrustedSites from "@src/storage/entities/TrustedSites";
import { AccountKey, AccountType } from "@src/accounts/types";
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
  RequestSendEvmTx,
  RequestSendSubstrateTx,
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
  RequestGetProvider,
  RequestUpdateTx,
} from "./request-types";
import { Wallet, ethers, providers, utils } from "ethers";
import { ApiPromise, WsProvider } from "@polkadot/api";
import keyring from "@polkadot/ui-keyring";
import { RecordStatus, RecordType } from "@src/storage/entities/activity/types";
import { BN } from "@polkadot/util";
import notificationIcon from "/icon-128.png";
// import { getChainHistoricHandler } from "@src/services/historic-transactions";
import { Chain, Transaction, SelectedChain } from "@src/types";
// import { transformAddress } from "@src/utils/account-utils";
import { Port } from "./types";
import { BehaviorSubject } from "rxjs";
import { createSubscription } from "./subscriptions";
// import { SelectedChain } from "@src/providers/assetProvider/types";
import { Provider } from "@src/storage/entities/Provider";
import AssetBalance from "@src/storage/entities/AssetBalance";
import { init } from "i18next";
import {
  Transaction as TransactionEntity,
  Tx,
} from "@src/storage/entities/Transaction";

export const getProvider = (rpc: string, type: string) => {
  if (type?.toLowerCase() === "evm")
    return new ethers.providers.JsonRpcProvider(rpc as string);

  if (type?.toLowerCase() === "wasm")
    return ApiPromise.create({ provider: new WsProvider(rpc as string) });
};

const getWebAPI = (): typeof chrome => {
  return navigator.userAgent.match(/chrome|chromium|crios/i)
    ? chrome
    : window.browser;
};

const WebAPI = getWebAPI();

export default class Extension {
  private provider = new Provider();
  private assetsBalance = new AssetBalance();
  private Chains = new BehaviorSubject({});
  private tx = new TransactionEntity();

  constructor() {
    this.subscriptionStatusProvider();
  }

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
    this.validatePasswordFormat(currentPassword);
    this.validatePasswordFormat(newPassword);

    const seed = await this.showKey();

    if (!seed) throw new Error("failed_to_get_seed");

    await AccountManager.changePassword(
      seed as string,
      currentPassword,
      newPassword
    );
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
  private subscriptionStatusProvider = () => {
    this.provider.statusNetwork.subscribe(async (data) => {
      const [selectedAccount, allAccounts] = await Promise.all([
        SelectedAccount.get(),
        Accounts.get(),
      ]);
      const networksAssest = this.assetsBalance.getNetwork();
      const newNetwork: any[] = Object.keys(data).filter(
        (chain) =>
          !networksAssest.includes(chain) && data[chain] === "connected"
      );
      const deleteNetwork = networksAssest.filter(
        (network) =>
          Object.keys(data).includes(network) &&
          data[network] === "disconnected"
      );
      const provider = this.provider.getProviders();

      if (newNetwork.length !== 0) {
        if ((selectedAccount as Account).value) {
          await this.assetsBalance.loadAssets(
            selectedAccount as Account,
            provider,
            newNetwork
          );
        } else {
          await Promise.all(
            Object.keys((allAccounts as Accounts).data).map((accountKey) => {
              return this.assetsBalance.loadAssets(
                (allAccounts as Accounts).data[accountKey],
                provider,
                newNetwork
              );
            })
          );
        }
      }

      if (deleteNetwork.length !== 0) {
        if ((selectedAccount as Account).value) {
          this.assetsBalance.deleteAsset(
            selectedAccount as Account,
            provider,
            deleteNetwork
          );
        } else {
          Object.keys((allAccounts as Accounts).data).forEach((accountKey) => {
            return this.assetsBalance.deleteAsset(
              (allAccounts as Accounts).data[accountKey],
              provider,
              deleteNetwork
            );
          });
        }
      }
    });
  };

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

  private removeAccount({ key }: RequestRemoveAccout) {
    AccountManager.remove(key);
  }

  private async changeAccountName({ key, newName }: RequestChangeAccountName) {
    const account = await AccountManager.changeName(key, newName);
    await SelectedAccount.set<SelectedAccount>(account);
  }

  private async resetWallet() {
    await Storage.getInstance().resetWallet();
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
    const newkeyring = await Vault.getKeyring(keyring);
    return newkeyring.getKey(address);
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
    const accounts = (await AccountManager.getAll())?.getAll();

    if (!accounts) return undefined;

    const account = accounts.find(({ value }) => value.address === address);

    if (!account) return undefined;

    const keyring = await Vault.getKeyring(account.type);
    return keyring.getKey(address);
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
      ({ value, type }) =>
        !value.parentAddress && type !== AccountType.IMPORTED_EVM
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
    const chains: SelectedChain = this.Chains.getValue();
    chains[id] = {
      isTestnet: isTestnet,
      type: type,
    };
    this.Chains.next(chains);
    const network = Network.getInstance();
    network.set(chains);
    await Network.set<Network>(network);
    await this.provider.setProvider(id, type);
    return chains;
  }

  private async deleteSelectNetwork({ id }: RequestDeleteSelectNetwork) {
    const chains: SelectedChain = this.Chains.getValue();
    delete chains[id];
    this.Chains.next(chains);
    //save Object
    const network = Network.getInstance();
    network.set(chains);
    this.Chains.next(chains);
    await Network.set<Network>(network);
    await this.provider.disconnectChain(id);
    return chains;
  }
  private networksSubscribe = (id: string, port: Port) => {
    const cb = createSubscription<"pri(network.subscription)">(id, port);
    const subscription = this.Chains.subscribe((data) => cb(data));
    port.onDisconnect.addListener(() => {
      subscription.unsubscribe();
      subscription.unsubscribe();
    });
    return this.Chains;
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
      subscription.unsubscribe();
    });
    return this.assetsBalance.assets.getValue();
  };

  private async setSelectedAccount(account: Account) {
    const networkSelected = this.assetsBalance.getNetwork();
    const allAccounts: any = await Accounts.get();
    const provider = this.provider.getProviders();
    const selectedAccount: any = await SelectedAccount.get();
    if (!account && selectedAccount.value) {
      const filterAccount = Object.keys(allAccounts.data).filter(
        (_account) => ![selectedAccount.key].includes(_account)
      );
      await Promise.all(
        filterAccount.map((accountKey) => {
          return this.assetsBalance.loadAssets(
            allAccounts.data[accountKey],
            provider,
            networkSelected
          );
        })
      );
    } else if (account && !selectedAccount.value) {
      const filterAccount = Object.keys(allAccounts.data).filter(
        (_account) => _account !== account.key
      );
      await Promise.all(
        filterAccount.map((account) => {
          this.assetsBalance.deleteAsset(
            allAccounts.data[account],
            provider,
            networkSelected,
            false
          );
        })
      );
    } else if (account && selectedAccount.value) {
      this.assetsBalance.deleteAsset(
        selectedAccount,
        provider,
        networkSelected,
        false
      );
      await this.assetsBalance.loadAssets(account, provider, networkSelected);
    }
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

  // private async getRegistryAddresses() {
  //   const registry = await Registry.get<Registry>();
  //   if (!registry) throw new Error("failed_to_get_registry");
  //   const Chains = await Network.get<Network>();
  //   if (!Chains) throw new Error("failed_to_get_network");
  //   const accounts = await AccountManager.getAll();
  //   if (!accounts) throw new Error("failed_to_get_accounts");
  //   return {
  //     ownAccounts: accounts
  //       .getAll()
  //       .map(
  //         (account) => new Contact(account.value.name, account.value.address)
  //       ),
  //     contacts: registry.getAllContacts(),
  //     recent: registry.getRecentAddresses(Chains),
  //   };
  // }

  private async saveContact({ contact }: RequestSaveContact) {
    await Registry.addContact(contact);
  }

  private async removeContact({ address }: RequestRemoveContact) {
    await Registry.removeContact(address);
  }

  private async updateContact({ address, name }: RequestUpdateContact) {
    await Registry.updateContact(address, name);
  }

  // private async getHistoricActivity() {
  //   const selectedAccount = await SelectedAccount.get<SelectedAccount>();
  //   const selectedChain = await Network.get<Network>();

  //   const address = selectedAccount?.value.address;
  //   const chainPrefix = selectedChain?.chain?.prefix;

  //   // @ts-expect-error -- *
  //   const formatedAddress = transformAddress(address, chainPrefix || 0);

  //   return await getChainHistoricHandler({
  //     chainId: selectedChain!.chain!.id,
  //     address: formatedAddress,
  //   });
  // }

  private async getActivity(): Promise<Record[]> {
    return Activity.getRecords();
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
        signer,
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
            this.sendUpdateActivityMessage();
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

              // swap && (await Extension.addSwap(swap.protocol, { id: swap.id }));
            }
            const hash = txHash.toString();
            await this.updateActivity({ txHash: hash, status, error });
            this.sendTxNotification({ title: `tx ${status}`, message: hash });
            this.sendUpdateActivityMessage();
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

      const evmTx = this.tx.substrateTx;
      const isSwap = this.tx.isSwap;
      const evmProvider =
        provider?.provider as unknown as providers.JsonRpcProvider;

      const tx = await signer.sendTransaction(evmTx);
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
      this.sendUpdateActivityMessage();

      const txReceipt = await evmProvider.getTransaction(txHash);

      const result = await txReceipt.wait();

      const status =
        result.status === 1 ? RecordStatus.SUCCESS : RecordStatus.FAIL;

      const { gasUsed, effectiveGasPrice } = result;

      const fee = utils.formatEther(gasUsed.mul(effectiveGasPrice).toString());

      const error = "";
      await this.updateActivity({ txHash, status, error, fee });
      this.sendTxNotification({ title: `tx ${status}`, message: txHash });
      this.sendUpdateActivityMessage();
      return true;
    } catch (error) {
      this.sendTxNotification({ title: `tx failed`, message: "" });
    }
  }

  private async sendTx() {
    const originNetwork = this.tx.tx.getValue().originNetwork;
    if (originNetwork?.type === "evm") {
      return this.sendEvmTx();
    } else if (originNetwork?.type === "wasm") {
      return this.sendSubstrateTx();
    }
  }

  private sendUpdateActivityMessage() {
    WebAPI.runtime.sendMessage({
      origin: "kuma",
      method: "update_activity",
    });
  }

  private sendTxNotification({
    title,
    message,
  }: {
    title: string;
    message: string;
  }) {
    WebAPI.notifications.create("id", {
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
      // case "pri(contacts.getRegistryAddresses)":
      //   return this.getRegistryAddresses();
      case "pri(contacts.saveContact)":
        return this.saveContact(request as RequestSaveContact);
      case "pri(contacts.updateContact)":
        return this.updateContact(request as RequestUpdateContact);
      case "pri(contacts.removeContact)":
        return this.removeContact(request as RequestRemoveContact);

      // case "pri(activity.getHistoricActivity)":
      //   return this.getHistoricActivity();
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

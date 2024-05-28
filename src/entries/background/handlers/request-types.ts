import { AccountKey, AccountType } from "@src/accounts/types";
import Account from "@src/storage/entities/Account";
import { AssetBalance } from "@src/storage/entities/AssetBalance";
import Chains from "@src/storage/entities/Chains";
import Network from "@src/storage/entities/Network";
import Record from "@src/storage/entities/activity/Record";
import { RecordStatus } from "@src/storage/entities/activity/types";
import Contact from "@src/storage/entities/registry/Contact";
import Setting from "@src/storage/entities/settings/Setting";
import {
  SettingKey,
  SettingType,
  SettingValue,
} from "@src/storage/entities/settings/types";
import {
  Chain,
  ChainType,
  HistoricTransaction,
  SelectedChain,
  Transaction,
} from "@src/types";
import { providers } from "ethers";

export interface RequestSignUp {
  password: string;
  privateKeyOrSeed: string;
}

export interface RequestCreateAccount {
  seed: string;
  name: string;
  password: string | undefined;
  isSignUp: boolean | undefined;
}

export interface RequestImportAccount {
  name: string;
  privateKeyOrSeed: string;
  password: string | undefined;
  accountTypesToImport: AccountType[];
  isSignUp: boolean | undefined;
}

export interface RequestChangePassword {
  currentPassword: string;
  newPassword: string;
}

export interface RequestRemoveAccout {
  key: AccountKey;
}

export interface RequestChangeAccountName {
  key: AccountKey;
  newName: string;
}

export interface RequestSignIn {
  password: string;
}

export interface RequestValidatePassword {
  password: string;
  key: AccountKey;
  keyring: AccountType;
}
export interface RequestSetAutoLock {
  time: number; //in minutes
}

export interface RequestGetAccount {
  key: AccountKey;
}

export interface RequestGetAllAccounts {
  type: AccountType[] | null;
}

export interface RequestDeriveAccount {
  name: string;
  type: AccountType;
  address: string;
}

export interface RequestSetNetwork {
  id: string;
  isTestnet?: boolean;
  type: ChainType;
}
export interface RequestDeleteSelectNetwork {
  id: string;
}
export interface RequestAddNetwork {
  id: string;
  type: ChainType;
}
export interface RequestSaveCustomChain {
  chain: Chain;
}

export interface RequestRemoveCustomChain {
  chainName: string;
}

export interface RequestGetXCMChains {
  chainName: string;
}

export interface RequestGetSetting {
  type: SettingType;
  key: SettingKey;
}

export interface RequestUpdateSetting {
  type: SettingType;
  key: SettingKey;
  value: SettingValue;
}

export interface RequestSaveContact {
  contact: Contact;
}

export interface RequestRemoveContact {
  address: string;
}
export interface RequestUpdateContact {
  name: string;
  address: string;
}
export interface RequestAddActivity {
  txHash: string;
  record: Record;
}

export interface RequestUpdateActivity {
  txHash: string;
  status: RecordStatus;
  fee?: string;
  error?: string | undefined;
}

export interface RequestAddAsset {
  chain: string;
  asset: {
    symbol: string;
    address: string;
    decimals: number;
  };
}

export interface RequestGetAssetsByChain {
  chain: string;
}

export interface RequestAddTrustedSite {
  site: string;
}

export interface RequestRemoveTrustedSite {
  site: string;
}

export interface getLock {
  lock: number;
}

export interface RequestSendTxBase {
  amount: string;
  asset: {
    symbol: string;
    id: string;
  };
  originAddress: string;
  destinationAddress: string;
  destinationNetwork: string;
  networkName: string;
  rpc: string;
  isSwap?: boolean;
}

export interface RequestSendSubstrateTx extends RequestSendTxBase {
  hexExtrinsic: string;
  tip?: string;
}

export interface RequestSendEvmTx extends RequestSendTxBase {
  evmTx?: providers.TransactionRequest;
}

export interface RequestShowKey {
  address: string;
}

export interface RequestUpdateTx {
  tx: {
    amount: string;
    senderAddress: string;
    destinationAddress: string;
    originNetwork: Chain;
    targetNetwork: Chain;
    asset: {
      id: string;
      symbol: string;
      decimals: number;
      balance: string;
      address?: string | undefined;
    };
  };
}

export interface RequestSetAccountToActivity {
  address: string;
}

export interface Request {
  "pri(accounts.createAccounts)": [RequestCreateAccount, boolean];
  "pri(accounts.importAccount)": [RequestImportAccount, void];
  "pri(accounts.changePassword)": [RequestChangePassword, void];
  "pri(accounts.removeAccount)": [RequestRemoveAccout, void];
  "pri(accounts.changeAccountName)": [RequestChangeAccountName, void];
  "pri(accounts.areAccountsInitialized)": [null, boolean];
  "pri(accounts.getAccount)": [RequestGetAccount, Account | undefined];
  "pri(accounts.getAllAccounts)": [RequestGetAllAccounts, Account[]];
  "pri(accounts.deriveAccount)": [RequestDeriveAccount, Account];
  "pri(accounts.setSelectedAccount)": [Account | null, void];
  "pri(accounts.getSelectedAccount)": [null, Account | undefined];
  "pri(accounts.getAccountsToDerive)": [null, Account[]];

  "pri(auth.isAuthorized)": [null, boolean];
  "pri(auth.resetWallet)": [null, void];
  "pri(auth.signIn)": [RequestSignIn, void];
  "pri(auth.validatePassword)": [RequestValidatePassword, string | undefined];
  "pri(auth.setAutoLock)": [RequestSetAutoLock];
  "pri(auth.unlock)": [null, void];
  "pri(auth.getLock)": [null, number];
  "pri(auth.signOut)": [null, void];
  "pri(auth.alreadySignedUp)": [null, boolean];
  "pri(auth.isSessionActive)": [null, boolean];
  "pri(auth.showKey)": [RequestShowKey, string | undefined];

  "pri(network.setNetwork)": [RequestSetNetwork, boolean];
  "pri(network.getNetwork)": [null, Network];
  "pri(network.getAllChains)": [null, Chains];
  "pri(network.saveCustomChain)": [RequestSaveCustomChain, void];
  "pri(network.removeCustomChain)": [RequestRemoveCustomChain, void];
  "pri(network.getCustomChains)": [null, Chain[]];
  "pri(network.deleteSelectNetwork)": [
    RequestDeleteSelectNetwork,
    RequestSetNetwork
  ];
  "pri(network.getXCMChains)": [RequestGetXCMChains, Chain[]];
  "pri(network.subscription)": [null, SelectedChain, SelectedChain];

  "pri(assestsBanlance.subscription)": [null, AssetBalance, AssetBalance];

  "pri(settings.getGeneralSettings)": [null, Setting[]];
  "pri(settings.getAdvancedSettings)": [null, Setting[]];
  "pri(settings.getSetting)": [RequestGetSetting, Setting | undefined];
  "pri(settings.updateSetting)": [RequestUpdateSetting, void];

  "pri(contacts.getContacts)": [null, Contact[]];
  "pri(contacts.getRegistryAddresses)": [
    null,
    {
      accounts: Contact[];
    }
  ];
  "pri(contacts.saveContact)": [RequestSaveContact, void];
  "pri(contacts.updateContact)": [RequestUpdateContact, void];
  "pri(contacts.removeContact)": [RequestRemoveContact, void];

  "pri(activity.getHistoricActivity)": [null, HistoricTransaction];
  "pri(activity.getActivity)": [null, Record[]];
  "pri(activity.addActivity)": [RequestAddActivity, void];
  "pri(activity.updateActivity)": [RequestUpdateActivity, void];
  "pri(activity.activitySubscribe)": [null, Transaction[], Transaction[]];
  "pri(activity.updateRecordStatus)": [string, void];
  "pri(activity.setAccountToActivity)": [RequestSetAccountToActivity, void];

  "pri(assets.addAsset)": [RequestAddAsset, void];
  "pri(assets.getAssetsByChain)": [
    RequestGetAssetsByChain,
    {
      symbol: string;
      address: string;
      decimals: number;
    }[]
  ];

  "pri(trustedSites.getTrustedSites)": [null, string[]];
  "pri(trustedSites.addTrustedSite)": [RequestAddTrustedSite, void];
  "pri(trustedSites.removeTrustedSite)": [RequestRemoveTrustedSite, void];

  "pri(send.updateTx)": [RequestUpdateTx, string];
  "pri(send.getFeeSubscribe)": [null, void, string];
  "pri(send.sendTx)": [null, boolean];
}

export type MessageTypes = keyof Request;

export type RequestTypes = {
  [MessageType in keyof Request]: Request[MessageType][0];
};

export declare type RequestType<TMessageType extends keyof Request> =
  Request[TMessageType][0];

export type ResponseTypes = {
  [MessageType in keyof Request]: Request[MessageType][1];
};

export type ResponseType<TMessageType extends keyof Request> =
  Request[TMessageType][1];

type KeysWithDefinedValues<T> = {
  [K in keyof T]: T[K] extends undefined ? never : K;
}[keyof T];

type NoUndefinedValues<T> = {
  [K in KeysWithDefinedValues<T>]: T[K];
};

type IsNull<T, K extends keyof T> = {
  [K1 in Exclude<keyof T, K>]: T[K1];
} & T[K] extends null
  ? K
  : never;

type NullKeys<T> = { [K in keyof T]: IsNull<T, K> }[keyof T];

export type SubscriptionMessageTypes = NoUndefinedValues<{
  [MessageType in keyof Request]: Request[MessageType][2];
}>;

export type MessageTypesWithSubscriptions = keyof SubscriptionMessageTypes;
export type MessageTypesWithNoSubscriptions = Exclude<
  MessageTypes,
  keyof SubscriptionMessageTypes
>;

export declare type KnownSubscriptionDataTypes<T extends MessageTypes> =
  Request[T][2];

export type MessageTypesWithNullRequest = NullKeys<RequestTypes>;

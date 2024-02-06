import { AccountKey, AccountType } from "@src/accounts/types";
import Account from "@src/storage/entities/Account";
import Chains, { Chain } from "@src/storage/entities/Chains";
import Network from "@src/storage/entities/Network";
import Record from "@src/storage/entities/activity/Record";
import { RecordStatus } from "@src/storage/entities/activity/types";
import Contact from "@src/storage/entities/registry/Contact";
import Register from "@src/storage/entities/registry/Register";
import { SwapData } from "@src/storage/entities/registry/Swap";
import Setting from "@src/storage/entities/settings/Setting";
import {
  SettingKey,
  SettingType,
  SettingValue,
} from "@src/storage/entities/settings/types";

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
  type: AccountType.IMPORTED_EVM | AccountType.IMPORTED_WASM;
  isSignUp: boolean | undefined;
}

export interface RequestRestorePassword {
  privateKeyOrSeed: string;
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

export interface RequestGetAccount {
  key: AccountKey;
}

export interface RequestGetAllAccounts {
  type: AccountType[] | null;
}

export interface RequestDeriveAccount {
  name: string;
  type: AccountType;
}

export interface RequestSetNetwork {
  chain: Chain;
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

export interface RequestAddActivity {
  txHash: string;
  record: Record;
}

export interface RequestUpdateActivity {
  txHash: string;
  status: RecordStatus;
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

export interface RequestSwapProtocol {
  protocol: string;
}

export interface RequestAddSwap {
  protocol: string;
  swap: SwapData;
}

interface RequestSendTxBase {
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
}

export interface RequestSendSubstrateTx extends RequestSendTxBase {
  hexExtrinsic: string;
}

export interface RequestSendEvmTx extends RequestSendTxBase {
  txHash: string;
  fee: {
    gasLimit: string;
    maxFeePerGas: string;
    maxPriorityFeePerGas: string;
    type?: number;
  };
}

export interface Request {
  "pri(accounts.createAccounts)": [RequestCreateAccount, boolean];
  "pri(accounts.importAccount)": [RequestImportAccount, void];
  "pri(accounts.restorePassword)": [RequestRestorePassword, void];
  "pri(accounts.removeAccount)": [RequestRemoveAccout, void];
  "pri(accounts.changeAccountName)": [RequestChangeAccountName, void];
  "pri(accounts.areAccountsInitialized)": [null, boolean];
  "pri(accounts.getAccount)": [RequestGetAccount, Account | undefined];
  "pri(accounts.getAllAccounts)": [RequestGetAllAccounts, Account[]];
  "pri(accounts.deriveAccount)": [RequestDeriveAccount, Account];
  "pri(accounts.setSelectedAccount)": [Account, void];

  "pri(accounts.getSelectedAccount)": [null, Account | undefined];

  "pri(auth.isAuthorized)": [null, boolean];
  "pri(auth.resetWallet)": [null, void];
  "pri(auth.signIn)": [RequestSignIn, void];
  "pri(auth.signOut)": [null, void];
  "pri(auth.alreadySignedUp)": [null, boolean];
  "pri(auth.isSessionActive)": [null, boolean];
  "pri(auth.showKey)": [null, string | undefined];

  "pri(network.setNetwork)": [RequestSetNetwork, boolean];
  "pri(network.getNetwork)": [null, Network];
  "pri(network.getAllChains)": [null, Chains];
  "pri(network.saveCustomChain)": [RequestSaveCustomChain, void];
  "pri(network.removeCustomChain)": [RequestRemoveCustomChain, void];
  "pri(network.getXCMChains)": [RequestGetXCMChains, Chain[]];

  "pri(settings.getGeneralSettings)": [null, Setting[]];
  "pri(settings.getAdvancedSettings)": [null, Setting[]];
  "pri(settings.getSetting)": [RequestGetSetting, Setting | undefined];
  "pri(settings.updateSetting)": [RequestUpdateSetting, void];

  "pri(contacts.getContacts)": [null, Contact[]];
  "pri(contacts.getRegistryAddresses)": [
    null,
    {
      ownAccounts: Contact[];
      contacts: Contact[];
      recent: Register[];
    }
  ];
  "pri(contacts.saveContact)": [RequestSaveContact, void];
  "pri(contacts.removeContact)": [RequestRemoveContact, void];

  "pri(activity.getActivity)": [null, Record[]];
  "pri(activity.addActivity)": [RequestAddActivity, void];
  "pri(activity.updateActivity)": [RequestUpdateActivity, void];

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

  "pri(swap.getSwapsByProtocol)": [RequestSwapProtocol, SwapData[]];
  "pri(swap.addSwap)": [RequestAddSwap, void];

  "pri(send.sendSubstrateTx)": [RequestSendSubstrateTx, boolean];
  "pri(send.sendEvmTx)": [RequestSendEvmTx, boolean];
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

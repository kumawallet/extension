import Keyring from "../storage/entities/Keyring";
import Vault from "../storage/entities/Vault";
import { ethers } from "ethers";
import { ACCOUNT_PATH } from "../utils/constants";
import PolkadotKeyring from "@polkadot/ui-keyring";
import Auth from "../storage/Auth";
import { getAccountType } from "../utils/account-utils";
import BackUp from "@src/storage/entities/BackUp";
import Account from "@src/storage/entities/Account";
import Accounts from "@src/storage/entities/Accounts";
import { AccountType, AccountKey } from "./types";

export default class AccountManager {
  private static formatAddress(address: string, type: AccountType): AccountKey {
    if (
      address.startsWith("WASM") ||
      address.startsWith("EVM") ||
      address.startsWith("IMPORTED")
    ) {
      return address as AccountKey;
    }
    return `${type}-${address}`;
  }

  private static async getImportedEVMAddress(privateKey: string) {
    const wallet = new ethers.Wallet(privateKey);
    const { address } = wallet || {};
    const seed = wallet.mnemonic?.phrase || "";
    return { address, privateKey, seed };
  }

  private static async getImportedWASMAddress(seed: string) {
    const wallet = PolkadotKeyring.addUri(seed, Auth.password);
    const { address } = wallet.json || {};
    const privateKey = wallet.pair.meta.privateKey?.toString() || "";
    return { address, seed, privateKey };
  }

  private static async addAccount(
    address: string,
    type: AccountType,
    name: string,
    keyring: Keyring
  ): Promise<Account> {
    const key = AccountManager.formatAddress(address, type);
    if (name === "") {
      const n = await Accounts.count();
      name = `Account ${n + 1}`;
    }
    console.log("save keyring", keyring);
    const value = { name, address, keyring: key };
    const account = new Account(key, value);
    await Accounts.add(account);
    await Keyring.save(keyring);
    return account;
  }

  static async addEVMAccount(
    seed: string,
    name: string,
    path?: string,
    keyring?: Keyring
  ): Promise<Account> {
    const type = AccountType.EVM;
    const { address, privateKey } =
      ethers.Wallet.fromMnemonic(seed, path || ACCOUNT_PATH) || {};
    const key = AccountManager.formatAddress(address, type);
    const _keyring = keyring || new Keyring(key, type, seed, privateKey);
    return AccountManager.addAccount(address, type, name, _keyring);
  }

  static async addWASMAccount(
    seed: string,
    name: string,
    keyring?: Keyring
  ): Promise<Account> {
    const type = AccountType.WASM;
    const wallet = PolkadotKeyring.addUri(seed, Auth.password);
    const { address } = wallet.json || {};
    const key = AccountManager.formatAddress(address, type);
    const _keyring = keyring || new Keyring(key, type, seed, "");
    return AccountManager.addAccount(address, type, name, _keyring);
  }

  static async importAccount({
    name,
    privateKeyOrSeed,
    accountType,
  }: {
    name: string;
    privateKeyOrSeed: string;
    accountType: AccountType;
  }): Promise<Account> {
    const _type = getAccountType(accountType);

    let type: AccountType.IMPORTED_EVM | AccountType.IMPORTED_WASM;
    let importedData;
    switch (_type) {
      case AccountType.EVM:
        importedData = await AccountManager.getImportedEVMAddress(
          privateKeyOrSeed
        );
        type = AccountType.IMPORTED_EVM;
        break;
      case AccountType.WASM:
        importedData = await AccountManager.getImportedWASMAddress(
          privateKeyOrSeed
        );
        type = AccountType.IMPORTED_WASM;
        break;
      default:
        throw new Error("account_type_not_supported");
    }
    const { address, privateKey, seed } = importedData;
    const key = AccountManager.formatAddress(address, type);
    const keyring = new Keyring(key, type, seed, privateKey);
    return AccountManager.addAccount(address, type, name, keyring);
  }

  static async derive(
    name: string,
    vault: Vault,
    type: AccountType
  ): Promise<Account> {
    const _type = getAccountType(type);
    const keyring = await vault.getKeyringsByType(_type as AccountType);
    if (!keyring) throw new Error("failed_to_derive_from_empty_keyring");
    keyring.increaseAccountQuantity();
    let path;
    switch (_type) {
      case AccountType.EVM:
        path = keyring.path.slice(0, -1) + keyring.accountQuantity;
        return AccountManager.addEVMAccount(keyring.seed, name, path, keyring);
      case AccountType.WASM:
        path = `${keyring.path}/${keyring.accountQuantity}`;
        return AccountManager.addWASMAccount(path, name, keyring);
      default:
        throw new Error("account_type_not_supported");
    }
  }

  static async getAccount(key: AccountKey): Promise<Account | undefined> {
    if (!key) throw new Error("account_key_required");
    return Accounts.getAccount(key);
  }

  static async changeName(key: AccountKey, newName: string): Promise<Account> {
    const account = await AccountManager.getAccount(key);
    if (!account) throw new Error("account_not_found");
    account.value.name = newName;
    return Accounts.update(account);
  }

  static async remove(key: AccountKey): Promise<void> {
    await Accounts.removeAccount(key);
  }

  static async getAll(
    type: AccountType[] | null = null
  ): Promise<Accounts | undefined> {
    const accounts = await Accounts.get<Accounts>();
    if (!accounts) return undefined;

    if (type && type.length > 0) {
      const filteredAccounts: any = {};
      Object.keys(accounts.data).forEach((key: string) => {
        const account = accounts.get(key as AccountKey);
        if (!account) return;
        const accountType = getAccountType(account.type);
        if (type.includes(accountType as AccountType)) {
          filteredAccounts[key] = account;
        }
      });
      // TODO: how to improve this?
      accounts.data = filteredAccounts;
    }
    return accounts;
  }

  static async areAccountsInitialized(accounts: Accounts): Promise<boolean> {
    const accountsList = await accounts.getAll();
    return (
      accountsList.filter(
        (account) =>
          account.type === AccountType.EVM || account.type === AccountType.WASM
      ).length > 0
    );
  }

  static async saveBackup(recoveryPhrase: string): Promise<void> {
    if (!recoveryPhrase) throw new Error("recovery_phrase_required");
    const encrypted = await Auth.getInstance().encryptBackup(recoveryPhrase);
    const backup = new BackUp(encrypted);
    await BackUp.set(backup);
  }

  static async restorePassword(
    privateKeyOrSeed: string,
    password: string
  ): Promise<void> {
    const backup = await BackUp.get<BackUp>();
    if (!backup || !backup.data) throw new Error("backup_not_found");
    const decryptedBackup = await Auth.decryptBackup(
      backup.data,
      privateKeyOrSeed
    );
    if (!decryptedBackup) throw new Error("invalid_recovery_phrase");
    Auth.password = decryptedBackup as string;
    Auth.isUnlocked = true;
    const vault = await Vault.get<Vault>();
    if (!vault) throw new Error("failed_to_restore_password");
    Auth.password = password;
    Auth.isUnlocked = true;
    await Vault.set(vault);
    await AccountManager.saveBackup(privateKeyOrSeed);
  }
}

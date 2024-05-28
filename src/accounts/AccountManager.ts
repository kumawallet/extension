import Auth from "../storage/Auth";
import Vault from "../storage/entities/Vault";
import BackUp from "../storage/entities/BackUp";
import Account from "../storage/entities/Account";
import Accounts from "../storage/entities/Accounts";
import HDKeyring from "../storage/entities/keyrings/hd/HDKeyring";
import { SupportedKeyring } from "../storage/entities/keyrings/types";
import { AccountType, AccountKey, AccountValue, KeyringType } from "./types";
import { getAccountType } from "../utils/account-utils";
import ImportedEVMKeyring from "@src/storage/entities/keyrings/imported/ImportedEVMKeyring";
import ImportedWASMKeyring from "@src/storage/entities/keyrings/imported/ImportedWASMKeyring";
import ImporedOLKeying from "@src/storage/entities/keyrings/imported/ImportedOLKeyring";

export default class AccountManager {
  private static formatAddress(address: string, type: AccountType): AccountKey {
    if (
      address.startsWith("WASM") ||
      address.startsWith("EVM") ||
      address.startsWith("OL") ||
      address.startsWith("IMPORTED")
    ) {
      return address as AccountKey;
    }
    return `${type}-${address}`;
  }

  static async getValidName(name: string) {
    if (name === "") {
      const n = await Accounts.count();
      name = `Account ${n + 1}`;
    }
    return name;
  }

  static async createAccount({
    address,
    keyring,
    name,
    type,
    path,
    parentAddress,
    isDerivable,
  }: {
    name: string;
    address: string;
    type: AccountType;
    isDerivable?: boolean;
    parentAddress?: string;
    path?: number;
    keyring: SupportedKeyring;
  }): Promise<Account> {
    const key = AccountManager.formatAddress(address, type);
    const _name = await AccountManager.getValidName(name);
    const value = {
      name: _name,
      address,
      keyring: keyring.type,
      isDerivable,
    } as AccountValue;

    if (parentAddress) {
      value!.parentAddress = parentAddress;
      value!.path = path;
    }

    const account = new Account(key, value);
    await Accounts.save(account);
    if (!parentAddress) {
      await Vault.saveKeyring(keyring);
    }
    return account;
  }

  static async addAccount(
    type: KeyringType,
    seed: string,
    name: string,
    keyring?: HDKeyring
  ): Promise<Account> {
    const _keyring =
      keyring || ((await Vault.getKeyring(type, seed)) as HDKeyring);

    const address = await _keyring.deriveKeyPair(seed);
    return AccountManager.createAccount({
      name,
      address,
      type,
      keyring: _keyring as SupportedKeyring,
      isDerivable: true,
    });
  }

  static async importAccount(
    name: string,
    privateKeyOrSeed: string,
    type:
      | AccountType.IMPORTED_EVM
      | AccountType.IMPORTED_WASM
      | AccountType.IMPORTED_OL
  ): Promise<Account> {
    const keyring = (await Vault.getKeyring(type)) as
      | ImportedEVMKeyring
      | ImportedWASMKeyring
      | ImporedOLKeying;
    const { address, keyPair, isDerivable } = await keyring.getImportedData(
      privateKeyOrSeed
    );

    keyring.addKeyPair(address, keyPair);

    return AccountManager.createAccount({
      name,
      address,
      type,
      keyring,
      isDerivable,
    });
  }

  static async incrementPath(parentAddress: string, type: AccountType) {
    let path = type.toLowerCase().includes("wasm") ? 0 : 1;

    const allAccounts = (await AccountManager.getAll())?.getAll() || [];
    const derivedAccounts = allAccounts.filter(
      (account) => account.value?.parentAddress === parentAddress
    );

    let found = false;

    if (derivedAccounts.length > 0) {
      do {
        const account = derivedAccounts.find(
          (account) => account.value?.path === path
        );
        if (!account) {
          found = true;
        } else {
          path++;
        }
      } while (!found);
    }

    return {
      path,
    };
  }

  static async derive(
    name: string,
    type: KeyringType,
    address: string
  ): Promise<Account> {
    const keyring = (await Vault.getKeyring(type)) as HDKeyring;
    if (!keyring || !keyring.keyPairs[address])
      throw new Error("failed_to_derive_from_empty_keyring");

    const seed = keyring.keyPairs[address].key;
    const { path } = await this.incrementPath(address, type);

    const _address = await keyring.getAddress(seed, path);

    return AccountManager.createAccount({
      name,
      address: _address,
      type,
      keyring,
      parentAddress: address,
      path,
    });
  }

  static async getAccount(key: AccountKey): Promise<Account | undefined> {
    if (!key) throw new Error("account_key_required");
    return Accounts.getAccount(key);
  }

  static async changeName(key: AccountKey, newName: string): Promise<Account> {
    const account = await AccountManager.getAccount(key);
    if (!account) throw new Error("account_not_found");
    account.value!.name = newName;
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
      const filteredAccounts: { [key: string]: Account } = {};
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

  static async saveBackup(privateKeyOrSeed: string): Promise<void> {
    if (!privateKeyOrSeed) throw new Error("recovery_phrase_required");
    const encrypted = await Auth.getInstance().encryptBackup(privateKeyOrSeed);
    const backup = new BackUp(encrypted);
    await BackUp.set(backup);
  }

  static async changePassword(
    password: string,
    newPassword: string
  ): Promise<void> {
    await Auth.restorePassword(password, newPassword);
  }
}

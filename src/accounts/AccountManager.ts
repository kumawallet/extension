import Auth from "../storage/Auth";
import Vault from "../storage/entities/Vault";
import BackUp from "../storage/entities/BackUp";
import Account from "../storage/entities/Account";
import Accounts from "../storage/entities/Accounts";
import HDKeyring from "../storage/entities/keyrings/hd/HDKeyring";
import { SupportedKeyring } from "../storage/entities/keyrings/types";
import { AccountType, AccountKey } from "./types";
import { getAccountType } from "../utils/account-utils";
import ImportedEVMKeyring from "@src/storage/entities/keyrings/imported/ImportedEVMKeyring";
import ImportedWASMKeyring from "@src/storage/entities/keyrings/imported/ImportedWASMKeyring";

export default class AccountManager {
  private static formatAddress(address: string, type: AccountType): AccountKey {
    if (
      address.startsWith("WASM") ||
      address.startsWith("EVM") ||
      address.startsWith("MOVE") ||
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

  static async createAccount(
    name: string,
    address: string,
    type: AccountType,
    keyring: SupportedKeyring
  ): Promise<Account> {
    const key = AccountManager.formatAddress(address, type);
    const _name = await AccountManager.getValidName(name);
    const value = { name: _name, address, keyring: keyring.type };
    const account = new Account(key, value);
    await Accounts.save(account);
    await Vault.saveKeyring(keyring);
    return account;
  }

  static async addAccount(
    type: AccountType,
    seed: string,
    name: string,
    keyring?: HDKeyring
  ): Promise<Account> {
    console.log("AccountManager.addAccount", type, seed, name, keyring);

    const _keyring =
      keyring || ((await Vault.getKeyring(type, seed)) as HDKeyring);

    console.log("keyring", keyring);
    const address = _keyring.deriveKeyPair(seed);
    console.log("created address:", address);
    return AccountManager.createAccount(name, address, type, _keyring);
  }

  static async importAccount(
    name: string,
    privateKeyOrSeed: string,
    type: AccountType.IMPORTED_EVM | AccountType.IMPORTED_WASM
  ): Promise<Account> {
    const keyring = (await Vault.getKeyring(type)) as
      | ImportedEVMKeyring
      | ImportedWASMKeyring;
    const { address, keyPair } = await keyring.getImportedData(
      privateKeyOrSeed
    );
    keyring.addKeyPair(address, keyPair);
    return AccountManager.createAccount(name, address, type, keyring);
  }

  static incrementPath = (path: string | undefined, type: AccountType) => {
    if (type === AccountType.EVM) {
      let _path = "1";

      if (path) {
        const pathArray = path.split("/");
        const lastPath = pathArray.pop() as string;
        _path = (parseInt(lastPath) + 1).toString();
      }

      return `m/44'/60'/0'/0/${_path}`;
    }

    if (type === AccountType.WASM) {
      let _path = "1";

      if (path) {
        const pathArray = path.split("/");
        const lastPath = pathArray.pop() as string;
        _path = (parseInt(lastPath) + 1).toString();
      }

      return `/${_path}`;
    }
  };

  static async derive(
    name: string,
    type: AccountType,
    address: string
  ): Promise<Account> {
    const keyring = (await Vault.getKeyring(type)) as HDKeyring;
    if (!keyring || !keyring.keyPairs[address])
      throw new Error("failed_to_derive_from_empty_keyring");

    const seed = keyring.keyPairs[address].key;
    const path = this.incrementPath(keyring.keyPairs[address].path, type);

    console.log("derive from:", address);
    console.log("derived path", {
      seed,
      path,
    });

    const _address = keyring.getAddress(seed, path as string);
    console.log("derived address", _address);
    return AccountManager.createAccount(name, _address, type, keyring);

    // return AccountManager.addAccount(type, seed + path, name, keyring);
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
    privateKeyOrSeed: string,
    password: string,
    newPassword: string
  ): Promise<void> {
    const backup = await BackUp.get<BackUp>();
    if (!backup || !backup.data) throw new Error("backup_not_found");
    await Auth.restorePassword(
      backup.data,
      password,
      newPassword,
      privateKeyOrSeed
    );
    await AccountManager.saveBackup(privateKeyOrSeed);
  }
}

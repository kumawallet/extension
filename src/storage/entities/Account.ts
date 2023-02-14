import { AccountType } from "@src/accounts/AccountManager";
import { AccountKey, AccountValue, Accounts } from "./Accounts";

export default class Account {
  key: AccountKey;
  value: AccountValue;
  type: AccountType;

  constructor(key: AccountKey, value: AccountValue) {
    this.key = key;
    this.value = value;
    this.type = this.getType(key);
  }

  private getType(key: AccountKey) {
    const split = key.split("-");
    return split[0] as AccountType;
  }

  static async get(key: AccountKey): Promise<Account | undefined> {
    const accounts = await Accounts.get();
    if (!accounts) throw new Error("Accounts are not initialized");
    return accounts.get(key);
  }

  static async add(account: Account): Promise<void> {
    const accounts = await Accounts.get();
    if (!accounts) throw new Error("Accounts are not initialized");
    if (accounts.allreadyExists(account.key)) {
      throw new Error("Account already exists");
    }
    accounts.add(account);
    await Accounts.set(accounts);
  }

  static async update(account: Account): Promise<Account> {
    const accounts = await Accounts.get();
    if (!accounts) throw new Error("Accounts are not initialized");
    accounts.update(account.key, account.value);
    await Accounts.set(accounts);
    return account;
  }

  static async remove(key: AccountKey) {
    const accounts = await Accounts.get();
    if (!accounts) throw new Error("Accounts are not initialized");
    accounts.remove(key);
    await Accounts.set(accounts);
  }
}

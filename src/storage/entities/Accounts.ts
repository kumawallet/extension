import { ACCOUNTS } from "../../utils/constants";
import { AccountType } from "../../accounts/AccountManager";
import Storable from "../Storable";
import Storage from "../Storage";

export type AccountKey = `${AccountType}-${string}`;

export type AccountValue = {
  name: string;
  address: string;
  keyring: AccountKey;
};

export class Account {
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

export class Accounts extends Storable {
  data: { [key: AccountKey]: Account };

  constructor() {
    super(ACCOUNTS);
    this.data = {};
  }

  static async get(): Promise<Accounts | undefined> {
    const stored = await Storage.getInstance().get(ACCOUNTS);
    if (!stored || !stored.data) return undefined;
    const accounts = new Accounts();
    accounts.set(stored.data);
    return accounts;
  }

  static async set(accounts: Accounts) {
    await Storage.getInstance().set(ACCOUNTS, accounts);
  }

  static async remove() {
    await Storage.getInstance().remove(ACCOUNTS);
  }

  isEmpty() {
    return Object.keys(this.data).length === 0;
  }

  add(account: Account) {
    this.data[account.key] = account;
  }

  remove(key: AccountKey) {
    delete this.data[key];
  }

  get(key: AccountKey) {
    if (!this.data[key]) return undefined;
    return new Account(key, this.data[key].value);
  }

  getAll() {
    return Object.keys(this.data).map((key) => this.data[key as AccountKey]);
  }

  set(accounts: { [key: AccountKey]: Account }) {
    this.data = accounts;
  }

  update(key: AccountKey, value: AccountValue) {
    this.data[key].value = value;
  }

  allreadyExists(key: AccountKey) {
    return this.data[key] !== undefined;
  }

  first() {
    const keys = Object.keys(this.data);
    if (keys.length === 0) return undefined;
    return this.get(keys[0] as AccountKey);
  }
}

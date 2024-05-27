import { AccountKey, AccountTypes, AccountValue } from "@src/accounts/types";
import BaseEntity from "./BaseEntity";
import Account from "./Account";

export default class Accounts extends BaseEntity {
  data: { [key: AccountTypes]: Account };

  constructor() {
    super();
    this.data = {};
  }

  static getName() {
    return "Accounts";
  }

  static async init() {
    await Accounts.set<Accounts>(new Accounts());
  }

  static async update(account: Account): Promise<Account> {
    const accounts = await Accounts.get<Accounts>();
    if (!accounts) throw new Error("failed_to_update_account");
    accounts.update(account.key, account.value);
    await Accounts.set<Accounts>(accounts);
    return account;
  }

  static async updateAll(accounts: Accounts) {
    await Accounts.set<Accounts>(accounts);
  }

  static async removeAccount(key: AccountKey) {
    const accounts = await Accounts.get<Accounts>();
    if (!accounts) throw new Error("failed_to_remove_account");
    accounts.remove(key);
    await Accounts.set<Accounts>(accounts);
  }

  static async save(account: Account): Promise<void> {
    const accounts = await Accounts.get<Accounts>();
    if (!accounts) throw new Error("failed_to_add_account");
    if (accounts.alreadyExists(account.key)) {
      throw new Error("account_already_exists");
    }
    accounts.add(account);
    await Accounts.set<Accounts>(accounts);
  }

  static async getAccount(key: AccountKey): Promise<Account | undefined> {
    const accounts = await Accounts.get<Accounts>();
    if (!accounts) throw new Error("failed_to_get_account");
    return accounts.get(key);
  }

  static async count(): Promise<number> {
    const accounts = await Accounts.get<Accounts>();
    if (!accounts) return 0;
    return accounts.getAll().length;
  }

  isEmpty() {
    return Object.keys(this.data).length === 0;
  }

  add(account: Account) {
    this.data[account.key as AccountTypes] = account;
  }

  remove(key: AccountKey) {
    delete this.data[key as AccountTypes];
  }

  get(key: AccountKey) {
    if (!this.data[key as AccountTypes]) return undefined;
    return new Account(key, this.data[key as AccountTypes].value);
  }

  getAll() {
    return Object.keys(this.data).map((key) => this.data[key as AccountTypes]);
  }

  update(key: AccountKey, value: AccountValue) {
    this.data[key as AccountTypes].value = value;
  }

  alreadyExists(key: AccountKey) {
    return this.data[key as AccountTypes] !== undefined;
  }

  first() {
    const keys = Object.keys(this.data);
    if (keys.length === 0) return undefined;
    return this.get(keys[0] as AccountKey);
  }
}

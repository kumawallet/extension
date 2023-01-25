import Account, { AccountKey } from "./Account";

export default class Vault {
  accounts: { [key: AccountKey]: Account };
  settings: any;
  selectedAccount: AccountKey | undefined;

  constructor() {
    this.accounts = {};
    this.settings = {};
    this.selectedAccount = undefined;
  }

  isEmpty() {
    return Object.keys(this.accounts).length === 0;
  }
}

import Account, { AccountKey } from "./Account";
import CacheAuth from "./CacheAuth";

export default class Vault {
  accounts: { [key: AccountKey]: Account };
  settings: any;
  selectedAccount: AccountKey | undefined;
  cacheAuth: CacheAuth;

  constructor() {
    this.accounts = {};
    this.settings = {};
    this.selectedAccount = undefined;
    this.cacheAuth = CacheAuth.getInstance();
  }

  isEmpty() {
    return Object.keys(this.accounts).length === 0;
  }
}

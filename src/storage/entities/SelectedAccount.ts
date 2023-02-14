import { SELECTED_ACCOUNT } from "@src/utils/constants";
import Storable from "../Storable";
import Storage from "../Storage";
import Account from "./Account";
import { Accounts } from "./Accounts";

export class SelectedAccount extends Storable {
  constructor() {
    super(SELECTED_ACCOUNT);
  }

  static async getDefaultAccount(): Promise<Account> {
    const accounts = await Accounts.get();
    if (!accounts) throw new Error("Accounts are not initialized");
    const account = accounts.first();
    if (!account) throw new Error("No account found");
    return account;
  }

  static async get(): Promise<Account | undefined> {
    const selectedAccount = await Storage.getInstance().get(SELECTED_ACCOUNT);
    if (!selectedAccount) {
      const account = await SelectedAccount.getDefaultAccount();
      SelectedAccount.set(account);
      return account;
    }
    return Account.get(selectedAccount?.key);
  }

  static async set(account: Account) {
    await Storage.getInstance().set(SELECTED_ACCOUNT, account);
  }
}

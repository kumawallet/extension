import Accounts from "./Accounts";
import BaseEntity from "./BaseEntity";
import { AccountKey, AccountType, AccountValue } from "@src/accounts/types";
import Account from "./Account";

export default class SelectedAccount extends BaseEntity {
  key: AccountKey;
  value: AccountValue;
  type: AccountType;

  constructor() {
    super();
    this.key = "EVM-0x000000000";
    this.value = {} as AccountValue;
    this.type = AccountType.EVM;
  }

  fromAccount(account: Account) {
    this.key = account.key;
    this.value = account.value;
    this.type = this.key.split("-")[0] as AccountType;
  }

  static async getDefaultValue<SelectedAccount>(): Promise<SelectedAccount> {
    const accounts = await Accounts.get<Accounts>();
    if (!accounts) throw new Error("accounts_not_found");
    const account = accounts.first();
    if (!account) return undefined as SelectedAccount;
    const selected = new SelectedAccount();
    selected.fromAccount(account);
    await SelectedAccount.set<SelectedAccount>(selected as SelectedAccount);
    return selected as SelectedAccount;
  }
}

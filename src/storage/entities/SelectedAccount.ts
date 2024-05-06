import Accounts from "./Accounts";
import BaseEntity from "./BaseEntity";
import { AccountKey, AccountType, AccountValue } from "@src/accounts/types";
import Account from "./Account";

export default class SelectedAccount extends BaseEntity {
  private constructor(
    public key: AccountKey,
    public value: AccountValue,
    public type: AccountType
  ) {
    super();
  }

  static getName() {
    return "SelectedAccount";
  }

  public static fromAccount(account: Account | null): SelectedAccount {
    if (!account) return new SelectedAccount("ALL", null, AccountType.ALL);

    const { key, value } = account;
    const type = key.split("-")[0] as AccountType;
    return new SelectedAccount(key, value, type);
  }

  static async getDefaultValue<SelectedAccount>(): Promise<SelectedAccount> {
    const accounts = await Accounts.get<Accounts>();
    if (!accounts) throw new Error("accounts_not_found");
    const account = accounts.first();
    if (!account) return undefined as SelectedAccount;
    const selected = await SelectedAccount.fromAccount(account);
    await SelectedAccount.set<SelectedAccount>(selected as SelectedAccount);
    return selected as SelectedAccount;
  }
}

import { AccountKey, AccountValue, AccountType } from "@src/accounts/types";

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
}

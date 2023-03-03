import { AccountKey, AccountValue, AccountType } from "@src/accounts/types";

export default class Account {
  key: AccountKey;
  value: AccountValue;
  type: AccountType;

  constructor(key: AccountKey, value: AccountValue) {
    this.key = key;
    this.value = value;
    this.type = key.split("-")[0] as AccountType;
  }
}
import { AccountType } from "@src/utils/handlers/AccountManager";

export interface DerivateAccountForm {
  accountType: AccountType;
  name: string;
}

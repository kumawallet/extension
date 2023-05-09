import { AccountType } from "@src/accounts/types";
import { AccountFormType } from "@src/pages";
import Account from "@src/storage/entities/Account";

interface InitialState {
  accounts: Account[];
  isLoadingAccounts: boolean;
  selectedAccount: Account;
}

interface AccountContext {
  state: InitialState;
  getAllAccounts: (type?: AccountType[] | null) => Promise<Account[]>;
  getSelectedAccount: () => Promise<Account | undefined | null>;
  setSelectedAccount: (account: Account, changeRpc?: boolean) => void;
  deriveAccount: (account: AccountFormType) => Promise<boolean>;
  importAccount: (account: AccountFormType) => Promise<boolean>;
  createAccount: (account: AccountFormType) => Promise<boolean>;
}

type Action =
  | {
      type: "set-accounts";
      payload: {
        accounts: Account[];
      };
    }
  | {
      type: "set-selected-account";
      payload: {
        selectedAccount: Account;
      };
    }
  | {
      type: "change-selected-address-format";
      payload: {
        address: string;
      };
    };

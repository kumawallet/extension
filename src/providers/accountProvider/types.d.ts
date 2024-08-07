import { AccountType } from "@src/accounts/types";
import { AccountFormType } from "@src/pages";
import Account from "@src/storage/entities/Account";

interface InitialState {
  accounts: Account[];
  isLoadingAccounts: boolean;
  selectedAccount: Account | null;
}

interface AccountContext {
  state: InitialState;
  getAllAccounts: (type?: AccountType[] | null) => Promise<Account[]>;
  getSelectedAccount: () => Promise<Account | undefined | null>;
  setSelectedAccount: (account: Account | null, changeRpc?: boolean) => void;
  deriveAccount: (account: {
    name: string;
    accountType: AccountType;
    address: string;
  }) => Promise<boolean>;
  importAccount: (account: AccountFormType) => Promise<boolean>;
  createAccount: (account: AccountFormType) => Promise<boolean>;
  updateAccountName: (accountKey: AccountKey, name: string) => Promise<void>;
  deleteAccount: (
    accountKey: AccountKey
  ) => Promise<"successful" | null | undefined>;
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
        selectedAccount: Account | null;
      };
    }
  | {
      type: "change-selected-address-format";
      payload: {
        address: string;
      };
    }
  | {
      type: "update-account-name";
      payload: {
        name: string;
        accountKey?: string;
      };
    }
  | {
      type: "delete-account";
      payload: {
        key: string;
      };
    };

export interface InitialState {
  isInit: boolean;
}

export interface AuthContext {
  state: InitialState;
  createAccount: (account: AccountFormType) => Promise<boolean>;
  importAccount: (account: AccountFormType) => Promise<boolean>;
  deriveAccount: (account: AccountFormType) => Promise<boolean>;
  restorePassword: (account: AccountFormType) => Promise<boolean>;
}

export type Action = {
  type: any;
  payload: any;
};

import { AccountType } from "@src/accounts/types";
import Account from "@src/storage/entities/Account";

export const POLKADOT_ACCOUNT_MOCK: Account = {
  key: "WASM-5GRjqTdQiyzoT7cmztRWPhLHdfdj1aLLM3bzqVQYL2EGXgNP",
  value: {
    address: "5GRjqTdQiyzoT7cmztRWPhLHdfdj1aLLM3bzqVQYL2EGXgNP",
    keyring: AccountType.WASM,
    name: "Polkadot Account",
    isDerivable: true,
  },
  type: AccountType.WASM,
};

export const EVM_ACCOUNT_MOCK: Account = {
  key: "EVM-0xa6C654b833829659A8D978C4380C351d7E005904",
  value: {
    address: "0xa6C654b833829659A8D978C4380C351d7E005904",
    keyring: AccountType.EVM,
    name: "EVM Account",
    isDerivable: true,
  },
  type: AccountType.EVM,
};

export const OL_ACCOUNT_MOCK: Account = {
  key: "OL-FDC2EF2FB05959371332B5C136CC0ED0C674F9837051D02CA1A359ED59953160",
  value: {
    address: "FDC2EF2FB05959371332B5C136CC0ED0C674F9837051D02CA1A359ED59953160",
    keyring: AccountType.OL,
    name: "OL Account",
    isDerivable: true,
  },
  type: AccountType.OL,
};

export const ACCOUNTS_MOCKS = [POLKADOT_ACCOUNT_MOCK, EVM_ACCOUNT_MOCK];

export const POLKADOT_SEED_MOCK =
  "legal define neither cave company gospel ensure start match damp toast impact";
export const EVM_SEED_MOCK =
  "legal define neither cave company gospel ensure start match damp toast impact";
export const EVM_PRIVATE_KEY_MOCK =
  "0x59d2965dfbc51e7b1defedd860b15f4b309a04619bdc0158b89df7bef28c7d23";
export const OL_SEED_MOCK =
  "impose round lonely vast net able deer slice explain field service term ginger inside sheriff couch soul pelican alert luggage holiday nature hand nation";
export const OL_PRIVATE_KEY_MOCK =
  "becf9b2ff05ca7376a41b901c8376a5c9e1aa92043830b2ca680072bca3be01e";

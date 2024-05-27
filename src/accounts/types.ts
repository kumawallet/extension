export enum AccountType {
  EVM = "EVM",
  WASM = "WASM",
  OL = "OL",
  IMPORTED_EVM = "IMPORTED_EVM",
  IMPORTED_WASM = "IMPORTED_WASM",
  IMPORTED_OL = "IMPORTED_OL",
  ALL = "ALL",
}

export type AccountTypes = `${AccountType}-${string}`;

export type AccountKey = `${AccountType}-${string}` | "ALL";

export type AccountValue = {
  name: string;
  address: string;
  keyring: AccountType;
  isDerivable?: boolean;
  parentAddress?: string;
  path?: number;
} | null;

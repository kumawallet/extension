export enum AccountType {
  EVM = "EVM",
  WASM = "WASM",
  IMPORTED_EVM = "IMPORTED_EVM",
  IMPORTED_WASM = "IMPORTED_WASM",
}
export type AccountKey = `${AccountType}-${string}`;
export type AccountValue = {
  name: string;
  address: string;
  keyring: AccountType;
};

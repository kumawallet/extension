export enum AccountType {
  EVM = "EVM",
  WASM = "WASM",
  // MOVE = "MOVE",
  IMPORTED_EVM = "IMPORTED_EVM",
  IMPORTED_WASM = "IMPORTED_WASM",
  // IMPORTED_MOVE = "IMPORTED_MOVE",
}
export type AccountKey = `${AccountType}-${string}`;
export type AccountValue = {
  name: string;
  address: string;
  keyring: AccountType;
  parentAddress?: string;
  path?: number;
};

import { AccountType } from "../../../accounts/types";
import EVMKeyring from "./hd/EVMKeyring";
import WASMKeyring from "./hd/WASMKeyring";
import ImportedEVMKeyring from "./imported/ImportedEVMKeyring";
import ImportedWASMKeyring from "./imported/ImportedWASMKeyring";

export type SupportedKeyring =
  | EVMKeyring
  | WASMKeyring
  | ImportedEVMKeyring
  | ImportedWASMKeyring;

export type Keyrings = {
  [key in AccountType]: SupportedKeyring | undefined;
};

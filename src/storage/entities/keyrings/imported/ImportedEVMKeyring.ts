import { AccountType } from "../../../../accounts/types";
import ImportedKeyring from "./ImportedKeyring";
import KeyPair from "./KeyPair";
import { ethers } from "ethers";

export default class ImportedEVMKeyring extends ImportedKeyring {
  type = AccountType.IMPORTED_EVM;

  async getImportedData(privateKey: string) {
    const wallet = new ethers.Wallet(privateKey);
    const { address, publicKey } = wallet || {};
    const keyPair = new KeyPair(privateKey, publicKey);
    return { address, keyPair };
  }
}

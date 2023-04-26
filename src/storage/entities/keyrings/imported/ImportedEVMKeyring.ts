import { AccountType } from "../../../../accounts/types";
import { SupportedKeyring } from "../types";
import ImportedKeyring from "./ImportedKeyring";
import { ethers } from "ethers";

export default class ImportedEVMKeyring extends ImportedKeyring {
  type = AccountType.IMPORTED_EVM;

  async getImportedData(privateKey: string) {
    const wallet = new ethers.Wallet(privateKey);
    const { address } = wallet || {};
    const keyPair = { key: privateKey };
    return { address, keyPair };
  }

  static fromJSON(json: SupportedKeyring): ImportedEVMKeyring {
    const { keyPairs } = json as ImportedKeyring;
    const keyring = new ImportedEVMKeyring();
    Object.keys(keyPairs).forEach((address) => {
      const { key } = keyPairs[address];
      keyring.addKeyPair(address, { key });
    });
    return keyring;
  }
}

import { AccountType } from "@src/accounts/types";
import { SupportedKeyring } from "../types";
import ImportedKeyring from "./ImportedKeyring";
import { ethers } from "ethers";
import { isValidMnemonic } from "ethers/lib/utils";

export default class ImportedEVMKeyring extends ImportedKeyring {
  type = AccountType.IMPORTED_EVM;

  getAddress(seed: string, path?: number): string {
    return ethers.Wallet.fromMnemonic(seed, `m/44'/60'/0'/0/${path || 0}`)
      ?.address;
  }

  async getImportedData(pkOrSeed: string) {
    const isMnemonic = isValidMnemonic(pkOrSeed);

    let address = "";
    const key = pkOrSeed;

    if (isMnemonic) {
      address = ethers.Wallet.fromMnemonic(
        pkOrSeed,
        `m/44'/60'/0'/0/0`
      )?.address;
    } else {
      const wallet = new ethers.Wallet(pkOrSeed);

      address = wallet.address;
    }
    return {
      address,
      keyPair: {
        key,
      },
      isDerivable: isMnemonic,
    };
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

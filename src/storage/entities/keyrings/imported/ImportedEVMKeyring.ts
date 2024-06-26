import { AccountType } from "@src/accounts/types";
import { SupportedKeyring } from "../types";
import ImportedKeyring from "./ImportedKeyring";
import { Wallet, HDNodeWallet } from "ethers";
import { mnemonicValidate } from "@polkadot/util-crypto";

export default class ImportedEVMKeyring extends ImportedKeyring {
  type = AccountType.IMPORTED_EVM;

  getAddress(seed: string, path?: number): string {
    const wallet = HDNodeWallet.fromPhrase(
      seed,
      undefined,
      `m/44'/60'/0'/0/${path || 0}`
    );
    return wallet.address;
  }

  getDerivedPath(seed: string, path: number): string {
    const wallet = HDNodeWallet.fromPhrase(
      seed,
      undefined,
      `m/44'/60'/0'/0/${path || 0}`
    );
    return wallet.privateKey;
  }

  async getImportedData(pkOrSeed: string) {
    const isMnemonic = mnemonicValidate(pkOrSeed);

    let address = "";
    const key = pkOrSeed;

    if (isMnemonic) {
      address = Wallet.fromPhrase(pkOrSeed).address;
    } else {
      const wallet = new Wallet(pkOrSeed);
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

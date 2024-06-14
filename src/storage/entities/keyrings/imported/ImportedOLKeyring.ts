import { isValidMnemonic } from "ethers/lib/utils";
import { AccountType } from "../../../../accounts/types";
import { SupportedKeyring } from "../types";
import ImportedKeyring from "./ImportedKeyring";
import { Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";
import { createOLAccountFromMnemonic } from "@src/services/ol/ol-utils";

export default class ImportedOLKeyring extends ImportedKeyring {
  type = AccountType.IMPORTED_OL;

  async getAddress(seed: string, path?: number): Promise<string> {
    return createOLAccountFromMnemonic(seed, path);
  }

  async getImportedData(pkOrSeed: string) {
    const isMnemonic = isValidMnemonic(pkOrSeed);

    let address = "";
    const key = pkOrSeed;

    if (isMnemonic) {
      address = await createOLAccountFromMnemonic(pkOrSeed);
    } else {
      const pk = new Ed25519PrivateKey(pkOrSeed);

      const account = Account.fromPrivateKey({
        privateKey: pk,
      });

      address = account.accountAddress.bcsToHex().toStringWithoutPrefix();
    }

    return {
      address,
      keyPair: { key },
      isDerivable: isMnemonic,
    };
  }

  getDerivedPath(seed: string, path: number): string {
    return `${seed}/${path}`;
  }

  static fromJSON(json: SupportedKeyring): ImportedOLKeyring {
    const { keyPairs } = json as ImportedKeyring;
    const keyring = new ImportedOLKeyring();
    Object.keys(keyPairs).forEach((address) => {
      const { key } = keyPairs[address];
      keyring.addKeyPair(address, { key });
    });
    return keyring;
  }
}

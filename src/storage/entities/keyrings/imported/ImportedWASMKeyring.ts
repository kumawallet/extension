import { AccountType } from "@src/accounts/types";
import PolkadotKeyring from "@polkadot/ui-keyring";
import ImportedKeyring from "./ImportedKeyring";
import { SupportedKeyring } from "../types";

export default class ImportedWASMKeyring extends ImportedKeyring {
  type = AccountType.IMPORTED_WASM;

  async getImportedData(seed: string) {
    const { address } = PolkadotKeyring.createFromUri(seed);
    const keyPair = { key: seed };
    return { address, keyPair, isDerivable: true };
  }

  getAddress(seed: string, path: number = 0): string {
    const suri = seed + (path >= 0 ? `//${path}` : "");
    const wallet = PolkadotKeyring.createFromUri(suri);
    return wallet.address;
  }

  static fromJSON(json: SupportedKeyring): ImportedWASMKeyring {
    const { keyPairs } = json as ImportedKeyring;
    const keyring = new ImportedWASMKeyring();
    Object.keys(keyPairs).forEach((address) => {
      const { key } = keyPairs[address];
      keyring.addKeyPair(address, { key });
    });
    return keyring;
  }
}

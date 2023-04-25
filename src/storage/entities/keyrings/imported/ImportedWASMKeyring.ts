import Auth from "../../../../storage/Auth";
import { AccountType } from "../../../../accounts/types";
import PolkadotKeyring from "@polkadot/ui-keyring";
import ImportedKeyring from "./ImportedKeyring";
import { SupportedKeyring } from "../types";

export default class ImportedWASMKeyring extends ImportedKeyring {
  type = AccountType.IMPORTED_WASM;

  async getImportedData(seed: string) {
    const wallet = PolkadotKeyring.addUri(seed, Auth.password);
    const { address, publicKey } = wallet.pair || {};
    const keyPair = { key: seed, publicKey: publicKey?.toString() };
    return { address, keyPair };
  }

  static fromJSON(json: SupportedKeyring): ImportedWASMKeyring {
    const { keyPairs } = json as ImportedKeyring;
    const keyring = new ImportedWASMKeyring();
    Object.keys(keyPairs).forEach((address) => {
      const { key, publicKey } = keyPairs[address];
      keyring.addKeyPair(address, { key: key, publicKey: publicKey });
    });
    return keyring;
  }
}

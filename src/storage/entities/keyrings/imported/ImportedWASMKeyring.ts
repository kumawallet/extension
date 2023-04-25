import Auth from "../../../../storage/Auth";
import { AccountType } from "../../../../accounts/types";
import PolkadotKeyring from "@polkadot/ui-keyring";
import ImportedKeyring from "./ImportedKeyring";
import KeyPair from "./KeyPair";

export default class ImportedWASMKeyring extends ImportedKeyring {
  type = AccountType.IMPORTED_WASM;

  async getImportedData(seed: string) {
    const wallet = PolkadotKeyring.addUri(seed, Auth.password);
    const { address, publicKey } = wallet.pair || {};
    const keyPair = new KeyPair(seed, publicKey.toString());
    return { address, keyPair };
  }
}

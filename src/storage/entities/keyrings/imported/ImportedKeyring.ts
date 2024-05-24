import { AccountType } from "@src/accounts/types";
import Keyring from "../Keyring";
import { KeyPair } from "../types";

export default abstract class ImportedKeyring extends Keyring {
  keyPairs: { [address: string]: KeyPair };

  constructor() {
    super();
    this.keyPairs = {};
  }

  getDerivedPath(seed: string, path: number): string {
    return `${seed}//${path}`;
  }

  getKey(address: string): string {
    const keyPair = this.keyPairs[address] as KeyPair;
    if (!keyPair) {
      throw new Error("Key pair not found");
    }
    return keyPair.key;
  }

  abstract getImportedData(
    key: string,
    type: AccountType
  ): Promise<{ address: string; keyPair: KeyPair; isDerivable: boolean }>;
}

import { AccountType } from "../../../../accounts/types";
import KeyPair from "./KeyPair";
import Keyring from "../Keyring";

export default abstract class ImportedKeyring extends Keyring {

  getPrivateKey(address: string): string {
    const keyPair = this.keyPairs[address] as KeyPair;
    if (!keyPair) {
      throw new Error("Key pair not found");
    }
    return keyPair?.getKey();
  }

  fromJSON(json: any): void {
    this.accountQuantity = json.accountQuantity;
    this.keyPairs = {};
    Object.keys(json.keyPairs).forEach((address) => {
      const keyPair = json.keyPairs[address] as KeyPair;
      this.addKeyPair(address, keyPair);
    });
  }

  abstract getImportedData(
    key: string,
    type: AccountType
  ): Promise<{ address: string; keyPair: KeyPair }>;
}

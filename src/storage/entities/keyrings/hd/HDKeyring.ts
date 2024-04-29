import { AccountType } from "@src/accounts/types";
import Keyring from "../Keyring";
import { HDKeyPair } from "../types";

export default abstract class HDKeyring extends Keyring {
  abstract type: AccountType;
  readonly mnemonic: string;
  keyPairs: { [address: string]: HDKeyPair };

  constructor(mnemonic: string) {
    super();
    // if (!this.isMnemonicValid(mnemonic)) {
    //   throw new Error("Invalid mnemonic");
    // }
    this.mnemonic = mnemonic;
    this.keyPairs = {};
  }

  abstract isMnemonicValid(mnemonic: string): boolean;

  abstract getNextAccountPath(): string;

  abstract getAddress(seed: string, path?: number): string;

  deriveKeyPair(mnemonicOrSeed: string, path?: number): string {
    const address = this.getAddress(mnemonicOrSeed, path);
    this.addKeyPair(address, { key: mnemonicOrSeed });
    return address;
  }

  toJSON() {
    return {
      mnemonic: this.mnemonic,
      keyPairs: this.keyPairs,
    };
  }
}

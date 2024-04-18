import { AccountType } from "@src/accounts/types";
import Keyring from "../Keyring";
import { HDKeyPair } from "../types";

export default abstract class HDKeyring extends Keyring {
  abstract type: AccountType;
  // readonly #mnemonic: string;
  keyPairs: { [address: string]: HDKeyPair };

  constructor(mnemonic: string) {
    super();
    // if (!this.isMnemonicValid(mnemonic)) {
    //   throw new Error("Invalid mnemonic");
    // }
    // this.#mnemonic = mnemonic;
    this.keyPairs = {};
  }

  get mnemonic() {
    return "";
    // return this.#mnemonic;
  }

  abstract isMnemonicValid(mnemonic: string): boolean;

  abstract getNextAccountPath(): string;

  abstract getAddress(seed: string, path: string): string;

  deriveKeyPair(mnemonicOrSeed: string, path?: string): string {
    console.log("1");
    const address = this.getAddress(mnemonicOrSeed, path?.split("/")[1] || "0");
    console.log("2");
    this.addKeyPair(address, { key: mnemonicOrSeed, path: path || "/0" });
    console.log("this.keyPairs:", this.keyPairs);
    return address;
  }

  toJSON() {
    return {
      // mnemonic: this.#mnemonic,
      keyPairs: this.keyPairs,
    };
  }
}

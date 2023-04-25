import { ethers } from "ethers";
import HDKeyring from "./HDKeyring";
import HDKeyPair from "./HDKeyPair";
import { AccountType } from "../../../../accounts/types";

export default class EVMKeyring extends HDKeyring {
  type = AccountType.EVM;

  getNextAccountPath(): string {
    return `m/44'/60'/0'/0/${this.accountQuantity}`;
  }

  isMnemonicValid(mnemonic: string): boolean {
    return ethers.utils.isValidMnemonic(mnemonic);
  }

  getAddress(path: string): string {
    return ethers.Wallet.fromMnemonic(this.mnemonic, path)?.address;
  }

  getPrivateKey(address: string): string {
    const keyPair = this.keyPairs[address] as HDKeyPair;
    if (!keyPair) {
      throw new Error("Key pair not found");
    }
    return ethers.Wallet.fromMnemonic(this.mnemonic, keyPair.path)?.privateKey;
  }

  fromJSON(json: any): void {
    this.accountQuantity = json.accountQuantity;
    this.keyPairs = {};
    Object.keys(json.keyPairs).forEach((address) => {
      const { path } = json.keyPairs[address];
      this.addKeyPair(address, new HDKeyPair(path));
    });
  }
}

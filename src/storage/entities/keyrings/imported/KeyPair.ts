export default class KeyPair {
  constructor(private key: string, private publicKey: string) {}

  getKey(): string {
    return this.key;
  }

  getPublicKey(): string {
    return this.publicKey;
  }
}

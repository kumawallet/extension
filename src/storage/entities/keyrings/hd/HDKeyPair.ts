
export default class HDKeyPair {
  readonly #path: string;

  constructor(path: string) {
    this.#path = path;
  }

  get path() {
    return this.#path;
  }
}
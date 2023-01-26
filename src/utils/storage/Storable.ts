export default abstract class Storable {
  key: string;

  constructor(key: string) {
    this.key = key;
  }

  getKey(): string {
    return this.key;
  }
}

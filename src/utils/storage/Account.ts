export type AccountKey = `EVM-${string}` | `WASM-${string}`;

export default class Account {
    key: AccountKey;
    value: any;

    constructor(key: AccountKey, value: any) {
        this.key = key;
        this.value = value;
    }
}

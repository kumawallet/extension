import { AccountType } from "../handlers/AccountManager";

export type AccountKey = `EVM-${string}` | `WASM-${string}`;

export type AccountValue = {
    name: string;
    address: string;
    privateKey: string;
}

export default class Account {
    key: AccountKey;
    value: AccountValue;
    type: AccountType;

    constructor(key: AccountKey, value: AccountValue) {
        this.key = key;
        this.value = value;
        this.type = key.startsWith("EVM") ? AccountType.EVM : AccountType.WASM;
    }
}

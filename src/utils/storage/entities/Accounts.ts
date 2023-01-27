import { ACCOUNTS } from "../../constants";
import { AccountType } from "../../handlers/AccountManager";
import Storable from "../Storable";

export type AccountKey = `${AccountType}-${string}`;

export type AccountValue = {
    name: string;
    address: string;
    keyring: AccountKey;
}

export class Account {
    key: AccountKey;
    value: AccountValue;
    type: AccountType;

    constructor(key: AccountKey, value: AccountValue) {
        this.key = key;
        this.value = value;
        this.type = key.startsWith("EVM") ? AccountType.EVM : AccountType.WASM;
    }
}

export class Accounts extends Storable {
    data: { [key: AccountKey]: Account};

    constructor() {
        super(ACCOUNTS);
        this.data = {};
    }

    isEmpty() {
        return Object.keys(this.data).length === 0;
    }

    add(account: Account) {
        this.data[account.key] = account;
    }

    remove(key: AccountKey) {
        delete this.data[key];
    }

    get(key: AccountKey) {
        if (!this.data[key]) return undefined;
        return new Account(key, this.data[key].value);
    }

    getAll() {
        return Object.keys(this.data).map((key) => {
            const account = this.data[key as AccountKey];
            return {
                key,
                address: account.value.address,
                name: account.value.name,
                type: account.type,
            };
        });
    }

    set(accounts: { [key: AccountKey]: Account }) {
        this.data = accounts;
    }

    update(key: AccountKey, value: AccountValue) {
        this.data[key].value = value;
    }

    allreadyExists(key: AccountKey) {
        return this.data[key] !== undefined;
    }

    first() {
        const keys = Object.keys(this.data);
        if (keys.length === 0) return undefined;
        return this.get(keys[0] as AccountKey);
    }
}
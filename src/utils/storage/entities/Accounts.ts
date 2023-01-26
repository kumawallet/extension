import { ACCOUNTS } from "../../constants";
import { AccountType } from "../../handlers/AccountManager";
import Storable from "../Storable";

export type AccountKey = `${AccountType}-${string}`;

export type AccountValue = {
    name: string;
    address: string;
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
    accounts: { [key: AccountKey]: Account};

    constructor() {
        super(ACCOUNTS);
        this.accounts = {};
    }

    isEmpty() {
        return Object.keys(this.accounts).length === 0;
    }

    add(account: Account) {
        this.accounts[account.key] = account;
    }

    remove(key: AccountKey) {
        delete this.accounts[key];
    }

    get(key: AccountKey) {
        return this.accounts[key];
    }

    set(accounts: { [key: AccountKey]: Account }) {
        this.accounts = accounts;
    }

    update(key: AccountKey, value: AccountValue) {
        this.accounts[key].value = value;
    }

    allreadyExists(key: AccountKey) {
        return this.accounts[key] !== undefined;
    }

    first() {
        const keys = Object.keys(this.accounts);
        if (keys.length === 0) return undefined;
        return this.accounts[keys[0] as AccountKey];
    }
}
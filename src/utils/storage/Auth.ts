import Storage from './Storage';

export default class Auth {
    #storage: Storage;
    constructor() {
        this.#storage = new Storage();
    }

    savePassword(password: string, callback?: () => void) {
        // validate password
        // encrypt password
        const encryptedPassword = password;
        this.#storage.savePassword(encryptedPassword, callback);
    }


}
import Storage from './Storage';

export default class Auth {
    #storage: Storage;
    constructor() {
        this.#storage = new Storage();
    }

    
}
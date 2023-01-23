export default interface AccountManager {
  create(password: string, seed: string, name: string): void;
  import(password: string, seed: string): void;
  changeName(): void;
  changePassword(): void;
  signIn(): void;
  forget(): void;
  export(): void;
  get(): void;
  getAll(): void;
  derive(): void;
}

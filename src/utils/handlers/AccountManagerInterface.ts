export default interface AccountManager {
  create(): void;
  import(): void;
  changeName(): void;
  changePassword(): void;
  signIn(): void;
  forget(): void;
  export(): void;
  get(): void;
  getAll(): void;
  derive(): void;
}

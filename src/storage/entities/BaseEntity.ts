import Storage from "../Storage";

export default class BaseEntity {
  static async init() {
    return;
  }

  static async getDefaultValue<T>(): Promise<T | undefined> {
    return undefined as T;
  }

  static fromData<T>(data: { [key: string]: string }): T {
    const entity = new this() as T;
    Object.keys(data).forEach((key) => {
      (entity as { [key: string]: string })[key] = data[key];
    });
    return entity;
  }

  static async get<T>(): Promise<T | undefined> {
    const stored = await Storage.getInstance().storage.get(this.getName());
    if (!stored || !stored[this.getName()]) return this.getDefaultValue();
    return this.fromData(stored[this.getName()]);
  }

  static async set<T>(data: T): Promise<void> {
    await Storage.getInstance().storage.set({ [this.getName()]: data });
  }

  static async remove(): Promise<void> {
    await Storage.getInstance().storage.remove(this.getName());
  }

  static getName() {
    return this.name;
  }
}

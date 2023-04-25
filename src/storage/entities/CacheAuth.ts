import BaseEntity from "./BaseEntity";

export default class CacheAuth extends BaseEntity {
  password: string | undefined;
  isUnlocked: boolean;
  timeout: number;

  private constructor() {
    super();
    this.password = undefined;
    this.isUnlocked = false;
    this.timeout = 0;
  }

  private static instance: CacheAuth;

  public static getInstance() {
    if (!CacheAuth.instance) {
      CacheAuth.instance = new CacheAuth();
    }
    return CacheAuth.instance;
  }

  static async init() {
    await CacheAuth.get<CacheAuth>();
  }

  static fromData<CacheAuth>(data: { [key: string]: unknown }): CacheAuth {
    const entity = CacheAuth.getInstance();
    Object.keys(data).forEach((key) => {
      (entity as any)[key] = data[key];
    });
    return entity as CacheAuth;
  }

  save(password: string) {
    try {
      this.password = password;
      this.isUnlocked = true;
      // TODO - this should be configurable
      this.timeout = new Date().getTime() + 1000 * 60 * 30;
    } catch (error) {
      throw new Error(error as string);
    }
  }

  static async clear() {
    CacheAuth.getInstance().password = undefined;
    CacheAuth.getInstance().isUnlocked = false;
    CacheAuth.getInstance().timeout = 0;
    CacheAuth.set<CacheAuth>(CacheAuth.getInstance());
  }

  static hasExpired(): boolean {
    const now = new Date().getTime();
    const cache = CacheAuth.getInstance();
    const hasExpired = cache.timeout < now;
    if (hasExpired) CacheAuth.clear();
    return hasExpired;
  }
}

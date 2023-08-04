import BaseEntity from "./BaseEntity";

export default class CacheAuth extends BaseEntity {
  private constructor(public isUnlocked: boolean, public timeout: number) {
    super();
  }

  private static instance: CacheAuth;

  public static getInstance() {
    if (!CacheAuth.instance) {
      CacheAuth.instance = new CacheAuth(false, 0);
    }
    return CacheAuth.instance;
  }

  static async init() {
    await CacheAuth.get<CacheAuth>();
  }

  static fromData<CacheAuth>(data: { [key: string]: unknown }): CacheAuth {
    const entity = CacheAuth.getInstance();
    Object.keys(data).forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      (entity as { [key: string]: unknown })[key] = data[key];
    });
    return entity as CacheAuth;
  }

  static async unlock() {
    const cache = CacheAuth.getInstance();
    cache.isUnlocked = true;
    cache.timeout = new Date().getTime() + 1000 * 60 * 30;
    await CacheAuth.set<CacheAuth>(cache);
  }

  static async clear() {
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

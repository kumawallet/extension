import Auth from "../Auth";
import Storage from "../Storage";
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

  static fromData<CacheAuth>(data: { [key: string]: any }): CacheAuth {
    const entity = CacheAuth.getInstance();
    Object.keys(data).forEach((key) => {
      (entity as any)[key] = data[key];
    });
    return entity as CacheAuth;
  }

  private static save(password: string) {
    try {
      CacheAuth.getInstance().password = password;
      CacheAuth.getInstance().isUnlocked = true;
      CacheAuth.getInstance().timeout =
        new Date().getTime() + 1000 * 60 * 60 * 24;
    } catch (error) {
      throw new Error(error as string);
    }
  }

  static async cachePassword() {
    try {
      if (!Auth.password) {
        return;
      }
      const salt = await Storage.getInstance().getSalt();
      const encrypted = await Auth.generateSaltedHash(salt, Auth.password);
      CacheAuth.save(encrypted);
      await CacheAuth.set<CacheAuth>(CacheAuth.getInstance());
    } catch (error) {
      console.error(error);
      CacheAuth.clear();
      throw new Error("failed_to_cache_password");
    }
  }

  static async loadFromCache() {
    try {
      await CacheAuth.get<CacheAuth>();
      const salt = await Storage.getInstance().getSalt();
      await Auth.loadAuthFromCache(salt);
    } catch (error) {
      console.error(error);
      CacheAuth.clear();
    }
  }

  static async clear() {
    CacheAuth.getInstance().password = undefined;
    CacheAuth.getInstance().isUnlocked = false;
    CacheAuth.getInstance().timeout = 0;
    CacheAuth.set<CacheAuth>(CacheAuth.getInstance());
  }

  static async hasExpired() {
    const now = new Date().getTime();
    const cache = CacheAuth.getInstance();
    const hasExpired =
      cache.isUnlocked && cache.password && cache.timeout < now;
    if (hasExpired) CacheAuth.clear();
    return hasExpired;
  }
}

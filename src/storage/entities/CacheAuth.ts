import { CACHE_AUTH } from "../../utils/constants";
import Auth from "../Auth";
import Storable from "../Storable";
import Storage from "../Storage";

type StoredCacheAuth = {
  password: string;
  isUnlocked: boolean;
  timeout: number;
};

export default class CacheAuth extends Storable {
  password: string | undefined;
  isUnlocked: boolean;
  timeout: number;

  private constructor() {
    super(CACHE_AUTH);
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

  private setCachedData({ password, isUnlocked, timeout }: StoredCacheAuth) {
    this.password = password as string;
    this.isUnlocked = isUnlocked as boolean;
    this.timeout = timeout as number;
  }

  private static async get() {
    const stored = await Storage.getInstance().get(CACHE_AUTH);
    if (!stored) return;
    const cacheAuth = CacheAuth.getInstance();
    cacheAuth.setCachedData(stored);
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

  static async set(cache: CacheAuth) {
    await Storage.getInstance().set(CACHE_AUTH, cache);
  }

  static async cachePassword() {
    try {
      if (!Auth.password) {
        return;
      }
      const salt = await Storage.getInstance().getSalt();
      const encrypted = await Auth.generateSaltedHash(salt, Auth.password);
      CacheAuth.save(encrypted);
      await CacheAuth.set(CacheAuth.getInstance());
    } catch (error) {
      console.error(error);
      CacheAuth.clear();
    }
  }

  static async loadFromCache() {
    try {
      await CacheAuth.get();
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
    CacheAuth.set(CacheAuth.getInstance());
  }

  static async hasExpired() {
    const now = new Date().getTime();
    const cache = CacheAuth.getInstance();
    const hasExpired = cache.isUnlocked && cache.password && cache.timeout < now;
    if (hasExpired) CacheAuth.clear();
    return hasExpired;
  }
}

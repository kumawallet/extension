import { CACHE_AUTH } from "../../../utils/constants";
import Storable from "../Storable";

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

  set({ password, isUnlocked, timeout }: any) {
    this.password = password as string;
    this.isUnlocked = isUnlocked as boolean;
    this.timeout = timeout as number;
  }

  static save(password: string) {
    try {
      CacheAuth.getInstance().password = password;
      CacheAuth.getInstance().isUnlocked = true;
      CacheAuth.getInstance().timeout =
        new Date().getTime() + 1000 * 60 * 60 * 24;
    } catch (error) {
      throw new Error(error as string);
    }
  }

  static async clear() {
    CacheAuth.getInstance().password = undefined;
    CacheAuth.getInstance().isUnlocked = false;
    CacheAuth.getInstance().timeout = 0;
  }

  static async isExpired() {
    const now = new Date().getTime();
    const cache = CacheAuth.getInstance();
    const expired = cache.isUnlocked && cache.password && cache.timeout < now;
    if (expired) CacheAuth.clear();
    return expired;
  }
}

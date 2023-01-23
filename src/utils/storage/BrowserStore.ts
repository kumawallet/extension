import store from "store";

export class BrowserStore {
  all(fn: (...params: any) => void) {
    store.each((value, key) => {
      fn(key, value);
    });
  }
  get(key: string, fn: (...params: any) => void) {
    fn(store.get(key));
  }
  remove(key: string, fn: (...params: any) => void) {
    store.remove(key);
    fn && fn();
  }
  set(key: string, value: any, fn: (...params: any) => void) {
    store.set(key, value);
    fn && fn();
  }
}

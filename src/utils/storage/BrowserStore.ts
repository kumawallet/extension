import store from "store";

export class BrowserStore {
  all(fn?: (...params: any) => void) {
    const items: any[] = [];
    store.each((value, key) => {
      items.push({
        [key]: value,
      });
    });
    fn?.(items);
  }
  get(key: string, fn: (...params: any) => void) {
    fn(store.get(key));
  }
  remove(key: string, fn: (...params: any) => void) {
    store.remove(key);
    fn && fn();
  }
  set(key: string, value: any, fn?: (...params: any) => void) {
    store.set(key, value);
    fn && fn();
  }
}

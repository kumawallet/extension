import { BACKUP } from "@src/utils/constants";
import Storable from "../Storable";
import Storage from "../Storage";

export default class BackUp extends Storable {
  data: string | undefined;

  constructor() {
    super(BACKUP);
    this.data = undefined;
  }
  

  static async get(): Promise<BackUp | undefined> {
    const stored = await Storage.getInstance().get(BACKUP);
    if (!stored || !stored.data) return undefined;
    const backup = new BackUp();
    backup.set(stored.data);
    return backup;
  }

  static async set(backup: string) {
    const save = new BackUp()
    save.set(backup);
    await Storage.getInstance().set(BACKUP, save);
  }

  set(data: string) {
    this.data = data;
  }
}

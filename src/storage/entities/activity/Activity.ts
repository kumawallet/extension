import { AccountKey } from "@src/accounts/types";
import BaseEntity from "../BaseEntity";
import Network from "../Network";
import SelectedAccount from "../SelectedAccount";
import Record from "./Record";
import { RecordStatus } from "./types";

export default class Activity extends BaseEntity {
  data: { [account: string]: { [hash: string]: Record } };

  constructor() {
    super();
    this.data = {};
  }

  static getName() {
    return "Activity";
  }

  static async init(): Promise<void> {
    await Activity.set<Activity>(new Activity());
  }

  static async addRecord(txHash: string, record: Record): Promise<void> {
    const activity = await Activity.get<Activity>();
    if (!activity) throw new Error("failed_to_add_record");
    const { key } = (await SelectedAccount.get<SelectedAccount>()) || {};
    if (!key) throw new Error("failed_to_add_record");
    activity.addRecord(key, txHash, record);
    await Activity.set<Activity>(activity);
  }

  static async getRecords(): Promise<Record[]> {
    const { key } = (await SelectedAccount.get<SelectedAccount>()) || {};
    if (!key) throw new Error("failed_to_add_record");
    const activity = await Activity.get<Activity>();
    if (!activity) throw new Error("failed_to_get_records");
    const { chain } = (await Network.get<Network>()) || {};
    if (!chain || !chain.name) throw new Error("failed_to_get_records");
    return activity.getRecords(key, chain.name);
  }

  static async updateRecordStatus(
    txHash: string,
    status: RecordStatus,
    error: string | undefined
  ): Promise<void> {
    const { key } = (await SelectedAccount.get<SelectedAccount>()) || {};
    if (!key) throw new Error("failed_to_add_record");
    const activity = await Activity.get<Activity>();
    if (!activity) throw new Error("failed_to_update_record_status");
    const record = activity.data[key][txHash];
    if (!record) throw new Error("failed_to_update_record_status");
    record.status = status;
    record.lastUpdated = Date.now();
    record.error = error;
    activity.addRecord(key, txHash, record);
    await Activity.set<Activity>(activity);
  }

  addRecord(key: AccountKey, txHash: string, record: Record): void {
    this.data[key] = {
      ...this.data[key],
      [txHash?.toLowerCase()]: record,
    };
  }

  getRecords(key: AccountKey, network: string): Record[] {
    const records = this.data[key] ? Object.values(this.data[key]) : [];

    return records
      .filter((r) => {
        // @ts-expect-error -- *
        return r.originNetwork?.toLowerCase() === network?.toLowerCase();
      })
      .sort((a, b) => (b.createdAt as number) - (a.createdAt as number));
  }
}

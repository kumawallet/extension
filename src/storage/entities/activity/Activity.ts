import { AccountKey } from "@src/accounts/types";
import BaseEntity from "../BaseEntity";
import { RecordStatus } from "./types";
import { Transaction } from "@src/types";

export default class Activity extends BaseEntity {
  data: { [account: string]: { [hash: string]: Transaction} };

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

  static async addRecord(
    accountKey: AccountKey,
    txHash: string,
    record: Transaction
  ): Promise<void> {
    const activity = await Activity.get<Activity>();
    if (!activity) throw new Error("failed_to_add_record");
    activity.addRecord(accountKey, txHash, record);
    await Activity.set<Activity>(activity);
  }

  static async getRecords({
    address,
    networkNames,
  }: {
    address: string;
    networkNames: string[];
  }): Promise<(Transaction)[] > {
    const activity = await Activity.get<Activity>();
    if (!activity) return [];

    const records = Object.values(activity.data[address] || {});
    return records.filter((r) => [r.originNetwork, r.targetNetwork].some((n) => networkNames.includes(n)));}
  

  static async updateRecordStatus(
    key: AccountKey,
    txHash: string,
    fields: {
      status: RecordStatus;
      fee: string;
    }
  ): Promise<void> {
    const activity = await Activity.get<Activity>();
    if (!activity) throw new Error("failed_to_update_record_status");
    const record = activity.data[key][txHash];
    if (!record) throw new Error("failed_to_update_record_status");

    record.status = fields.status;
    record.lastUpdated = Date.now();
    record.fee = fields.fee;

    activity.addRecord(key, txHash, record);
    await Activity.set<Activity>(activity);
  }

  addRecord(key: AccountKey, txHash: string, record: Transaction): void {
    this.data[key] = {
      ...this.data[key],
      [txHash?.toLowerCase()]: record,
    };
  }
}

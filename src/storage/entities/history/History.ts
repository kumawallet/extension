import BaseEntity from "../BaseEntity";
import Record from "./Record";
import { RecordStatus } from "./types";

export default class History extends BaseEntity {
  data: { [hash: string]: Record };

  constructor() {
    super();
    this.data = {};
  }

  static async init(): Promise<void> {
    await History.set<History>(new History());
  }

  static async addRecord(txHash: string, record: Record): Promise<void> {
    const history = await History.get<History>();
    if (!history) throw new Error("failed_to_add_record");
    history.addRecord(txHash, record);
    await History.set<History>(history);
  }

  static async getRecords(): Promise<Record[]> {
    const history = await History.get<History>();
    if (!history) throw new Error("failed_to_get_records");
    return history.getRecords();
  }

  static async updateRecordStatus(
    txHash: string,
    status: RecordStatus
  ): Promise<void> {
    const history = await History.get<History>();
    if (!history) throw new Error("failed_to_update_record_status");
    const record = history.data[txHash];
    if (!record) throw new Error("failed_to_update_record_status");
    record.status = status;
    record.lastUpdated = Date.now();
    history.addRecord(txHash, record);
    await History.set<History>(history);
  }

  addRecord(txHash: string, record: Record): void {
    this.data[txHash] = record;
  }

  getRecords(): Record[] {
    const records = Object.values(this.data) || [];
    return records.sort((a, b) => b.timestamp - a.timestamp);
  }
}

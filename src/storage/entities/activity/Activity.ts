import BaseEntity from "../BaseEntity";
import Network from "../Network";
import Record from "./Record";
import { RecordStatus } from "./types";

export default class Activity extends BaseEntity {
  data: { [network: string]: { [hash: string]: Record } };

  constructor() {
    super();
    this.data = {};
  }

  static async init(): Promise<void> {
    await Activity.set<Activity>(new Activity());
  }

  static async addRecord(txHash: string, record: Record): Promise<void> {
    const history = await Activity.get<Activity>();
    const network = await Network.get<Network>();
    if (!history) throw new Error("failed_to_add_record");
    if (!network || !network.chain) throw new Error("failed_to_add_record");
    history.addRecord(network.chain.name, txHash, record);
    await Activity.set<Activity>(history);
  }

  static async getRecords(): Promise<Record[]> {
    const network = await Network.get<Network>();
    if (!network || !network.chain) throw new Error("failed_to_add_record");
    const history = await Activity.get<Activity>();
    if (!history) throw new Error("failed_to_get_records");
    return history.getRecords(network.chain.name);
  }

  static async updateRecordStatus(
    txHash: string,
    status: RecordStatus
  ): Promise<void> {
    const network = await Network.get<Network>();
    if (!network || !network.chain) throw new Error("failed_to_add_record");
    const history = await Activity.get<Activity>();
    if (!history) throw new Error("failed_to_update_record_status");
    const record = history.data[network.chain.name][txHash];
    if (!record) throw new Error("failed_to_update_record_status");
    record.status = status;
    record.lastUpdated = Date.now();
    history.addRecord(network.chain.name, txHash, record);
    await Activity.set<Activity>(history);
  }

  addRecord(network: string, txHash: string, record: Record): void {
    this.data[network.toLowerCase()][txHash.toLowerCase()] = record;
  }

  getRecords(network: string): Record[] {
    const records = Object.values(this.data[network.toLowerCase()]) || [];
    return records.sort((a, b) => b.timestamp - a.timestamp);
  }
}

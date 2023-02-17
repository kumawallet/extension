import { RecordStatus, RecordType } from "./types";

export default abstract class Record {
  hash: string;
  type: RecordType;
  reference: string;
  status: RecordStatus;
  timestamp: number;
  error: string | undefined;
  lastUpdated: number;

  constructor(
    hash: string,
    type: RecordType,
    reference: string,
    status: RecordStatus,
    timestamp: number,
    error?: string
  ) {
    this.hash = hash;
    this.type = type;
    this.reference = reference;
    this.status = status;
    this.timestamp = timestamp;
    this.error = error;
    this.lastUpdated = Date.now();
  }
}

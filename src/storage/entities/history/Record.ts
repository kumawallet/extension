import { RecordStatus, RecordType } from "./types";

export default class Record {
  type: RecordType;
  reference: string;
  status: RecordStatus;
  timestamp: number;
  error: string | undefined;
  lastUpdated: number;

  constructor(
    type: RecordType,
    reference: string,
    status: RecordStatus,
    timestamp: number,
    error?: string
  ) {
    this.type = type;
    this.reference = reference;
    this.status = status;
    this.timestamp = timestamp;
    this.error = error;
    this.lastUpdated = Date.now();
  }
}

import { RecordData, RecordStatus, RecordType } from "./types";

export default abstract class Record {
  hash: string;
  type: RecordType;
  reference: string;
  address: string;
  status: RecordStatus;
  createdAt: number;
  error: string | undefined;
  lastUpdated: number;
  network: string;
  recipientNetwork: string;
  abstract data: RecordData;

  constructor(
    hash: string,
    address: string,
    type: RecordType,
    network: string,
    recipientNetwork: string,
    reference: string,
    status: RecordStatus,
    error?: string
  ) {
    this.hash = hash;
    this.address = address;
    this.type = type;
    this.network = network;
    this.recipientNetwork = recipientNetwork;
    this.reference = reference;
    this.status = status;
    this.createdAt = Date.now();
    this.error = error;
    this.lastUpdated = Date.now();
  }

  updateStatus(status: RecordStatus, error?: string): void {
    this.status = status;
    this.error = error;
    this.lastUpdated = Date.now();
  }
}

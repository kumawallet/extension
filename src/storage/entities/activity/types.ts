export enum RecordType {
  CALL = "call",
  TRANSFER = "transfer",
}

export enum RecordStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAIL = "fail",
}

export type TransferData = {
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
};

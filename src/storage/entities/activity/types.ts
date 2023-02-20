export enum RecordType {
  CALL = "call",
  TRANSFER = "transfer",
}

export enum RecordStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAIL = "fail",
}

export type RecordData = CallData | TransferData;

export type CallData = {
  symbol: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  data: string;
};

export type TransferData = {
  symbol: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
};

export type XCM = {
  symbol: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  message: string;
}

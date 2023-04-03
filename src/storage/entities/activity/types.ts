export enum RecordType {
  CALL = "call",
  TRANSFER = "transfer",
}

export enum RecordStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAIL = "fail",
}

type AssetRecord = {
  id: string;
  colot: string;
};

export type RecordData = CallData | TransferData;

export type CallData = {
  asset: AssetRecord;
  symbol: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  data: string;
};

export type TransferData = {
  asset: AssetRecord;
  symbol: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
};

export type XCM = {
  fromAsset: AssetRecord;
  toAsset: AssetRecord;
  symbol: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  message: string;
};

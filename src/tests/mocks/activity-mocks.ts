import Record from "@src/storage/entities/activity/Record";
import { RecordStatus, RecordType } from "@src/storage/entities/activity/types";

export const activitysMock: Partial<Record>[] = [
  {
    createdAt: 10,
    address: "0x12345",
    error: undefined,
    hash: "0x123456",
    status: RecordStatus.PENDING,
    type: RecordType.TRANSFER,
    network: "test",
    recipientNetwork: "recipientNetwork",
    reference: "reference",
    data: {
      fee: "",
      asset: {
        id: "2",
        color: "red",
      },
      data: "data",
      from: "0x12345",
      to: "0x54321",
      value: "100",
      gas: "100",
      gasPrice: "100",
      symbol: "testth",
    },
  },
];

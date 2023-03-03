import Record from "./Record";
import { TransferData, RecordType, RecordStatus } from "./types";

export default class TransferRecord extends Record {
  data: TransferData;

  constructor(
    hash: string,
    address: string,
    network: string,
    data: TransferData,
    reference: string
  ) {
    super(
      hash,
      address,
      RecordType.TRANSFER,
      network,
      network,
      reference,
      RecordStatus.PENDING,
    );
    this.data = data;
  }
}

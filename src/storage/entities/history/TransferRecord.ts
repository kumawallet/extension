import Record from "./Record";
import { TransferData, RecordType, RecordStatus } from "./types";

export default class TransferRecord extends Record {
  data: TransferData;

  constructor(data: TransferData, reference: string) {
    super(RecordType.TRANSFER, reference, RecordStatus.PENDING, Date.now());
    this.data = data;
  }
}

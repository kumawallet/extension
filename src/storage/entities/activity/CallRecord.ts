import Record from "./Record";
import { RecordType, RecordStatus, CallData } from "./types";

export default class CallRecord extends Record {
  data: CallData;

  constructor(
    hash: string,
    address: string,
    network: string,
    data: CallData,
    reference: string
  ) {
    super(
      hash,
      address,
      RecordType.CALL,
      network,
      network,
      reference,
      RecordStatus.PENDING
    );
    this.data = data;
  }
}

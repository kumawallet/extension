import { Transaction } from "@src/types";

export interface InitialState {
  activity: Transaction[];
}

export interface TxContext {
  state: InitialState;
}

export type Action =
  | {
      type: "init-activity";
      payload: {
        activity: Transaction[];
      };
    }
  | {
      type: "update-activity-status";
      payload: {
        hash: string;
        status: RecordStatus;
        error: string | undefined;
      };
    };

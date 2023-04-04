import Record from "@src/storage/entities/activity/Record";

export interface InitialState {
  activity: Record[];
}

export interface TxContext {
  state: InitialState;
}

export type Action =
  | {
      type: "init-activity";
      payload: {
        activity: Record[];
      };
    }
  | {
      type: "update-activity-status";
      payload: {
        hash: string;
        status: RecordStatus;
        error: string;
      };
    };

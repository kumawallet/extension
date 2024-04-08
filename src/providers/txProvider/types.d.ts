import { Transaction } from "@src/types";

export interface InitialState {
  activity: Transaction[];
  hasNextPage: boolean;
  isLoading: boolean;
}

export interface TxContext {
  state: InitialState;
  loadMoreActivity: () => Promise<void>;
}

export type Action =
  | {
      type: "init-activity";
      payload: {
        activity: Transaction[];
        hasNextPage: boolean;
      };
    }
  | {
      type: "loading-activity";
    }
  | {
      type: "load-more-activity";
      payload: {
        activity: Transaction[];
        hasNextPage: boolean;
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

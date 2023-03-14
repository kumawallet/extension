import { useToast } from "../../hooks";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { AccountType } from "@src/accounts/types";
import { useNetworkContext } from "../networkProvider/NetworkProvider";
import {
  RecordStatus,
  RecordType,
  TransferData,
} from "@src/storage/entities/activity/types";
import { useAccountContext } from "../accountProvider";
import Extension from "@src/Extension";
import Record from "@src/storage/entities/activity/Record";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { ISubmittableResult } from "@polkadot/types/types";
import { ApiPromise } from "@polkadot/api";

interface InitialState {
  queue: newTx[];
  activity: any[];
}

const initialState: InitialState = {
  queue: [],
  activity: [],
};

interface TxContext {
  state: InitialState;
  addTxToQueue: (newTx: newTx) => void;
}

const TxContext = createContext({} as TxContext);

const reducer = (state: InitialState, action: any): InitialState => {
  switch (action.type) {
    // case "init": {
    //   return {
    //     ...action.payload,
    //     isInit: false,
    //   };
    // }

    case "add-tx-to-queue": {
      const { tx } = action.payload;

      return {
        ...state,
        queue: [...state.queue, tx],
      };
    }
    case "add-activity": {
      const { tx } = action.payload;

      return {
        ...state,
        activity: [tx, ...state.activity],
      };
    }
    case "init-activity": {
      const { activity } = action.payload;

      return {
        ...state,
        activity,
      };
    }
    case "update-activity-status": {
      const { hash, status, error } = action.payload;
      const activity = state.activity.map((act) =>
        act.hash === hash ? { ...act, status, error } : act
      );
      return {
        ...state,
        activity,
      };
    }
    case "remove-from-queue": {
      const { index } = action.payload;
      const queue = state.queue.filter((_, _index) => _index !== index);

      return {
        ...state,
        queue,
      };
    }
    default:
      return state;
  }
};

interface newTx {
  type: AccountType;
  tx: SubmittableExtrinsic<"promise">;
  sender: any;
  destinationAccount: string;
  amount: number;
}

interface ProcessWasmTxProps {
  tx: newTx;
}

export const TxProvider: FC<PropsWithChildren> = ({ children }) => {
  const { t: tCommon } = useTranslation("common");
  const { showErrorToast } = useToast();

  const {
    state: { api, selectedChain },
  } = useNetworkContext();

  const {
    state: { selectedAccount },
  } = useAccountContext();

  const [state, dispatch] = useReducer(reducer, initialState);
  const [isSearching, setisSearching] = useState(false);

  const addTxToQueue = (newTx: newTx) => {
    ///
    dispatch({
      type: "add-tx-to-queue",
      payload: {
        tx: newTx,
      },
    });
  };

  useEffect(() => {
    if (state.queue.length > 0) {
      const lasIndex = state.queue.length - 1;
      const lastTx = state.queue[lasIndex];

      if (lastTx.type === AccountType.WASM) {
        processWasmTx(lastTx);
      }
    }
  }, [state.queue]);

  useEffect(() => {
    if (selectedAccount.key && api) {
      (async () => {
        const records = await Extension.getActivity();
        dispatch({
          type: "init-activity",
          payload: {
            activity: records,
          },
        });
      })();
    }
  }, [selectedAccount.key, api]);

  useEffect(() => {
    if (state.activity.length > 0 && !isSearching) {
      setisSearching(true);
      for (const activity of state.activity) {
        if (activity.status === RecordStatus.PENDING) {
          searchTx(Number(activity?.fromBlock), activity.hash);
        }
      }
    }
  }, [state.activity, isSearching]);

  const processWasmTx = async ({
    amount,
    destinationAccount,
    sender,
    tx: extrinsic,
    type,
  }: newTx) => {
    const a = await (api as ApiPromise).rpc.chain.getBlock();

    const unsub = await extrinsic?.signAndSend(
      sender,
      async ({ events, txHash, status }: ISubmittableResult) => {
        if (String(status.type) === "Ready") {
          const hash = txHash.toString();
          const date = Date.now();
          const reference = "wasm";
          const activity = {
            fromBlock: a.block.header.number.toString(),
            address: destinationAccount,
            type: RecordType.TRANSFER,
            reference,
            hash,
            status: RecordStatus.PENDING,
            createdAt: date,
            lastUpdated: date,
            error: undefined,
            network: selectedChain?.name || "",
            recipientNetwork: selectedChain?.name || "",
            data: {
              symbol: String(selectedChain?.nativeCurrency.symbol),
              from: selectedAccount.value.address,
              to: destinationAccount,
              gas: "0",
              gasPrice: "0",
              value: String(amount),
            } as TransferData,
          };
          dispatch({
            type: "add-activity",
            payload: {
              tx: activity,
            },
          });
          await Extension.addActivity(hash, activity as Record);
          console.log("save record");
        }
        if (status.isFinalized) {
          const failedEvents = events.filter(({ event }) =>
            api.events.system.ExtrinsicFailed.is(event)
          );
          console.log("failed events", failedEvents);
          let status = RecordStatus.PENDING;
          let error = undefined;
          if (failedEvents.length > 0) {
            console.log("update to failed");
            failedEvents.forEach(
              ({
                event: {
                  data: [_error, info],
                },
              }) => {
                if (_error.isModule) {
                  // for module errors, we have the section indexed, lookup
                  const decoded = api.registry.findMetaError(_error.asModule);
                  const { docs, method, section } = decoded;
                  error = `${section}.${method}: ${docs.join(" ")}`;
                  console.log(error);
                } else {
                  // Other, CannotLookup, BadOrigin, no extra info
                  error = _error.toString();
                  console.log(error);
                }
              }
            );
            status = RecordStatus.FAIL;
          } else {
            status = RecordStatus.SUCCESS;
          }
          const hash = txHash.toString();
          console.log("should update:", {
            hash,
            status,
          });
          dispatch({
            type: "update-activity-status",
            payload: {
              hash,
              status,
              error,
            },
          });
          await Extension.updateActivity(hash, status, error);
          unsub();
        }
      }
    );
  };

  const searchTx = async (blockNumber: any, extHash: any) => {
    let number = blockNumber;
    let finish = false;
    while (!finish) {
      const hash = await (api as ApiPromise).rpc.chain.getBlockHash(number);
      const { block } = await (api as ApiPromise).rpc.chain.getBlock(hash);

      const apiAt = await api.at(block.header.hash);
      const allRecords = await apiAt.query.system.events();

      for (const [
        index,
        {
          method: { method, section },
          hash,
        },
      ] of block.extrinsics.entries()) {
        // console.log();
        if (hash.toString() === extHash) {
          console.log("found at: ", number);
          allRecords
            // filter the specific events based on the phase and then the
            // index of our extrinsic in the block
            .filter(
              ({ phase }) =>
                phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(index)
            )
            // test the events against the specific types we are looking for
            .forEach(async ({ event }) => {
              let status = RecordStatus.PENDING;
              let error = undefined;
              if (api.events.system.ExtrinsicSuccess.is(event)) {
                status = RecordStatus.SUCCESS;
              } else if (api.events.system.ExtrinsicFailed.is(event)) {
                const [dispatchError] = event.data;

                if (dispatchError.isModule) {
                  const decoded = api.registry.findMetaError(
                    dispatchError.asModule
                  );

                  error = `${decoded.section}.${decoded.name}`;
                } else {
                  error = dispatchError.toString();
                }
                status = RecordStatus.FAIL;
              }

              await Extension.updateActivity(hash.toString(), status, error);

              // dispatch({
              //   type: "update-activity-status",
              //   payload: {
              //     hash,
              //     status,
              //     error,
              //   },
              // });
            });
          finish = true;
          break;
        }
      }

      number++;
      if (number === blockNumber + 10) {
        finish = true;
      }
    }
  };

  return (
    <TxContext.Provider
      value={{
        state,
        addTxToQueue,
      }}
    >
      {children}
    </TxContext.Provider>
  );
};

export const useTxContext = () => useContext(TxContext);

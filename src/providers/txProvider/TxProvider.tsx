import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useReducer,
  // useState,
} from "react";
import { RecordStatus } from "@src/storage/entities/activity/types";
import { useAccountContext } from "../accountProvider";
import Extension from "@src/Extension";
import { ApiPromise } from "@polkadot/api";
import { ethers } from "ethers";
import { Tx } from "@src/pages";
import { useNetworkContext } from "..";

interface InitialState {
  activity: any[];
}

const initialState: InitialState = {
  activity: [],
};

interface TxContext {
  state: InitialState;
  addTxToQueue: (newTx: newTx) => void;
}

const TxContext = createContext({} as TxContext);

const reducer = (state: InitialState, action: any): InitialState => {
  switch (action.type) {
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
    default:
      return state;
  }
};

interface newTx {
  tx: Tx;
  destinationAccount: string;
  amount: number;
}

export const TxProvider: FC<PropsWithChildren> = ({ children }) => {
  const {
    state: { api, selectedChain },
  } = useNetworkContext();

  const {
    state: { selectedAccount },
  } = useAccountContext();

  const [state, dispatch] = useReducer(reducer, initialState);
  // const [isSearching, setisSearching] = useState(false);

  const loadActivity = async () => {
    const records = await Extension.getActivity();
    dispatch({
      type: "init-activity",
      payload: {
        activity: records,
      },
    });
    return records;
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
        if (hash.toString() === extHash) {
          allRecords

            .filter(
              ({ phase }) =>
                phase.isApplyExtrinsic && phase.asApplyExtrinsic.eq(index)
            )
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

              dispatch({
                type: "update-activity-status",
                payload: {
                  hash,
                  status,
                  error,
                },
              });
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

  const searchEvmTx = async (hash: string) => {
    const txReceipt = await (
      api as ethers.providers.JsonRpcProvider
    ).getTransaction(hash);
    const result = await txReceipt.wait();

    const status =
      result.status === 1 ? RecordStatus.SUCCESS : RecordStatus.FAIL;
    const error = "";

    dispatch({
      type: "update-activity-status",
      payload: {
        hash: hash,
        status,
        error,
      },
    });
    await Extension.updateActivity(hash, status, error);
  };

  const processPendingTxs = async (activityArray: any[]) => {
    for (const activity of activityArray) {
      if (activity.status === RecordStatus.PENDING) {
        if (activity.reference === "WASM") {
          searchTx(Number(activity?.fromBlock), activity.hash);
        } else {
          searchEvmTx(activity.hash);
        }
      }
    }
  };

  const activityListener = ({ origin, method }: any) => {
    if (origin === "kuma" && method === "update_activity") {
      loadActivity();
    }
  };

  useEffect(() => {
    if (selectedAccount.key && selectedChain?.name && api) {
      (async () => {
        const records = await loadActivity();
        dispatch({
          type: "init-activity",
          payload: {
            activity: records,
          },
        });
        processPendingTxs(records);
      })();
    }
  }, [selectedAccount.key, api, selectedChain?.name]);

  useEffect(() => {
    if (!api) return;
    chrome.runtime.onMessage.addListener(activityListener);
    return () => {
      chrome.runtime.onMessage.removeListener(activityListener);
    };
  }, [api]);

  return (
    <TxContext.Provider
      value={{
        state,
        addTxToQueue: () => {
          //
        },
      }}
    >
      {children}
    </TxContext.Provider>
  );
};

export const useTxContext = () => useContext(TxContext);

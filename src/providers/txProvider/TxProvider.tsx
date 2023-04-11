import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { RecordStatus } from "@src/storage/entities/activity/types";
import Extension from "@src/Extension";
import { ApiPromise } from "@polkadot/api";
import { ethers } from "ethers";
import { useNetworkContext, useAccountContext } from "@src/providers";
import { Action, InitialState, TxContext } from "./types";
import Record from "@src/storage/entities/activity/Record";

const initialState: InitialState = {
  activity: [],
};

const TxContext = createContext({} as TxContext);

export const reducer = (state: InitialState, action: Action): InitialState => {
  switch (action.type) {
    case "init-activity": {
      const { activity } = action.payload;

      return {
        ...state,
        activity,
      };
    }
    case "update-activity-status": {
      const { hash, status, error } = action.payload;

      const _activity = [...state.activity];
      const index = _activity.findIndex((a) => a.hash === hash);
      if (index !== -1) {
        _activity[index].status = status;
        _activity[index].error = error;
      }

      return {
        ...state,
        activity: _activity,
      };
    }
    default:
      return state;
  }
};

export const TxProvider: FC<PropsWithChildren> = ({ children }) => {
  const {
    state: { api, selectedChain },
  } = useNetworkContext();

  const {
    state: { selectedAccount },
  } = useAccountContext();

  const [state, dispatch] = useReducer(reducer, initialState);

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

  const searchWasmTx = async (blockNumber: number, extHash: string) => {
    let number = blockNumber;
    let finish = false;
    while (!finish) {
      const _api = api as ApiPromise;
      const hash = await _api.rpc.chain.getBlockHash(number);
      const { block } = await _api.rpc.chain.getBlock(hash);

      const apiAt = await _api.at(block.header.hash);
      const allRecords = await apiAt.query.system.events();

      for (const [index, { hash }] of block.extrinsics.entries()) {
        if (hash.toString() === extHash) {
          Array.isArray(allRecords) &&
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

                const _hash = hash.toString();

                await Extension.updateActivity(_hash, status, error);

                dispatch({
                  type: "update-activity-status",
                  payload: {
                    hash: _hash,
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

  const processPendingTxs = async (activityArray: Record[]) => {
    for (const activity of activityArray) {
      if (activity.status === RecordStatus.PENDING) {
        if (activity.reference === "WASM") {
          searchWasmTx(Number(activity?.fromBlock), activity.hash);
        } else {
          searchEvmTx(activity.hash);
        }
      }
    }
  };

  const activityListener = ({
    origin,
    method,
  }: {
    origin: string;
    method: string;
  }) => {
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
      }}
    >
      {children}
    </TxContext.Provider>
  );
};

export const useTxContext = () => useContext(TxContext);

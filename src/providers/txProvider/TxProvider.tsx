import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { RecordStatus } from "@src/storage/entities/activity/types";
import { ApiPromise } from "@polkadot/api";
import { ethers } from "ethers";
import { useNetworkContext, useAccountContext } from "@src/providers";
import { Action, InitialState, TxContext } from "./types";
import Record from "@src/storage/entities/activity/Record";
import { getWebAPI } from "@src/utils/env";
import { messageAPI } from "@src/messageAPI/api";

const WebAPI = getWebAPI();

const initialState: InitialState = {
  activity: [],
  hasNextPage: false,
  isLoading: true,
};

const TxContext = createContext({} as TxContext);

export const reducer = (state: InitialState, action: Action): InitialState => {
  switch (action.type) {
    case "init-activity": {
      const { activity, hasNextPage } = action.payload;

      return {
        ...state,
        activity,
        hasNextPage,
        isLoading: false,
      };
    }
    case "load-more-activity": {
      return {
        ...state,
        isLoading: true,
      };
    }
    case "update-activity-status": {
      const { hash, status, error } = action.payload;

      const _activity = [...state.activity];
      const index = _activity.findIndex((a) => a.hash === hash);
      if (index !== -1) {
        _activity[index].status = status;
        // @ts-expect-error -- *

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
    try {
      const [savedTxs, { transactions, hasNextPage }] = await Promise.all([
        messageAPI.getActivity(),
        messageAPI
          .getHistoricActivity()
          .then((response) => response)
          .catch(() => {
            return { transactions: [], hasNextPage: false };
          }),
      ]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const allTxs: any[] = [...savedTxs];

      for (const tx of transactions) {
        const index = allTxs.findIndex((t) => t.hash === tx.hash);
        if (index === -1) {
          allTxs.push(tx);
        }
      }

      const orderedTxs = allTxs.sort((a, b) => {
        return b.timestamp - a.timestamp;
      });

      dispatch({
        type: "init-activity",
        payload: {
          activity: orderedTxs,
          hasNextPage,
        },
      });
      return orderedTxs;
    } catch (error) {
      dispatch({
        type: "init-activity",
        payload: {
          activity: [],
          hasNextPage: false,
        },
      });
      return [];
    }
  };

  const searchWasmTx = async (blockNumber: number, extHash: string) => {
    const _api = api as ApiPromise;
    const hash = await _api.rpc.chain.getBlockHash(blockNumber);
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

              await messageAPI.updateActivity({
                txHash: _hash,
                status,
                error,
              });

              dispatch({
                type: "update-activity-status",
                payload: {
                  hash: _hash,
                  status,
                  error,
                },
              });
            });
        break;
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
    await messageAPI.updateActivity({
      txHash: hash,
      status,
      error,
    });
  };

  const processPendingTxs = async (activityArray: Record[]) => {
    for (const activity of activityArray) {
      if (activity.status === RecordStatus.PENDING) {
        if (activity.reference === "WASM") {
          // eslint-disable-next-line
          searchWasmTx((activity as any)?.blockNumber, activity.hash);
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

  const loadMoreActivity = async () => {
    dispatch({
      type: "loading-activity",
    });

    const { transactions, hasNextPage } =
      await messageAPI.getHistoricActivity();
    dispatch({
      type: "load-more-activity",
      payload: {
        activity: transactions,
        hasNextPage,
      },
    });
  };

  useEffect(() => {
    if (selectedAccount.key && selectedChain?.name && api) {
      (async () => {
        const records = await loadActivity();
        processPendingTxs(records);
      })();
    }
  }, [selectedAccount.key, api, selectedChain?.name]);

  useEffect(() => {
    if (!api) return;
    WebAPI.runtime.onMessage.addListener(activityListener);
    return () => {
      WebAPI.runtime.onMessage.removeListener(activityListener);
    };
  }, [api]);

  return (
    <TxContext.Provider
      value={{
        state,
        loadMoreActivity,
      }}
    >
      {children}
    </TxContext.Provider>
  );
};

export const useTxContext = () => useContext(TxContext);

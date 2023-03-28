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
import { AddressOrPair } from "@polkadot/api/types";
import { ISubmittableResult } from "@polkadot/types/types";
import { ApiPromise } from "@polkadot/api";
import { ethers } from "ethers";
import { polkadotExtrinsic, Tx } from "@src/pages";
import { useAssetContext } from "../assetProvider";

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
  tx: Tx;
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

  const { loadAssets } = useAssetContext();

  const [state, dispatch] = useReducer(reducer, initialState);
  const [isSearching, setisSearching] = useState(false);

  const addTxToQueue = (newTx: newTx) => {
    dispatch({
      type: "add-tx-to-queue",
      payload: {
        tx: newTx,
      },
    });
  };

  useEffect(() => {
    if (state.queue.length > 0) {
      const lastTx = state.queue[0];

      if (lastTx.tx.type === AccountType.WASM) {
        processWasmTx(lastTx);
      } else {
        processEVMTx(lastTx);
      }
    }
  }, [state.queue]);

  useEffect(() => {
    if (selectedAccount.key && selectedChain?.name && api) {
      (async () => {
        const records = await Extension.getActivity();
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

  const processWasmTx = async ({ amount, destinationAccount, tx }: newTx) => {
    const { sender, tx: _tx, type, aditional } = tx;

    const a = await (api as ApiPromise).rpc.chain.getBlock();

    const unsub = await (_tx as polkadotExtrinsic)?.signAndSend(
      sender as AddressOrPair,
      { tip: Number(aditional?.tip) || undefined },
      async ({ events, txHash, status }: ISubmittableResult) => {
        if (String(status.type) === "Ready") {
          const hash = txHash.toString();
          const date = Date.now();
          const activity = {
            fromBlock: a.block.header.number.toString(),
            address: destinationAccount,
            type: RecordType.TRANSFER,
            reference: type,
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
        }
        if (status.isFinalized) {
          const failedEvents = events.filter(({ event }) =>
            api.events.system.ExtrinsicFailed.is(event)
          );
          let status = RecordStatus.PENDING;
          let error = undefined;
          if (failedEvents.length > 0) {
            failedEvents.forEach(
              ({
                event: {
                  data: [_error, info],
                },
              }) => {
                if (_error.isModule) {
                  const decoded = api.registry.findMetaError(_error.asModule);
                  const { docs, method, section } = decoded;
                  error = `${section}.${method}: ${docs.join(" ")}`;
                } else {
                  error = _error.toString();
                }
              }
            );
            status = RecordStatus.FAIL;
          } else {
            status = RecordStatus.SUCCESS;
            loadAssets();
          }
          const hash = txHash.toString();
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

  const processEVMTx = async ({
    amount,
    destinationAccount,
    tx: _tx,
  }: newTx) => {
    try {
      const tx = _tx as ethers.providers.TransactionResponse;

      const date = Date.now();

      const hash = tx.hash;

      const activity = {
        address: destinationAccount,
        type: RecordType.TRANSFER,
        reference: "EVM",
        hash: hash,
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
      await Extension.addActivity(tx.hash, activity as Record);

      const result = await tx.wait();

      const status =
        result.status === 1 ? RecordStatus.SUCCESS : RecordStatus.FAIL;
      const error = "";

      if (status === RecordStatus.SUCCESS) {
        loadAssets();
      }

      dispatch({
        type: "update-activity-status",
        payload: {
          hash: hash,
          status,
          error,
        },
      });
      await Extension.updateActivity(hash, status, error);
    } catch (err) {
      console.log(err);
      // const code = err.data.replace("Reverted ", "");
      // let reason = ethers.utils.toUtf8String("0x" + code.substr(138));
      // showErrorToast(reason);
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
        if (activity.reference === "wasm") {
          searchTx(Number(activity?.fromBlock), activity.hash);
        } else {
          searchEvmTx(activity.hash);
        }
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

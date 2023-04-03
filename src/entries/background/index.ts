import { AccountType } from "@src/accounts/types";
import Record from "@src/storage/entities/activity/Record";
import {
  RecordStatus,
  RecordType,
  TransferData,
} from "@src/storage/entities/activity/types";
import { makeQuerys } from "@src/utils/utils";
import { ethers } from "ethers";
import Extension from "@src/Extension";
import notificationIcon from "/icon-128.png";
import { BN } from "@polkadot/util";
import { ApiPromise } from "@polkadot/api";
import { AddressOrPair } from "@polkadot/api/types";
import { Asset, polkadotExtrinsic } from "@src/pages";
import { Chain } from "@src/storage/entities/Chains";
import { getProvider } from "@src/providers/networkProvider";
import { Keyring } from "@polkadot/keyring";

export interface TxToProcess {
  amount: BN;
  originAddress: string;
  destinationAddress: string;
  rpc: string;
  originNetwork: string;
  destinationNetwork: string;
  networkInfo: Chain;
  asset: Asset;
  tx: {
    sender: AddressOrPair;
    type: any;
    aditional: any;
    tx: polkadotExtrinsic;
  };
}

const openPopUp = (params: any) => {
  const querys = makeQuerys(params);

  return chrome.windows.create({
    url: chrome.runtime.getURL(`src/entries/popup/index.html${querys}`), // ?method="sign_message&params={}"
    type: "popup",
    top: 0,
    left: 0,
    width: 357,
    height: 600,
    focused: true,
  });
};

// read messages from content
chrome.runtime.onMessage.addListener(async function (request, sender) {
  if (request.origin === "kuma") {
    try {
      switch (request.method) {
        case "process_tx": {
          processTx(request.tx);
          return;
        }

        case "sign_message": {
          await openPopUp({ ...request, tabId: sender.tab?.id });
          return;
        }

        case "sign_message_response": {
          if (request.from !== "popup") return;
          await chrome.tabs.sendMessage(Number(request.toTabId), {
            ...request,
            from: "bg",
          });
          if (request.fromWindowId)
            await chrome.windows.remove(request.fromWindowId as number);

          return;
        }

        case "get_account_info": {
          getSelectedAccount()
            .then(async (res) => {
              await chrome.tabs.sendMessage(Number(sender.tab?.id), {
                origin: "kuma",
                method: `${request.method}_response`,
                response: {
                  address: res?.value.address,
                  type: res?.type,
                },
                from: "bg",
              });
            })
            .catch((err) => {
              console.log(err);
            });
          return;
        }

        default:
          break;
      }
    } catch (error) {
      console.log(error);
      await chrome.tabs.sendMessage(Number(request.toTabId), {
        ...{
          ...request,
          method: `${request.method}_response`,
        },
        from: "bg",
        error,
      });
      return error;
    }

    return true;
  }
});

chrome.runtime.onConnect.addListener(function (port) {
  if (port.name === "sign_message") {
    port.onDisconnect.addListener(async function (port) {
      const queries = port.sender?.url?.split("?")[1];
      const { tabId, origin, method } = Object.fromEntries(
        new URLSearchParams(queries)
      );
      await chrome.tabs.sendMessage(Number(tabId), {
        origin,
        method: `${method}_response`,
        response: null,
        from: "bg",
      });
    });
  }
});

const getSelectedAccount = () => {
  return Extension.getSelectedAccount();
};

const processTx = (tx: any) => {
  if (tx?.tx.type === AccountType.WASM) {
    processWasmTx(tx);
  } else {
    processEVMTx(tx);
  }
};

const processWasmTx = async ({
  amount,
  asset,
  originAddress,
  destinationAddress,
  originNetwork,
  destinationNetwork,
  networkInfo,
  tx,
  rpc,
}: TxToProcess) => {
  const { tx: _tx, type, aditional } = tx;
  const api = await getProvider(rpc, AccountType.WASM);
  const { block } = await (api as ApiPromise).rpc.chain.getBlock();

  const seed = await Extension.showSeed();
  const keyring = new Keyring({ type: "sr25519" });
  const sender = keyring.addFromMnemonic(seed as string);

  const unsub = await (api as ApiPromise)
    ?.tx(_tx)
    ?.signAndSend(
      sender as AddressOrPair,
      { tip: Number(aditional?.tip) || undefined },
      async ({ events, txHash, status }) => {
        if (String(status.type) === "Ready") {
          const hash = txHash.toString();
          const date = Date.now();
          const activity = {
            fromBlock: block.header.number.toString(),
            address: originAddress,
            type: RecordType.TRANSFER,
            reference: type,
            hash,
            status: RecordStatus.PENDING,
            createdAt: date,
            lastUpdated: date,
            error: undefined,
            network: networkInfo.name,
            recipientNetwork: destinationNetwork,
            data: {
              from: originAddress,
              to: destinationAddress,
              gas: "",
              gasPrice: "",
              symbol: asset.symbol,
              value: String(amount),
              asset: {
                id: asset.id,
                color: asset.color,
              },
            } as TransferData,
          };
          await Extension.addActivity(hash, activity as any);
          chrome.runtime.sendMessage({
            origin: "kuma",
            method: "update_activity",
          });
        }
        if (status.isFinalized) {
          const failedEvents = events.filter(({ event }) =>
            api?.events.system.ExtrinsicFailed.is(event)
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
                  const decoded = api?.registry.findMetaError(_error.asModule);
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
          }
          const hash = txHash.toString();

          await Extension.updateActivity(hash, status, error);
          sendNotification(`tx ${status}`, hash);
          sendUpdateActivityMessage();
          unsub();
        }
      }
    );
};

const processEVMTx = async ({
  amount,
  asset,
  originAddress,
  destinationAddress,
  originNetwork,
  destinationNetwork,
  networkInfo,
  tx,
  rpc,
}: TxToProcess) => {
  try {
    const api = (await getProvider(
      rpc,
      AccountType.EVM
    )) as ethers.providers.JsonRpcProvider;

    const txReceipt = await api.getTransaction(tx);
    const date = Date.now();
    const activity = {
      address: originAddress,
      type: RecordType.TRANSFER,
      reference: AccountType.EVM,
      hash: tx,
      status: RecordStatus.PENDING,
      createdAt: date,
      lastUpdated: date,
      error: undefined,
      network: networkInfo.name,
      recipientNetwork: destinationNetwork,
      data: {
        from: originAddress,
        to: destinationAddress,
        gas: "",
        gasPrice: "",
        symbol: asset.symbol,
        value: String(amount),
        asset: {
          id: asset.id,
          color: asset.color,
        },
      } as TransferData,
    };
    await Extension.addActivity(tx, activity as Record);
    sendUpdateActivityMessage();
    const result = await txReceipt.wait();
    const status =
      result.status === 1 ? RecordStatus.SUCCESS : RecordStatus.FAIL;
    const error = "";

    await Extension.updateActivity(tx, status, error);
    sendNotification(`tx ${status}`, tx);
    sendUpdateActivityMessage();
  } catch (error) {
    console.error(error);
  }
};

const sendNotification = (title: string, message: string) => {
  chrome.notifications.create("id", {
    title,
    message,
    iconUrl: notificationIcon,
    type: "basic",
  });
};

const sendUpdateActivityMessage = () => {
  chrome.runtime.sendMessage({
    origin: "kuma",
    method: "update_activity",
  });
};

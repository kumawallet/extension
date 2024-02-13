import { PORT_EXTENSION } from "@src/constants/env";
import {
  MessageTypes,
  RequestTypes,
  ResponseTypes,
} from "@src/entries/background/handlers/request-types";
import { getWebAPI } from "@src/utils/env";
import { v4 as uuidv4 } from "uuid";

const getId = () => {
  return uuidv4();
};

interface Handler {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve: (data: any) => void;
  reject: (error: Error) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscriber?: (data: any) => void;
}

type Handlers = Record<string, Handler>;

const webAPI = getWebAPI();

const port = webAPI.runtime.connect({ name: PORT_EXTENSION });
const handlers: Handlers = {};

export const sendMessage = <TMessageType extends MessageTypes>(
  message: TMessageType,
  request: RequestTypes[TMessageType]
): Promise<ResponseTypes[TMessageType]> => {
  return new Promise((resolve, reject) => {
    const id = getId();

    handlers[id] = {
      resolve,
      reject,
    };

    const transportMessage = {
      id,
      message,
      origin,
      request,
    };

    port.postMessage(transportMessage);
  });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
port.onMessage.addListener((data: any): void => {
  const handler = handlers[data.id];

  if (!handler) {
    console.error(`Unknown response: ${JSON.stringify(data)}`);

    return;
  }

  // if (!handler.subscriber) {
  //   delete handlers[data.id];
  // }

  // if (data.subscription) {
  //   // eslint-disable-next-line @typescript-eslint/ban-types
  //   (handler.subscriber as Function)(data.subscription);
  // } else
  if (data.error) {
    handler.reject(new Error(data.error));
  } else {
    handler.resolve(data.response);
  }
});

port.onDisconnect.addListener((port) => {
  console.log("Disconnected from port", port);
});

import Extension from "./Extension";
import { Port, TransportRequestMessage } from "./types";
// import { PORT_EXTENSION } from "@src/constants/env";
import { assert } from "@polkadot/util";
import { MessageTypes } from "./request-types";

const extension = new Extension();

const kumaHandler = <TMessageType extends MessageTypes>(
  data: TransportRequestMessage<TMessageType>,
  port: Port
  // extensionPortName = PORT_EXTENSION
) => {
  const { id, message, request } = data;
  // const isExtension = port.name === extensionPortName;
  // const sender = port.sender as chrome.runtime.MessageSender;
  // const from = isExtension ? "extension" : sender?.tab?.url || "<unknown>";

  // handle the request and get a promise as a response
  // const promise = isExtension
  //   ? extension.handle(id, message, request, port)
  //   : tabs.handle(id, message, request, port, from);

  const promise = extension.handle(id, message, request, port);

  promise
    .then((response) => {
      assert(port, "Port has been disconnected");

      try {
        port.postMessage({ id, response });
      } catch (e) {
        if (
          e instanceof Error &&
          e.message === "Attempting to use a disconnected port object"
        ) {
          // this means that the user has done something like close the tab
          port.disconnect();
          return;
        }
        throw e;
      }

      // heap cleanup
      response = undefined;
    })
    .catch((error) => {
      if (
        error instanceof Error &&
        error.message === "Attempting to use a disconnected port object"
      ) {
        // this means that the user has done something like close the tab
        port.disconnect();
        return;
      }

      // only send message back to port if it's still connected, unfortunately this check is not reliable in all browsers
      if (port) {
        try {
          if (["pub(eth.request)", "pri(eth.request)"].includes(message))
            port.postMessage({
              id,
              error: error.message,
              code: error.code,
              data: error.data,
              isEthProviderRpcError: true,
            });
          else port.postMessage({ id, error: error.message });
        } catch (caughtError) {
          /**
           * no-op
           * caughtError will be `Attempt to postMessage on disconnected port`
           * The original errors themselves are mostly intentionally thrown as control flow for dapp connections, so logging them creates noise
           *  */
        }
      }
    })
    .finally(() => {
      // heap cleanup
      // @ts-expect-error -- *
      data.request = null;
    });
};

export default kumaHandler;

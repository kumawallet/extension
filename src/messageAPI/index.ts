import { PORT_EXTENSION } from "@src/constants/env";
import {
  MessageTypes,
  MessageTypesWithNoSubscriptions,
  MessageTypesWithNullRequest,
  MessageTypesWithSubscriptions,
  RequestTypes,
  ResponseTypes,
  SubscriptionMessageTypes,
} from "@src/entries/background/handlers/request-types";
import { Browser } from "@src/utils/constants";
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
let port : any | null
type Handlers = Record<string, Handler>;
function waitForBackground() {
  return new Promise((resolve) => {
    function ping() {
      chrome.runtime.sendMessage("ping", (response) => {
        console.log("se esta ejecutando el ping", response)
        if (chrome.runtime.lastError) {
          setTimeout(ping, 1000); 
        } else {
          
          if (response && response.status === "ready") {
            resolve(response); 
          } else {
            setTimeout(ping, 1000); 
          }
        }
      });
    }
    ping(); 
  });
}

waitForBackground()
  .then((response) => {
    console.log("El fondo está listo:", response);
    port = Browser.runtime.connect({ name: PORT_EXTENSION });

    port.onMessage.addListener((message) => {
      console.log("Mensaje del background:", message);
    });

    port.onDisconnect.addListener(() => {
      console.log("Conexión con el background perdida.");
    });
  })
  .catch((error) => {
    console.error("Error:", error);
  });
// const trySendMessage = async () => {
//   Browser.runtime.getBackgroundPage(() => {
//     console.log("AAAAAAAAAAAAAAAAAAAAAA")
//   })
//   return new Promise((resolve) => {
//     Browser.runtime.sendMessage({ message: "checkBackground" }, (response) => {
//       console.log("Se está ejecutando", response);
//       if (chrome.runtime.lastError || !response) {
//         setTimeout(() => resolve(trySendMessage()), 3000);
//       } else {
//         console.log("Background is ready, now connecting...");
//         port = Browser.runtime.connect({ name: PORT_EXTENSION });
//         resolve(response); // Resolvemos la promesa con la respuesta
//       }
//     });
//   });
// };

// const init = async () => {
//   const response = await trySendMessage();
//   console.log("Respuesta del background:", response);
//   // Aquí puedes continuar con la lógica, sabiendo que el port está montado
// };

// init();
    // Browser.runtime.getBackgroundPage(() => {
    //   console.log("Se esta ejecutando")
    // })
// const port = Browser.runtime.connect({ name: PORT_EXTENSION });
console.log("se conecto el puerto?", port)
const handlers: Handlers = {};

export function sendMessage<TMessageType extends MessageTypesWithNullRequest>(
  message: TMessageType
): Promise<ResponseTypes[TMessageType]>;
export function sendMessage<
  TMessageType extends MessageTypesWithNoSubscriptions
>(
  message: TMessageType,
  request: RequestTypes[TMessageType]
): Promise<ResponseTypes[TMessageType]>;
export function sendMessage<TMessageType extends MessageTypesWithSubscriptions>(
  message: TMessageType,
  request: RequestTypes[TMessageType],
  subscriber: (data: SubscriptionMessageTypes[TMessageType]) => void
): Promise<ResponseTypes[TMessageType]>;

export function sendMessage<TMessageType extends MessageTypes>(
  message: TMessageType,
  request?: RequestTypes[TMessageType],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscriber?: (data: unknown) => void
): Promise<ResponseTypes[TMessageType]> {
  console.log("aqui se ejecuta la funcion, del sendMessageapi")
  return new Promise((resolve, reject) => {
    const id = getId();

    handlers[id] = {
      resolve,
      reject,
      subscriber,
    };

    const transportMessage = {
      id,
      message,
      origin,
      request,
    };

    port && port.postMessage(transportMessage);
    console.log("aqui ya se envio el mensaje del send message api",port)
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any

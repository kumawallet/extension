import { cryptoWaitReady } from "@polkadot/util-crypto";
import { PORT_CONTENT, PORT_EXTENSION } from "@src/constants/env";
import PolkadotKeyring from "@polkadot/ui-keyring";
import kumaHandler from "./handlers/kumaHandler";
import { assert } from "@polkadot/util";
import { AccountsStore } from "@polkadot/extension-base/stores";
import { Browser } from "@src/utils/constants";

// listen to all messages and handle appropriately
console.log("Se esta ejecutando el background")
Browser.runtime.onConnect.addListener((_port): void => {
  // only listen to what we know about
  console.log("aqui se esta ejecutando el onConnect de background")
  assert(
    [PORT_CONTENT, PORT_EXTENSION].includes(_port.name),
    `Unknown connection from ${_port.name}`
  );
  let port: chrome.runtime.Port | undefined = _port;

  port.onDisconnect.addListener(() => {
    console.log("onDisconneted del background")
    port = undefined;
  });

  port.onMessage.addListener((data) => {
    if (port) kumaHandler(data, port);
  });
});
Browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("llego el ping")
  if (message === "ping") {
    // Responde cuando el fondo está listo
    sendResponse({ status: "ready" });
  }
  return true; // Esto es importante para que la respuesta sea manejada de forma asíncrona.
});
// Init polkadot
cryptoWaitReady()
  .then((): void => {
    PolkadotKeyring.loadAll({
      type: "sr25519",
      store: new AccountsStore(),
    });
  })
  .catch((error): void => {
    console.error("initialization failed", error);
  });

const keepBackgroundAlive = () => {
  console.log("Se esta ejecutando el metodo que que mantiene vivo el background")
  // Chrome suspends background pages after a few seconds of inactivity
  // To prevent this, we need to keep the background page alive every 2 seconds
  setInterval(() => {
    const timestamp = new Date().toISOString();
    Browser.storage.session.set({ timestamp });
  }, 2000);
};

const init = () => {
  
  console.log("Se esta ejecutando el manifest")
  const isManifestV3 = Browser.runtime.getManifest().manifest_version === 3;

  if (isManifestV3) keepBackgroundAlive();
};

init();

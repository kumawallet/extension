import { cryptoWaitReady } from "@polkadot/util-crypto";
import { PORT_CONTENT, PORT_EXTENSION } from "@src/constants/env";
import PolkadotKeyring from "@polkadot/ui-keyring";
import kumaHandler from "./handlers/kumaHandler";
import { assert } from "@polkadot/util";

const getWebAPI = (): typeof chrome => {
  return navigator.userAgent.match(/chrome|chromium|crios/i)
    ? chrome
    : window.browser;
};

const webAPI = getWebAPI();

// listen to all messages and handle appropriately
webAPI.runtime.onConnect.addListener((_port): void => {
  // only listen to what we know about
  assert(
    [PORT_CONTENT, PORT_EXTENSION].includes(_port.name),
    `Unknown connection from ${_port.name}`
  );
  let port: chrome.runtime.Port | undefined = _port;

  port.onDisconnect.addListener(() => {
    port = undefined;
  });

  port.onMessage.addListener((data) => {
    if (port) kumaHandler(data, port);
  });
});

// Init polkadot
cryptoWaitReady()
  .then((): void => {
    PolkadotKeyring.loadAll({
      type: "sr25519",
    });
    console.log("polkadot keyring loaded");
  })
  .catch((error): void => {
    console.error("initialization failed", error);
  });

const keepBackgroundAlive = () => {
  // Chrome suspends background pages after a few seconds of inactivity
  // To prevent this, we need to keep the background page alive every 2 seconds
  setInterval(() => {
    const timestamp = new Date().toISOString();
    webAPI.storage.session.set({ timestamp });
  }, 2000);
};

const init = () => {
  const isManifestV3 = webAPI.runtime.getManifest().manifest_version === 3;

  if (isManifestV3) keepBackgroundAlive();
};

init();

import { cryptoWaitReady } from "@polkadot/util-crypto";

cryptoWaitReady()
  .then((): void => {
    console.log("crypto initialized");

    console.log("initialization completed");
  })
  .catch((error): void => {
    console.error("initialization failed", error);
  });

console.log("background script loaded");

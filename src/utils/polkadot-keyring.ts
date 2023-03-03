import PolkadotKeyring from "@polkadot/ui-keyring";
import { cryptoWaitReady } from "@polkadot/util-crypto";

cryptoWaitReady()
  .then((): void => {
    PolkadotKeyring.loadAll({ ss58Format: 42, type: "sr25519" });
  })
  .catch((error): void => {
    console.error("initialization failed", error);
  });

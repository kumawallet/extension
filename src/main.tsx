import { AccountProvider } from "./providers";
import { AuthProvider } from "./providers/AuthProvider";
import { Routes } from "./routes";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import PolkadotKeyring from "@polkadot/ui-keyring";

cryptoWaitReady()
  .then((): void => {
    console.log("crypto initialized");
    PolkadotKeyring.loadAll({ ss58Format: 42, type: "sr25519" });
    console.log("initialization completed");
  })
  .catch((error): void => {
    console.error("initialization failed", error);
  });

console.log("background script loaded");

export const Main = () => {
  return (
    <AuthProvider>
      <AccountProvider>
        <Routes />
      </AccountProvider>
    </AuthProvider>
  );
};

import { AccountProvider, NetworkProvider } from "./providers";
import { AuthProvider } from "./providers/AuthProvider";
import { Routes } from "./routes";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import PolkadotKeyring from "@polkadot/ui-keyring";

cryptoWaitReady()
  .then((): void => {
    PolkadotKeyring.loadAll({ ss58Format: 42, type: "sr25519" });
    console.log("initialization completed");
  })
  .catch((error): void => {
    console.error("initialization failed", error);
  });

export const Main = () => {
  return (
    <AuthProvider>
      <NetworkProvider>
        <AccountProvider>
          <Routes />
        </AccountProvider>
      </NetworkProvider>
    </AuthProvider>
  );
};

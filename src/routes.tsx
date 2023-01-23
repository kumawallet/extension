import { AddAccount } from "./components/addAccount";
import { Balance } from "./components/balance";
import { Home } from "./components/home";
import { MemoryRouter, Route, Routes as RRoutes } from "react-router-dom";
import { CreateAccount } from "./components/createAccount";

import { cryptoWaitReady } from "@polkadot/util-crypto";
import keyring from "@polkadot/ui-keyring";
import { AccountStore } from "./stores/accounts";
import { FullScreenFAB } from "./components/common/FullScreenFAB";

cryptoWaitReady()
  .then((): void => {
    console.log("crypto initialized");

    // load all the keyring data
    keyring.loadAll({ store: new AccountStore(), type: "sr25519" });

    console.log("initialization completed");
  })
  .catch((error): void => {
    console.error("initialization failed", error);
  });

export const Routes = () => {
  return (
    <MemoryRouter>
      <RRoutes>
        <Route path="/" element={<CreateAccount />} />
        {/* <Route path="/" element={<Home />} /> */}
        <Route path="/add-account" element={<AddAccount />} />
        <Route path="/balance" element={<Balance />} />
      </RRoutes>
      <FullScreenFAB />
    </MemoryRouter>
  );
};

import { AddAccount } from "./components/addAccount";
import { Balance } from "./components/balance";
import { Home } from "./components/home";
import { MemoryRouter, Route, Routes as RRoutes } from "react-router-dom";
import { CreateAccount } from "./components/createAccount";

import { Accounts } from "./components/accounts";
import { ImportAccount } from "./components/importAccount/ImportAccount";
import { useEffect, useState } from "react";
import { useAuthContext } from "./providers/AuthProvider";
import { SignIn } from "./components/signIn";
import { DeriveAccount } from "./components/deriveAccount/DeriveAccount";
import { Decrypt } from "./components/decrypt";
import { DeriveImport } from "./components/deriveImport";
import {
  Advanced,
  BugReport,
  Contacts,
  General,
  Security,
} from "./components/settings";

export const Routes = () => {
  const {
    state: { extensionController, isInit },
  } = useAuthContext();

  const [homeRoute, setHomeRoute] = useState(<p>Loading...</p>);

  useEffect(() => {
    const getHomeRoute = async () => {
      const isFirstTime = !localStorage.getItem("welcome");
      if (isFirstTime) {
        setHomeRoute(<Home />);
        return;
      }
      const isVaultInitialized =
        await extensionController?.isVaultInitialized();
      if (!isVaultInitialized) {
        setHomeRoute(<AddAccount />);
        return;
      }
      const isUnlocked = await extensionController?.isUnlocked();
      if (!isUnlocked) {
        setHomeRoute(<SignIn />);
        return;
      }
      setHomeRoute(<Balance />);
    };
    getHomeRoute();
  }, [extensionController, isInit]);

  return (
    <MemoryRouter>
      <RRoutes>
        <Route path="/" element={homeRoute} />
        <Route path="/account" element={<Accounts />} />
        <Route path="/import-account" element={<ImportAccount />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/add-account" element={<AddAccount />} />
        <Route path="/balance" element={<Balance />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/derive-account" element={<DeriveAccount />} />
        <Route path="/derive-import" element={<DeriveImport />} />

        {/* setting views */}
        <Route path="/settings-general" element={<General />} />
        <Route path="/settings-advanced" element={<Advanced />} />
        <Route path="/settings-contacts" element={<Contacts />} />
        <Route path="/settings-security" element={<Security />} />
        <Route path="/settings-bug" element={<BugReport />} />

        {/* TODO: remove, only for developmet */}
        <Route path="/decrypt" element={<Decrypt />} />
      </RRoutes>
    </MemoryRouter>
  );
};

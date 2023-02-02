import { AddAccount } from "./components/addAccount";
import { Balance } from "./components/balance";
import { Home } from "./components/home";
import { MemoryRouter, Route, Routes as RRoutes } from "react-router-dom";
import { Accounts } from "./components/accounts";
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
import Extension from "./utils/Extension";
import { AddAccountForm } from "./components/addAccountForm/AddAccountForm";

export const Routes = () => {
  const {
    state: { isInit },
    createAccount,
    importAccount,
  } = useAuthContext();

  const [homeRoute, setHomeRoute] = useState(<p>Loading...</p>);

  useEffect(() => {
    const getHomeRoute = async () => {
      const isFirstTime = !localStorage.getItem("welcome");
      if (isFirstTime) {
        setHomeRoute(<Home />);
        return;
      }
      const isVaultInitialized = await Extension.isVaultInitialized();
      if (!isVaultInitialized) {
        setHomeRoute(<AddAccount />);
        return;
      }
      const isUnlocked = await Extension.isUnlocked();
      if (!isUnlocked) {
        setHomeRoute(<SignIn />);
        return;
      }
      setHomeRoute(<Balance />);
    };
    getHomeRoute();
  }, [Extension, isInit]);

  return (
    <MemoryRouter>
      <RRoutes>
        <Route path="/" element={homeRoute} />
        <Route path="/account" element={<Accounts />} />
        <Route
          path="/import-account"
          element={
            <AddAccountForm
              title="Import Account"
              onSubmitFn={importAccount}
              buttonText="Import"
              fields={{
                password: true,
                privateKeyOrSeed: true,
                accountType: true,
              }}
              afterSubmitMessage="Account imported"
              goAfterSubmit="/balance"
              backButton
            />
          }
        />
        <Route
          path="/create-account"
          element={
            <AddAccountForm
              title="Create Account"
              onSubmitFn={createAccount}
              buttonText="Create"
              fields={{ password: true }}
              afterSubmitMessage="Account created"
              goAfterSubmit="/balance"
              backButton
              generateSeed
            />
          }
        />
        <Route path="/add-account" element={<AddAccount />} />
        <Route path="/balance" element={<Balance />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/derive-account" element={<DeriveAccount />} />

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

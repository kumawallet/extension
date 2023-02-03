import { useEffect, useState } from "react";
import { MemoryRouter, Route, Routes as RRoutes } from "react-router-dom";
import { AddAccount } from "./components/addAccount";
import { Balance } from "./components/balance";
import { Home } from "./components/home";
import { Accounts } from "./components/accounts";
import { useAuthContext } from "./providers/AuthProvider";
import { SignIn } from "./components/signIn";
import { Decrypt } from "./components/decrypt";
import {
  Advanced,
  BugReport,
  Contacts,
  General,
  Security,
} from "./components/settings";
import Extension from "./utils/Extension";
import { AccountForm } from "./components/accountForm/AccountForm";
import { DERIVE_ACCOUNT, IMPORT_ACCOUNT } from "./routes/paths";
import {
  ADD_ACCOUNT,
  BALANCE,
  SETTINGS_GENERAL,
  SETTINGS_ADVANCED,
  SETTINGS_CONTACTS,
  SETTINGS_SECURITY,
  SETTINGS_BUG,
  CREATE_ACCOUNT,
} from "./routes/paths";

export const Routes = () => {
  const {
    state: { isInit },
    createAccount,
    importAccount,
    deriveAccount,
  } = useAuthContext();

  const [homeRoute, setHomeRoute] = useState(<p>Loading...</p>);
  const [canDerive, setCanDerive] = useState(false);
  const [importIsSignUp, setImportIsSignUp] = useState(true);

  const getWalletStatus = async () => {
    setCanDerive(await Extension.areKeyringsInitialized());
    setImportIsSignUp(!(await Extension.isVaultInitialized()));
  };
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
    getWalletStatus();
  }, [Extension, isInit]);

  return (
    <MemoryRouter>
      <RRoutes>
        <Route path="/" element={homeRoute} />
        <Route path="/account" element={<Accounts />} />
        <Route path={ADD_ACCOUNT} element={<AddAccount />} />
        <Route path={BALANCE} element={<Balance />} />
        {/* <Route path="/sign-in" element={<SignIn />} /> */}
        <Route
          path={IMPORT_ACCOUNT}
          element={
            <AccountForm
              title="Import Account"
              onSubmitFn={importAccount}
              buttonText="Import"
              signUp={importIsSignUp}
              fields={{
                privateKeyOrSeed: true,
                accountType: true,
              }}
              afterSubmitMessage="Account imported"
              goAfterSubmit={BALANCE}
              backButton
              callback={getWalletStatus}
            />
          }
        />
        <Route
          path={CREATE_ACCOUNT}
          element={
            <AccountForm
              title="Create Account"
              onSubmitFn={createAccount}
              buttonText="Create"
              signUp={true}
              fields={{}}
              afterSubmitMessage="Account created"
              goAfterSubmit={BALANCE}
              backButton
              generateSeed
              callback={getWalletStatus}
            />
          }
        />
        <Route
          path={DERIVE_ACCOUNT}
          element={
            !canDerive ? (
              <AccountForm
                title="Create Account"
                onSubmitFn={createAccount}
                buttonText="Create"
                fields={{}}
                signUp={false}
                afterSubmitMessage="Account created"
                goAfterSubmit={BALANCE}
                backButton
                generateSeed
                callback={getWalletStatus}
              />
            ) : (
              <AccountForm
                title="Create Account"
                onSubmitFn={deriveAccount}
                signUp={false}
                buttonText="Create"
                fields={{ accountType: true }}
                afterSubmitMessage="Account created"
                goAfterSubmit={BALANCE}
                backButton
              />
            )
          }
        />

        {/* setting views */}
        <Route path={SETTINGS_GENERAL} element={<General />} />
        <Route path={SETTINGS_ADVANCED} element={<Advanced />} />
        <Route path={SETTINGS_CONTACTS} element={<Contacts />} />
        <Route path={SETTINGS_SECURITY} element={<Security />} />
        <Route path={SETTINGS_BUG} element={<BugReport />} />

        {/* TODO: remove, only for developmet */}
        <Route path="/decrypt" element={<Decrypt />} />
      </RRoutes>
    </MemoryRouter>
  );
};

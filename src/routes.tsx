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
import Extension from "./Extension";
import { AccountForm } from "./components/accountForm/AccountForm";
import {
  DERIVE_ACCOUNT,
  IMPORT_ACCOUNT,
  RESTORE_PASSWORD,
  SIGNIN,
} from "./routes/paths";
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
import { useTranslation } from "react-i18next";
import { useNetworkContext } from "./providers/NetworkProvider";
import { useAccountContext } from "./providers/AccountProvider";

export const Routes = () => {
  const { t } = useTranslation("account_form");

  const {
    state: { isInit },
    createAccount,
    importAccount,
    deriveAccount,
    restorePassword,
  } = useAuthContext();

  const {
    state: { init },
  } = useNetworkContext();

  const { getAllAccounts, setSelectedAccount } = useAccountContext();

  const [homeRoute, setHomeRoute] = useState(<p>{t("common.loading")}</p>);
  const [canDerive, setCanDerive] = useState(false);
  const [importIsSignUp, setImportIsSignUp] = useState(true);

  const getWalletStatus = async () => {
    setCanDerive(await Extension.areAccountsInitialized());
    setImportIsSignUp(!(await Extension.alreadySignedUp()));
  };

  useEffect(() => {
    const getHomeRoute = async () => {
      if (!isInit || !init) {
        return;
      }

      const isFirstTime = !localStorage.getItem("welcome");
      if (isFirstTime) {
        setHomeRoute(<Home />);
        return;
      }
      const alreadySignedUp = await Extension.alreadySignedUp();
      if (!alreadySignedUp) {
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
  }, [Extension, isInit, init]);

  // TODO: move this function to another place
  const onDeriveAccount = async (account: any) => {
    await deriveAccount(account);
    const accounts = await getAllAccounts();

    const findCreatedAccount = accounts.findIndex(
      (acc) => acc?.value?.name === account.name
    );

    await setSelectedAccount(accounts[findCreatedAccount]);
    return true;
  };

  const onImportAccount = async (account: any) => {
    await importAccount(account);

    if (!importIsSignUp) {
      const accounts = await getAllAccounts();

      const findCreatedAccount = accounts.findIndex(
        (acc) => acc?.value?.name === account.name
      );

      await setSelectedAccount(accounts[findCreatedAccount]);
    }
    return true;
  };

  const onCreateAccount = async (account: any) => {
    await createAccount(account);

    const accounts = await getAllAccounts();

    const findCreatedAccount = accounts.findIndex(
      (acc) => acc?.value?.name === account.name
    );

    await setSelectedAccount(accounts[findCreatedAccount]);

    return true;
  };

  return (
    <MemoryRouter>
      <RRoutes>
        <Route path="/" element={homeRoute} />
        <Route path="/account" element={<Accounts />} />
        <Route path={ADD_ACCOUNT} element={<AddAccount />} />
        <Route path={BALANCE} element={<Balance />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route
          path={IMPORT_ACCOUNT}
          element={
            <AccountForm
              title={t("import.title")}
              onSubmitFn={onImportAccount}
              buttonText={t("import.button_text")}
              signUp={importIsSignUp}
              fields={{
                privateKeyOrSeed: true,
                accountType: true,
              }}
              afterSubmitMessage={t("import.submit_message")}
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
              title={t("create_or_derivate.title")}
              onSubmitFn={createAccount}
              buttonText={t("create_or_derivate.button_text")}
              signUp={true}
              fields={{}}
              afterSubmitMessage={t("create_or_derivate.submit_message")}
              goAfterSubmit={BALANCE}
              backButton
              generateSeed
              callback={getWalletStatus}
            />
          }
        />
        <Route
          path={RESTORE_PASSWORD}
          element={
            <AccountForm
              title={t("restore.title")}
              onSubmitFn={restorePassword}
              buttonText={t("restore.button_text")}
              resetPassword={true}
              signUp={false}
              fields={{
                privateKeyOrSeed: true,
              }}
              afterSubmitMessage={t("restore.submit_message")}
              goAfterSubmit={SIGNIN}
              backButton
              callback={getWalletStatus}
            />
          }
        />
        <Route
          path={DERIVE_ACCOUNT}
          element={
            <AccountForm
              title={t("create_or_derivate.title")}
              onSubmitFn={!canDerive ? onCreateAccount : onDeriveAccount}
              signUp={false}
              buttonText={t("create_or_derivate.button_text")}
              fields={!canDerive ? {} : { accountType: true }}
              afterSubmitMessage={t("create_or_derivate.submit_message")}
              goAfterSubmit={BALANCE}
              backButton
              generateSeed={!canDerive}
              callback={!canDerive ? getWalletStatus : () => null}
            />
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

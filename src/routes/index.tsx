import { useEffect, useState } from "react";
import { MemoryRouter, Route, Routes as RRoutes } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  AccountForm,
  AddAccount,
  Balance,
  ManageAssets,
  Send,
  Receive,
  SignIn,
  SignMessage,
  Welcome,
  CallContract,
} from "@src/pages";
import {
  Advanced,
  BugReport,
  Contacts,
  General,
  ManageNetworks,
  Security,
} from "@src/pages/settings";
import Extension from "@src/Extension";
import {
  useAccountContext,
  useAuthContext,
  useNetworkContext,
} from "@src/providers";
import {
  ADD_ACCOUNT,
  BALANCE,
  CALL_CONTRACT,
  CREATE_ACCOUNT,
  DERIVE_ACCOUNT,
  IMPORT_ACCOUNT,
  MANAGE_ASSETS,
  RECEIVE,
  RESTORE_PASSWORD,
  SEND,
  SETTINGS_ADVANCED,
  SETTINGS_BUG,
  SETTINGS_CONTACTS,
  SETTINGS_GENERAL,
  SETTINGS_MANAGE_NETWORKS,
  SETTINGS_SECURITY,
  SIGNIN,
  SIGN_MESSAGE,
} from "./paths";

// import { Decrypt } from "@src/components/decrypt";
import { Loading } from "@src/components/common/Loading";
// import { isProduction } from "@src/utils/env";
import { ValidationWrapper } from "@src/components/wrapper/ValidationWrapper";

const getInitialEntry = (query: string) => {
  if (query.includes("sign_message")) {
    return SIGN_MESSAGE;
  }

  if (query.includes("call_contract")) {
    return CALL_CONTRACT;
  }

  return "";
};

export const Routes = () => {
  const { t } = useTranslation("account_form");
  const {
    state: { isInit },
    restorePassword,
  } = useAuthContext();

  const {
    state: { init },
  } = useNetworkContext();

  const { deriveAccount, createAccount, importAccount } = useAccountContext();

  const [homeRoute, setHomeRoute] = useState(<Loading />);
  const [canDerive, setCanDerive] = useState(false);
  const [importIsSignUp, setImportIsSignUp] = useState(true);

  const getWalletStatus = async () => {
    const [candDerive, alreadySignedUp] = await Promise.all([
      Extension.areAccountsInitialized(),
      Extension.alreadySignedUp(),
    ]);
    setCanDerive(candDerive);
    setImportIsSignUp(!alreadySignedUp);
  };

  useEffect(() => {
    getHomeRoute();
    getWalletStatus();
  }, [Extension, isInit, init]);

  const getHomeRoute = async () => {
    if (!isInit || !init) {
      return;
    }

    const isFirstTime = !localStorage.getItem("welcome");
    if (isFirstTime) {
      setHomeRoute(<Welcome />);
      return;
    }
    const alreadySignedUp = await Extension.alreadySignedUp();
    if (!alreadySignedUp) {
      setHomeRoute(<AddAccount />);
      return;
    }
    const isSessionActive = await Extension.isSessionActive();

    if (!isSessionActive) {
      setHomeRoute(<SignIn />);
      return;
    }
    setHomeRoute(<Balance />);
  };

  if (location.search) {
    return (
      <MemoryRouter initialEntries={[getInitialEntry(location.search)]}>
        <RRoutes>
          {location.search.includes("sign_message") && (
            <Route
              path={SIGN_MESSAGE}
              element={
                <ValidationWrapper query={location.search}>
                  <SignMessage />
                </ValidationWrapper>
              }
            />
          )}
          {location.search.includes("call_contract") && (
            <Route
              path={CALL_CONTRACT}
              element={
                <ValidationWrapper query={location.search}>
                  <CallContract />
                </ValidationWrapper>
              }
            />
          )}
        </RRoutes>
      </MemoryRouter>
    );
  }

  return (
    <MemoryRouter>
      <RRoutes>
        <Route path="/" element={homeRoute} />
        <Route path={ADD_ACCOUNT} element={<AddAccount />} />
        <Route path={BALANCE} element={<Balance />} />
        <Route path={SIGNIN} element={<SignIn />} />
        <Route path={SEND} element={<Send />} />
        <Route path={RECEIVE} element={<Receive />} />
        <Route path={MANAGE_ASSETS} element={<ManageAssets />} />

        <Route
          path={IMPORT_ACCOUNT}
          element={
            <AccountForm
              title={t("import.title")}
              onSubmitFn={importAccount}
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
              onSubmitFn={!canDerive ? createAccount : deriveAccount}
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
        <Route path={SETTINGS_MANAGE_NETWORKS} element={<ManageNetworks />} />
        <Route path={SETTINGS_CONTACTS} element={<Contacts />} />
        <Route path={SETTINGS_SECURITY} element={<Security />} />
        <Route path={SETTINGS_BUG} element={<BugReport />} />

        {/* {!isProduction && <Route path="/decrypt" element={<Decrypt />} />} */}
      </RRoutes>
    </MemoryRouter>
  );
};

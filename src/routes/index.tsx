import { useEffect, useState } from "react";
import { MemoryRouter, Route, Routes as RRoutes } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  AccountForm,
  Balance,
  ManageAssets,
  Send,
  Receive,
  SignIn,
  SignMessage,
  Welcome,
  CallContract,
  Swap,
} from "@src/pages";
import {
  Advanced,
  BugReport,
  Contacts,
  General,
  ManageNetworks,
  Security,
  AboutUs,
} from "@src/pages/settings";
import {
  useAccountContext,

  useNetworkContext,
} from "@src/providers";
import {

  BALANCE,
  CALL_CONTRACT,
  CREATE_ACCOUNT,
  DERIVE_ACCOUNT,
  IMPORT_ACCOUNT,
  MANAGE_ASSETS,
  RECEIVE,
  RESTORE_PASSWORD,
  SEND,
  SETTINGS_ABOUT_US,
  SETTINGS_ADVANCED,
  SETTINGS_BUG,
  SETTINGS_CONTACTS,
  SETTINGS_GENERAL,
  SETTINGS_MANAGE_NETWORKS,
  SETTINGS_SECURITY,
  SIGNIN,
  SIGN_MESSAGE,
  SWAP,
  WELCOME,
} from "./paths";

import { Loading } from "@src/components/common/Loading";
import { ValidationWrapper } from "@src/components/wrapper/ValidationWrapper";
import { messageAPI } from "@src/messageAPI/api";

const getInitialEntry = (query: string) => {
  if (query.includes("sign_message")) {
    return SIGN_MESSAGE;
  }

  if (query.includes("call_contract")) {
    return CALL_CONTRACT;
  }

  if (query.includes("route")) {
    const route = query.split("route=")[1];
    return route;
  }

  return "/";
};

export const Routes = () => {
  const { t } = useTranslation("account_form");


  const {
    state: { init },
  } = useNetworkContext();

  const { deriveAccount, createAccount, importAccount, restorePassword } = useAccountContext();

  const [homeRoute, setHomeRoute] = useState(<Loading />);
  const [canDerive, setCanDerive] = useState(false);
  const [importIsSignUp, setImportIsSignUp] = useState(true);

  const getWalletStatus = async () => {
    const [candDerive, alreadySignedUp] = await Promise.all([
      messageAPI.areAccountsInitialized(),
      messageAPI.alreadySignedUp(),
    ]);
    setCanDerive(candDerive);
    setImportIsSignUp(!alreadySignedUp);
  };

  useEffect(() => {
    getHomeRoute();
    getWalletStatus();
  }, [init]);

  const getHomeRoute = async () => {
    if (!init) return

    try {
      const alreadySignedUp = await messageAPI.alreadySignedUp();
      if (!alreadySignedUp) {
        setHomeRoute(<Welcome />);
        return;
      }

      const isSessionActive = await messageAPI.isSessionActive();
      if (!isSessionActive) {
        setHomeRoute(<SignIn />);
        return;
      }
      setHomeRoute(<Balance />);
    } catch (error) {
      console.log('error', error)
    }
  };

  if (location.search.includes("origin=kuma")) {
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
    <MemoryRouter initialEntries={[getInitialEntry(location.search)]}>
      <RRoutes>
        <Route path={WELCOME} element={homeRoute} />
        <Route path={BALANCE} element={<Balance />} />
        <Route path={SIGNIN} element={<SignIn />} />
        <Route path={SEND} element={<Send />} />
        <Route path={RECEIVE} element={<Receive />} />
        <Route path={MANAGE_ASSETS} element={<ManageAssets />} />
        <Route path={SWAP} element={<Swap />} />

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
        <Route path={SETTINGS_ABOUT_US} element={<AboutUs />} />

        {/* {!isProduction && <Route path="/decrypt" element={<Decrypt />} />} */}
      </RRoutes>
    </MemoryRouter>
  );
};

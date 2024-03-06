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
  CreateWallet,
  ImportWallet,
} from "@src/pages";
import {
  Advanced,
  BugReport,
  AddressBook,
  General,
  ManageNetworks,
  Security,
  Settings
} from "@src/pages/settings";
import { useAccountContext } from "@src/providers";
import {
  BALANCE,
  CALL_CONTRACT,
  CREATE_ACCOUNT,
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
  SETTINGS,
  SIGNIN,
  SIGN_MESSAGE,
  SWAP,
  WELCOME,
} from "./paths";

import { Loading } from "@src/components/common/Loading";
import { ValidationWrapper } from "@src/components/wrapper/ValidationWrapper";
import { messageAPI } from "@src/messageAPI/api";
import { useLoading } from "@src/hooks";
import { getWebAPI } from "@src/utils/env";

const webAPI = getWebAPI();

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

  const { restorePassword } = useAccountContext();

  const [homeRoute, setHomeRoute] = useState(<Loading />);

  const [isInit, setIsInit] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);

  const { isLoading, endLoading } = useLoading(true);

  useEffect(() => {
    (async () => {
      const alreadySignedUp = await messageAPI.alreadySignedUp();

      if (!alreadySignedUp) {
        const tab = await webAPI.tabs.getCurrent();

        if (!tab) {
          const url = webAPI.runtime.getURL(`src/entries/newtab/index.html`);
          webAPI.tabs.create({ url });
          return;
        }
      }

      setIsInit(true);
      setIsSignedUp(alreadySignedUp);
    })();
  }, []);

  useEffect(() => {
    if (isInit) {
      getHomeRoute();
    }
    // getWalletStatus();
  }, [isInit]);

  const getHomeRoute = async () => {
    try {
      if (!isSignedUp) {
        setHomeRoute(<Welcome />);
        endLoading();
        return;
      }

      const isSessionActive = await messageAPI.isSessionActive();
      const isAuthorized = await messageAPI.isAuthorized();

      if (!isSessionActive || !isAuthorized) {
        setHomeRoute(<SignIn />);
        endLoading();
        return;
      }
      setHomeRoute(<Balance />);
      endLoading();
    } catch (error) {
      console.log("error", error);
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

  if (isLoading) {
    return <Loading />;
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

        <Route path={IMPORT_ACCOUNT} element={<ImportWallet />} />
        <Route path={CREATE_ACCOUNT} element={<CreateWallet />} />
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
              callback={() => null}
            />
          }
        />

        {/* setting views */}
        <Route path={SETTINGS} element={<Settings />} />
        <Route path={SETTINGS_GENERAL} element={<General />} />
        <Route path={SETTINGS_ADVANCED} element={<Advanced />} />
        <Route path={SETTINGS_MANAGE_NETWORKS} element={<ManageNetworks />} />
        <Route path={SETTINGS_CONTACTS} element={<AddressBook />} />
        <Route path={SETTINGS_SECURITY} element={<Security />} />
        <Route path={SETTINGS_BUG} element={<BugReport />} />

        {/* {!isProduction && <Route path="/decrypt" element={<Decrypt />} />} */}
      </RRoutes>
    </MemoryRouter>
  );
};

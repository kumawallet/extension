import { useEffect, useState } from "react";
import { MemoryRouter, Route, Routes as RRoutes } from "react-router-dom";
import {
  Balance,
  ActivityDetail,
  ManageAssets,
  Send,
  Receive,
  SignIn,
  ForgotPass,
  Welcome,
  Swap,
  CreateWallet,
  ImportWallet,
  ChangePassword,
  Buy,
  ShowCollection,
  NFTDetail,
  SendNFT,
  ConfirmTxNFT,
  ShowGroupCollection
} from "@src/pages";
import {
  BugReport,
  AddressBook,
  General,
  ManageNetworks,
  Security,
  Settings,
} from "@src/pages/settings";
import { AutoLock } from "@src/pages/settings/components/Security/AutoLock";
import {
  BALANCE,
  ACTIVITY_DETAIL,
  CALL_CONTRACT,
  CREATE_ACCOUNT,
  IMPORT_ACCOUNT,
  MANAGE_ASSETS,
  BALANCE_ACCOUNTS,
  RECEIVE,
  SEND,
  SETTINGS_BUG,
  SETTINGS_CONTACTS,
  SETTINGS_GENERAL,
  SETTINGS_MANAGE_NETWORKS,
  SETTINGS_SECURITY,
  SETTINGS,
  SIGNIN,
  FORGOT_PASS,
  SIGN_MESSAGE,
  SWAP,
  WELCOME,
  CHANGE_PASSWORD,
  SETTINGS_AUTOLOCK,
  BUY,
  SHOW_COLLECTION,
  NFT_DETAILS,
  SEND_NFT,
  CONFIRM_TX_NFT,
  SHOW_GROUP_COLLECTION
} from "./paths";

import { Loading } from "@src/components/common/Loading";
import { messageAPI } from "@src/messageAPI/api";
import { useLoading } from "@src/hooks";
import { BalanceAccounts } from "@src/pages/balance/components/BalanceAccounts"
import { Browser } from "@src/utils/constants";


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
  const [homeRoute, setHomeRoute] = useState(<Loading />);

  const [isInit, setIsInit] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const { isLoading, endLoading } = useLoading(true);

  useEffect(() => {
    (async () => {
      const alreadySignedUp = await messageAPI.alreadySignedUp();

      if (!alreadySignedUp) {
        const tab = await Browser.tabs.getCurrent();

        if (!tab) {
          const url = Browser.runtime.getURL(`src/entries/newtab/index.html`);
          Browser.tabs.create({ url });
          window.close();
          return;
        }
      }

      setIsInit(true);
      setIsSignedUp(alreadySignedUp);
    })();
    getHomeRoute();
  }, []);

  useEffect(() => {
    if (isInit) {
      getHomeRoute();
    }
  }, [isInit]);

  const getHomeRoute = async () => {
    try {
      if (!isSignedUp) {
        setHomeRoute(<Welcome />);
        setTimeout(() => {
          endLoading();
        }, 100);
        return;
      }

      const isSessionActive = await messageAPI.isSessionActive();
      const isAuthorized = await messageAPI.isAuthorized();
      if (!isSessionActive || !isAuthorized) {
        setHomeRoute(<SignIn />);
        setTimeout(() => {
          endLoading();
        }, 100);
        return;
      }
      setHomeRoute(<Balance />);
      setTimeout(() => {
        endLoading();
      }, 100);
    } catch (error) {
      console.log("error", error);
    }
  };

  setInterval(async () => {
    await messageAPI.unlock(); // Timeout update(AutoLock)
  }, 30000);


  if (isLoading) {
    return (
      <Loading
        containerClass="h-screen flex justify-center items-center"
        iconClass="mr-0"
      />
    );
  }

  return (
    <MemoryRouter initialEntries={[getInitialEntry(location.search)]}>
      <RRoutes>
        <Route path={WELCOME} element={homeRoute} />
        <Route path={BALANCE} element={<Balance />} />
        <Route path={ACTIVITY_DETAIL} element={<ActivityDetail />} />
        <Route path={SHOW_COLLECTION} element={<ShowCollection />} />
        <Route path={SHOW_GROUP_COLLECTION} element={<ShowGroupCollection />} />
        <Route path={NFT_DETAILS} element={<NFTDetail />} />
        <Route path={SEND_NFT} element={<SendNFT />} />
        <Route path={CONFIRM_TX_NFT} element={<ConfirmTxNFT />} />
        <Route path={SIGNIN} element={<SignIn />} />
        <Route path={FORGOT_PASS} element={<ForgotPass />} />
        <Route path={SEND} element={<Send />} />
        <Route path={RECEIVE} element={<Receive />} />
        <Route path={MANAGE_ASSETS} element={<ManageAssets />} />
        <Route path={SWAP} element={<Swap />} />
        <Route path={BUY} element={<Buy />} />
        <Route path={IMPORT_ACCOUNT} element={<ImportWallet />} />
        <Route path={CREATE_ACCOUNT} element={<CreateWallet />} />
        <Route path={CHANGE_PASSWORD} element={<ChangePassword />} />
        <Route path={BALANCE_ACCOUNTS} element={<BalanceAccounts />} />

        {/* setting views */}
        <Route path={SETTINGS} element={<Settings />} />
        <Route path={SETTINGS_GENERAL} element={<General />} />
        <Route path={SETTINGS_MANAGE_NETWORKS} element={<ManageNetworks />} />
        <Route path={SETTINGS_CONTACTS} element={<AddressBook />} />
        <Route path={SETTINGS_SECURITY} element={<Security />} />
        <Route path={SETTINGS_AUTOLOCK} element={<AutoLock />} />
        <Route path={SETTINGS_BUG} element={<BugReport />} />

        {/* {!isProduction && <Route path="/decrypt" element={<Decrypt />} />} */}
      </RRoutes>
    </MemoryRouter>
  );
};

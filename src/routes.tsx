import { AddAccount } from "./components/addAccount";
import { Balance } from "./components/balance";
import { Home } from "./components/home";
import { MemoryRouter, Route, Routes as RRoutes } from "react-router-dom";
import { CreateAccount } from "./components/createAccount";

import { FullScreenFAB } from "./components/common/FullScreenFAB";
import { Accounts } from "./components/accounts";
import { ImportAccount } from "./components/importAccount/ImportAccount";
// import { useAccountContext } from "./providers/AccountProvider";
import { useMemo } from "react";
import { useAuthContext } from "./providers/AuthProvider";
import { Unlock } from "./components/unlock";

export const Routes = () => {
  // const {
  //   state: { accounts, isLoadingAccounts },
  // } = useAccountContext();

  const {
    state: { authController, extensionController, isInit },
  } = useAuthContext();

  const homeRoute = useMemo(() => {
    const isFirstTime = !localStorage.getItem("welcome");

    if (isFirstTime) {
      return <Home />;
    }

    if (authController?.vault && !authController.isUnlocked) {
      return <Unlock />;
    }

    if (authController?.vault && authController?.isUnlocked) {
      return <Balance />;
    }

    return <AddAccount />;
  }, [authController, extensionController, isInit]);

  if (isInit) return <p>loading...</p>;

  console.log(authController);

  return (
    <MemoryRouter>
      <RRoutes>
        <Route path="/" element={homeRoute} />
        <Route path="/account" element={<Accounts />} />
        <Route path="/import-account" element={<ImportAccount />} />
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/add-account" element={<AddAccount />} />
        <Route path="/balance" element={<Balance />} />
        <Route path="/unlock" element={<Unlock />} />
      </RRoutes>
      <FullScreenFAB />
    </MemoryRouter>
  );
};

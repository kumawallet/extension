import { AddAccount } from "./components/addAccount";
import { Balance } from "./components/balance";
import { Home } from "./components/home";
import { MemoryRouter, Route, Routes as RRoutes } from "react-router-dom";
import { CreateAccount } from "./components/createAccount";

import { FullScreenFAB } from "./components/common/FullScreenFAB";
import { Accounts } from "./components/accounts";
import { ImportAccount } from "./components/importAccount/ImportAccount";
import { useEffect, useState } from "react";
import { useAuthContext } from "./providers/AuthProvider";
import { SignIn } from "./components/signIn";

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
      </RRoutes>
      <FullScreenFAB />
    </MemoryRouter>
  );
};

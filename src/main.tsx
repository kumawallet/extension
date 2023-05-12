import {
  AssetProvider,
  AccountProvider,
  AuthProvider,
  NetworkProvider,
  TxProvider,
} from "./providers";
import { Routes } from "./routes";
import { ToastContainer } from "react-toastify";
import "./utils/i18n";
import "./utils/polkadot-keyring";
import "react-toastify/dist/ReactToastify.min.css";

export const Main = () => {
  return (
    <AuthProvider>
      <NetworkProvider>
        <AccountProvider>
          <AssetProvider>
            <TxProvider>
              <Routes />
            </TxProvider>
          </AssetProvider>
          <ToastContainer theme="dark" />
        </AccountProvider>
      </NetworkProvider>
    </AuthProvider>
  );
};

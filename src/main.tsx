import { AccountProvider, AuthProvider, NetworkProvider } from "./providers";
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
          <Routes />
          <ToastContainer theme="dark" />
        </AccountProvider>
      </NetworkProvider>
    </AuthProvider>
  );
};

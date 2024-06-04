import '@fontsource-variable/inter';
import '@fontsource-variable/quicksand';
import '@fontsource/poppins';
import {
  AssetProvider,
  AccountProvider,
  NetworkProvider,

} from "./providers";
import { Routes } from "./routes";
import { ToastContainer } from "react-toastify";
import "./utils/i18n";
import "react-toastify/dist/ReactToastify.min.css";
import * as Sentry from "@sentry/react";
import { Error } from "./components/common";
import { isProduction, version } from "./utils/env";

Sentry.init({
  release: isProduction ? version : undefined,
  dsn: import.meta.env.VITE_SENTRY_DSN,
});

export const Main = () => {
  return (
    <Sentry.ErrorBoundary fallback={<Error />}>
      <NetworkProvider>
        <AccountProvider>
          <AssetProvider>
            <Routes />
          </AssetProvider>
          <ToastContainer theme="dark" />
        </AccountProvider>
      </NetworkProvider>
    </Sentry.ErrorBoundary>
  );
};

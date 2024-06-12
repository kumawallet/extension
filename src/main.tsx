import '@fontsource-variable/inter';
import '@fontsource-variable/quicksand';
import '@fontsource/poppins';
import {
  AssetProvider,
  AccountProvider,
  NetworkProvider,
} from "./providers";
import { BuyProvider } from "./providers/buyProvider/BuyProvider"
import { Routes } from "./routes";
import { ToastContainer } from "react-toastify";
import { I18nextProvider } from 'react-i18next';
import i18n from"./utils/i18n";
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
      <I18nextProvider i18n={i18n}>
        <NetworkProvider>
          <AccountProvider>
            <AssetProvider>
              <BuyProvider>
                <Routes />
              </BuyProvider>
            </AssetProvider>
            <ToastContainer theme="dark" />
          </AccountProvider>
        </NetworkProvider>
      </I18nextProvider>
    </Sentry.ErrorBoundary>
  );
};

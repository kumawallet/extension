import '@fontsource-variable/inter';
import '@fontsource-variable/quicksand';
import '@fontsource/poppins';
import {
  AssetProvider,
  AccountProvider,
  NetworkProvider,
  TxProvider,
  ThemeProvider,
} from "./providers";
import { Routes } from "./routes";
import { ToastContainer } from "react-toastify";
import "./utils/i18n";
import "react-toastify/dist/ReactToastify.min.css";
import * as Sentry from "@sentry/react";
import { Error } from "./components/common";
import { useEffect } from "react";
import { sendMessage } from "./messageAPI";
import { isProduction, version } from "./utils/env";

Sentry.init({
  release: isProduction ? version : undefined,
  dsn: import.meta.env.VITE_SENTRY_DSN,
});

export const Main = () => {

  useEffect(() => {
    // ping to keep connection alive with background service worker
    // https://github.com/GoogleChrome/developer.chrome.com/issues/504
    const intervalId = setInterval(async () => {
      try {
        await sendMessage('pri(ping)', null)
      } catch (error) {
        console.log('failed to ping')
      }
    }, 1000);
    return () => clearInterval(intervalId)
  }, [])

  return (
    <Sentry.ErrorBoundary fallback={<Error />}>
      <NetworkProvider>
        <ThemeProvider>
          <AccountProvider>
            <AssetProvider>
              <TxProvider>
                <Routes />
              </TxProvider>
            </AssetProvider>
            <ToastContainer theme="dark" />
          </AccountProvider>
        </ThemeProvider>
      </NetworkProvider>
    </Sentry.ErrorBoundary>
  );
};

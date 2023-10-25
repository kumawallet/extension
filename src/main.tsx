import {
  AssetProvider,
  AccountProvider,
  AuthProvider,
  NetworkProvider,
  TxProvider,
  ThemeProvider,
} from "./providers";
import { Routes } from "./routes";
import { ToastContainer } from "react-toastify";
import "./utils/i18n";
import "./utils/polkadot-keyring";
import "react-toastify/dist/ReactToastify.min.css";
import * as Sentry from "@sentry/react";
import { Error } from "./components/common";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
});

const queryClient = new QueryClient()


export const Main = () => {
  return (
    <Sentry.ErrorBoundary fallback={<Error />}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
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
        </AuthProvider>
      </QueryClientProvider>
    </Sentry.ErrorBoundary>
  );
};

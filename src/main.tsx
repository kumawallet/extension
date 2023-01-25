import { AccountProvider } from "./providers";
import { AuthProvider } from "./providers/AuthProvider";
import { Routes } from "./routes";

export const Main = () => {
  return (
    <AuthProvider>
      <AccountProvider>
        <Routes />
      </AccountProvider>
    </AuthProvider>
  );
};

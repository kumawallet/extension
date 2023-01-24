import { AccountProvider } from "./providers";
import { Routes } from "./routes";

export const Main = () => {
  return (
    <AccountProvider>
      <Routes />
    </AccountProvider>
  );
};

import { AddAccount } from "./components/addAccount";
import { Balance } from "./components/balance";
import { Home } from "./components/home";
import { MemoryRouter, Route, Routes as RRoutes } from "react-router-dom";

export const Routes = () => {
  return (
    <MemoryRouter>
      <RRoutes>
        <Route path="/" element={<Home />} />
        <Route path="/add-account" element={<AddAccount />} />
        <Route path="/balance" element={<Balance />} />
      </RRoutes>
    </MemoryRouter>
  );
};

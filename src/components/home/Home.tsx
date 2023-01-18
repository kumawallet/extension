import logo from "@src/assets/img/logo.svg";
import { PageWrapper } from "../common/PageWrapper";
import { useNavigate } from "react-router-dom";

export const Home = () => {
  const navigate = useNavigate();

  const goToAccounts = () => {
    navigate("/add-account");
  };

  return (
    <PageWrapper>
      <img src={logo} className="mx-auto mt-10 mb-5 w-36 md:w-40" />
      <p className="font-medium text-2xl md:text-3xl mb-2">
        Welcome to XCM Wallet
      </p>
      <p className="font-light text-xs md:text-sm mb-12">
        EVM and WASM accounts in one place
      </p>
      <button
        className="font-medium text-base bg-custom-green-bg w-full py-2 md:py-4 rounded-md"
        onClick={goToAccounts}
      >
        continue
      </button>
    </PageWrapper>
  );
};

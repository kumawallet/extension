import { FiCopy } from "react-icons/fi";
import { accountAddressMock } from "../../mocks/account-mocks";
import logo from "../../assets/img/logo.svg";
import { cropAccount } from "../../utils/account-utils";

export const Account = () => {
  const account = cropAccount(accountAddressMock);

  const copyAccount = () => {
    // TODO: fire popup
    navigator.clipboard.writeText(accountAddressMock);
  };

  return (
    <div className="flex gap-2 items-center">
      <button className="flex items-center gap-1" onClick={copyAccount}>
        <FiCopy />
        <p className="text-custom-green-bg">{account}</p>
      </button>

      <div className="flex justify-center items-center rounded-full bg-[#212529] p-2">
        <img className="w-5 h-5" src={logo} />
      </div>
    </div>
  );
};

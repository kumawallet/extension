import { FiCopy } from "react-icons/fi";
import logo from "../../assets/img/logo.svg";
import { cropAccount } from "../../utils/account-utils";
import { useNavigate } from "react-router-dom";
import { useAccountContext } from "../../providers/AccountProvider";

export const Account = () => {
  const navigate = useNavigate();
  const {
    state: { selectedAccount },
  } = useAccountContext();

  const account = cropAccount(selectedAccount.address);

  const copyAccount = () => {
    // TODO: fire popup
    navigator.clipboard.writeText(selectedAccount.address);
  };

  const goToAccounts = () => {
    navigate("/account");
  };

  return (
    <div className="flex gap-2 items-center">
      <button className="flex items-center gap-1" onClick={copyAccount}>
        <FiCopy />
        <p className="text-custom-green-bg">{account}</p>
      </button>

      <div
        className="flex justify-center items-center rounded-full bg-[#212529] p-2 cursor-pointer"
        onClick={goToAccounts}
      >
        <img className="w-5 h-5" src={logo} />
      </div>
    </div>
  );
};

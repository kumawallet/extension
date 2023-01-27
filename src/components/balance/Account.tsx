import { FiCopy } from "react-icons/fi";
// import logo from "../../assets/img/logo.svg";
import { cropAccount } from "../../utils/account-utils";
// import { useNavigate } from "react-router-dom";
import { useAccountContext } from "../../providers/AccountProvider";
import { AccountManage } from "./AccountManage";

export const Account = () => {
  // const navigate = useNavigate();
  const {
    state: { selectedAccount },
  } = useAccountContext();

  const account = cropAccount(selectedAccount);

  const copyAccount = () => {
    // TODO: fire popup
    navigator.clipboard.writeText(selectedAccount);
  };

  return (
    <div className="flex gap-2 items-center">
      <button className="flex items-center gap-1" onClick={copyAccount}>
        <FiCopy />
        <p className="text-custom-green-bg">{account}</p>
      </button>

      <AccountManage />
    </div>
  );
};

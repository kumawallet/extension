import { PageWrapper } from "../common/PageWrapper";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import { ICON_SIZE } from "../../contants/icons";
import { useAccountContext } from "../../providers/AccountProvider";
import { DeriveAccountFormType } from "./deriveAccount-interfaces";
import { DeriveAccountForm } from "./DeriveAccountForm";

export const DeriveAccount = () => {
  const navigate = useNavigate();

  const { derivateAccount, setSelectedAccount } =
    useAccountContext();

  const _deriveAccount = async (data: DeriveAccountFormType) => {
    try {
      const account = await derivateAccount(data.name, data.accountType);
      if (account.key) {
        await setSelectedAccount(account);
        navigate("/balance");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <PageWrapper>
      <div className="flex items-center gap-3 mb-10">
        <FiChevronLeft
          className="cursor-pointer"
          size={ICON_SIZE}
          onClick={() => navigate(-1)}
        />
        <p className="font-medium text-2xl">Add account</p>
      </div>
      <div className="flex flex-col gap-6 mt-5">
        <DeriveAccountForm onSubmit={_deriveAccount} />
      </div>
    </PageWrapper>
  );
};

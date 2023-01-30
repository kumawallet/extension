import { useState } from "react";
import { PageWrapper } from "../common/PageWrapper";
import { BiLeftArrowAlt } from "react-icons/bi";
import { CreateAccountForm } from "./CreateAccountForm";
import { AccountForm } from "./createAccount-interfaces";
import { CreateAccountMessage } from "./CreateAccountMessage";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../providers/AuthProvider";

export const CreateAccount = () => {
  const { createAccount } = useAuthContext();

  const navigate = useNavigate();
  const [isCreated, setIsCreated] = useState(false);

  const _createAccount = async (data: AccountForm) => {
    const { name, password, confirmPassword } = data;
    try {
      const isCreated = await createAccount({ name, password, confirmPassword });
      setIsCreated(isCreated);
    } catch (error) {
      console.log(error);
    }
  };

  if (isCreated) return <CreateAccountMessage />;

  return (
    <PageWrapper>
      <div className="flex gap-3 items-center">
        <BiLeftArrowAlt
          size={26}
          className="cursor-pointer"
          onClick={() => navigate(-1)}
        />
        <p className="text-xl">Create Account</p>
      </div>
      <div className="flex flex-col gap-6 mt-5">
        <CreateAccountForm onSubmit={_createAccount} />
      </div>
    </PageWrapper>
  );
};

import { useState } from "react";
import { PageWrapper } from "../common/PageWrapper";
import { BiLeftArrowAlt } from "react-icons/bi";
import { ImportAccountMessage } from "./ImportAccountMessage";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../providers/AuthProvider";
import { ImportAccountForm } from "./ImportAccountForm";
import { ImportAccountFormType } from "./importAccount-interfaces";

export const ImportAccount = () => {
  const { importAccount } = useAuthContext();

  const navigate = useNavigate();
  const [isImported, setIsImported] = useState(false);

  const _importAccount = async (data: ImportAccountFormType) => {
    const { name, privateKey, password, accountType } = data;
    try {
      const isImported = await importAccount({ name, privateKey, password, accountType });
      setIsImported(isImported);
    } catch (error) {
      console.log(error);
    }
  };

  if (isImported) return <ImportAccountMessage />;

  return (
    <PageWrapper>
      <div className="flex gap-3 items-center">
        <BiLeftArrowAlt
          size={26}
          className="cursor-pointer"
          onClick={() => navigate(-1)}
        />
        <p className="text-xl">Import Account</p>
      </div>
      <div className="flex flex-col gap-6 mt-5">
        <ImportAccountForm onSubmit={_importAccount} />
      </div>
    </PageWrapper>
  );
};

import { useNavigate } from "react-router-dom";
import { BsChevronRight } from "react-icons/bs";
import { PageWrapper } from "../common/PageWrapper";
import { OptionButton } from "./OptionButton";
import { CREATE_ACCOUNT, IMPORT_ACCOUNT } from "@src/routes/paths";

export const AddAccount = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <div className="mb-14">
        <p className="font-medium text-2xl">Add Accounts</p>
      </div>
      <div className="flex flex-col gap-8">
        <OptionButton onClick={() => navigate(IMPORT_ACCOUNT)}>
          <p className="font-normal text-xl">Import wallet</p>
          <BsChevronRight size={24} />
        </OptionButton>
        <OptionButton onClick={() => navigate(CREATE_ACCOUNT)}>
          <p className="font-normal text-xl">Create wallet</p>
          <BsChevronRight size={24} />
        </OptionButton>
      </div>
    </PageWrapper>
  );
};

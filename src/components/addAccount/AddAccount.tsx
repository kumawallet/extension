import { useNavigate } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";
import { BsChevronRight } from "react-icons/bs";
import { PageWrapper } from "../common/PageWrapper";
import { OptionButton } from "./OptionButton";

export const AddAccount = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <div className="flex justify-between items-center mb-14">
        <p className="font-medium text-2xl">Add Accounts</p>
        <RxCross2 size={20} />
      </div>
      <div className="flex flex-col gap-8">
        <OptionButton onClick={() => navigate("/import-account")}>
          <p className="font-normal text-xl">Import wallet</p>
          <BsChevronRight size={24} />
        </OptionButton>
        <OptionButton onClick={() => navigate("/create-account")}>
          <p className="font-normal text-xl">Create wallet</p>
          <BsChevronRight size={24} />
        </OptionButton>
      </div>
    </PageWrapper>
  );
};

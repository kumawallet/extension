import { PageWrapper } from "../common/PageWrapper";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export const CreateAccountMessage = () => {
  const navigate = useNavigate();

  return (
    <PageWrapper>
      <div className="flex flex-col text-center pt-`0">
        <div className="flex gap-3 items-center mb-3 justify-center">
          <p className="text-3xl text-custom-green-bg">Account created!</p>
          <FaCheckCircle color="green" size={30} />
        </div>

        <button
          className="border bg-custom-green-bg text-white rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-custom-green-bg focus:outline-none focus:shadow-outline w-fit mx-auto"
          onClick={() => navigate("/balance")}
        >
          continue
        </button>
      </div>
    </PageWrapper>
  );
};

import { FC } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { PageWrapper } from "./PageWrapper";

interface SucessMessageProps {
  title: string;
  onClick: () => void;
  buttonText: string;
}

export const SucessMessage: FC<SucessMessageProps> = ({
  title,
  onClick,
  buttonText,
}) => {
  return (
    <PageWrapper contentClassName="h-full">
      <div className="flex flex-col text-center pt-0 justify-center h-full">
        <div className="flex gap-3 items-center mb-3 justify-center">
          <p className="text-3xl text-custom-green-bg">{title}</p>
          <FaCheckCircle color="green" size={30} />
        </div>

        <button
          className="border bg-custom-green-bg text-white rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-custom-green-bg focus:outline-none focus:shadow-outline w-fit mx-auto"
          onClick={onClick}
        >
          {buttonText}
        </button>
      </div>
    </PageWrapper>
  );
};

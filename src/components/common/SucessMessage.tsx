import { FC } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { PageWrapper } from "./PageWrapper";
import { Button } from "./Button";

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
        <div
          className={`flex gap-3 items-center mb-3 justify-center text-primary-default`}
        >
          <p className="text-3xl">{title}</p>
          <FaCheckCircle size={30} />
        </div>

        <div className="flex">
          <Button
            classname="font-medium text-base max-w-md w-full py-2 md:py-4 mx-auto"
            onClick={onClick}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
};

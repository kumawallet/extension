import { FC } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { PageWrapper } from "./PageWrapper";
import { useThemeContext } from "@src/providers";
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
  const { color } = useThemeContext();

  return (
    <PageWrapper contentClassName="h-full">
      <div className="flex flex-col text-center pt-0 justify-center h-full">
        <div
          className={`flex gap-3 items-center mb-3 justify-center text-${color}-primary`}
        >
          <p className="text-3xl">{title}</p>
          <FaCheckCircle size={30} />
        </div>

        <Button onClick={onClick}>{buttonText}</Button>
      </div>
    </PageWrapper>
  );
};

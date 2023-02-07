import { FC } from "react";

const DEFAULT_CLASSNAME = "text-red-500 pt-2 px-1";

interface InputErrorMessageProps {
  message: string | undefined;
  classname?: HTMLElement["className"];
}

export const InputErrorMessage: FC<InputErrorMessageProps> = ({
  message,
  classname,
}) => {
  return <p className={DEFAULT_CLASSNAME || classname}> {message}</p>;
};

import { FC, PropsWithChildren, SVGAttributes } from "react";
import { HTMLAttributes } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface LoadinButtonProps {
  classname?: HTMLAttributes<HTMLButtonElement>["className"];
  isDisabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  spinnerClassname?: SVGAttributes<SVGElement>["className"];
}

const DEFAULT_CLASSNAME =
  "border bg-custom-green-bg text-white rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-custom-green-bg focus:outline-none focus:shadow-outline disabled:opacity-50";
const DEFAULT_SPINNER_CLASSNAME = "w-8 h-8 animate-spin fill-white";

export const LoadingButton: FC<LoadinButtonProps & PropsWithChildren> = ({
  children,
  classname,
  isDisabled,
  isLoading,
  onClick,
  spinnerClassname,
}) => {
  return (
    <button
      className={DEFAULT_CLASSNAME || classname}
      onClick={onClick}
      disabled={isDisabled || isLoading}
    >
      {isLoading ? (
        <AiOutlineLoading3Quarters
          className={DEFAULT_SPINNER_CLASSNAME || spinnerClassname}
        />
      ) : (
        <>{children}</>
      )}
    </button>
  );
};

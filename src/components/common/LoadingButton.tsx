import {
  CSSProperties,
  FC,
  HTMLAttributes,
  PropsWithChildren,
  SVGAttributes,
} from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface LoadinButtonProps {
  classname?: HTMLAttributes<HTMLButtonElement>["className"];
  isDisabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  spinnerClassname?: SVGAttributes<SVGElement>["className"];
  style?: CSSProperties;
}

const DEFAULT_CLASSNAME =
  "min-w-[75px] min-h-[35px] border-[0.5px] bg-custom-green-bg text-white rounded-lg px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-custom-green-bg focus:outline-none focus:shadow-outline disabled:opacity-50";
const DEFAULT_SPINNER_CLASSNAME = "mx-auto animate-spin fill-white";

export const LoadingButton: FC<LoadinButtonProps & PropsWithChildren> = ({
  children,
  classname,
  isDisabled,
  isLoading,
  onClick,
  spinnerClassname,
  style,
}) => {
  return (
    <button
      className={`${
        classname || DEFAULT_CLASSNAME
      } disabled:opacity-30 disabled:bg-gray-600`}
      onClick={onClick}
      disabled={isDisabled || isLoading}
      style={style}
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

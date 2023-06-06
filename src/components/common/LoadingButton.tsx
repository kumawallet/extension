import { useThemeContext } from "@src/providers";
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
  const { color } = useThemeContext();

  return (
    <button
      className={`${
        classname ||
        `"min-w-[75px] min-h-[35px] border-[0.5px] bg-${color}-primary text-${color}-secondary rounded-lg px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-${color}-primary focus:outline-none focus:shadow-outline disabled:opacity-50"`
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

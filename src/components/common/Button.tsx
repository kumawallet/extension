import {
  CSSProperties,
  FC,
  HTMLAttributes,
  PropsWithChildren,
  SVGAttributes,
} from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface ButtonProps {
  classname?: HTMLAttributes<HTMLButtonElement>["className"];
  isDisabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  spinnerClassname?: SVGAttributes<SVGElement>["className"];
  style?: CSSProperties;
  variant?: "text" | "outlined" | "contained" | "contained-gray" | "contained-black" | "countained-red";
}

const DEFAULT_SPINNER_CLASSNAME = "mx-auto animate-spin fill-white";
const BASE_CLASSNAME =
  "min-w-fit min-h-[35px] w-fit rounded-lg px-4 py-2 transition duration-500 ease select-none disabled:opacity-30 disabled:hover:cursor-not-allowed";

const getVariantStyles = (
  variant: ButtonProps["variant"],
) => {
  switch (variant) {
    case "text":
      return `bg-transparent border-0  hover:bg-opacity-80`;
    case "outlined":
      return `bg-transparent border-[0.5px]  hover:bg-opacity-80`;
    case "contained":
      return `bg-linear border-0 hover:bg-opacity-70`;
    case "contained-gray":
      return `bg-[#636669] border-0 hover:bg-linear disabled:hover:bg-[#636669]`;
    case "contained-black":
      return `bg-[#1C1C27] border-0 hover:bg-linear`;
    case "countained-red" : 
      return `bg-[#D62A2A] border-0 hover:bg-opacity-80`
    default:
      return `bg-transparent border-0`;
  }
};

export const Button: FC<ButtonProps & PropsWithChildren> = ({
  children,
  classname,
  isDisabled,
  isLoading,
  onClick,
  spinnerClassname,
  style,
  variant = "contained",
  ...props
}) => {
  const variantStyles = getVariantStyles(variant);

  return (
    <button
      className={`${classname || ""} ${BASE_CLASSNAME} ${variantStyles} bg-`}
      onClick={onClick}
      disabled={isDisabled || isLoading}
      style={style}
      {...props}
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

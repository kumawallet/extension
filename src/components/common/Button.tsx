import {
  CSSProperties,
  FC,
  HTMLAttributes,
  PropsWithChildren,
  SVGAttributes,
} from "react";
import { useThemeContext } from "@src/providers";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface ButtonProps {
  classname?: HTMLAttributes<HTMLButtonElement>["className"];
  isDisabled?: boolean;
  isLoading?: boolean;
  onClick?: () => void;
  spinnerClassname?: SVGAttributes<SVGElement>["className"];
  style?: CSSProperties;
  variant?: "text" | "outlined" | "contained";
}

const DEFAULT_SPINNER_CLASSNAME = "mx-auto animate-spin fill-white";
const BASE_CLASSNAME =
  "min-w-fit min-h-[35px] w-fit rounded-lg px-4 py-2 m-2 transition duration-500 ease select-none disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:cursor-not-allowed";

const getVariantStyles = (
  variant: ButtonProps["variant"],
  themeColor: string
) => {
  switch (variant) {
    case "text":
      return `text-${themeColor}-secondary bg-transparent border-0 hover:bg-${themeColor}-fill hover:bg-opacity-80`;
    case "outlined":
      return `text-${themeColor}-secondary bg-transparent border-[0.5px] border-${themeColor}-primary hover:bg-${themeColor}-fill hover:bg-opacity-80 hover:border-${themeColor}-fill`;
    case "contained":
      return `text-${themeColor}-secondary bg-${themeColor}-fill border-0 hover:bg-opacity-70`;
    default:
      return `text-${themeColor}-primary bg-transparent border-0`;
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
  const { color } = useThemeContext();

  const variantStyles = getVariantStyles(variant, color);

  return (
    <button
      className={`${classname || ""} ${BASE_CLASSNAME} ${variantStyles}`}
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

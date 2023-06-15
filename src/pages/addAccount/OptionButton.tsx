import { useThemeContext } from "@src/providers";
import { FC, PropsWithChildren } from "react";

interface OpionButtonProps extends PropsWithChildren {
  onClick?: () => void;
}

export const OptionButton: FC<OpionButtonProps> = ({ children, onClick }) => {
  const { color } = useThemeContext();

  return (
    <button
      onClick={onClick}
      className={`flex justify-between items-center py-5 px-5 rounded-md bg-custom-gray-bg transition-all hover:bg-${color}-primary`}
    >
      {children}
    </button>
  );
};

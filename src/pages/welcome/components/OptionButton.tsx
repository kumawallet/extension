import type { FC, PropsWithChildren } from "react";
import { useThemeContext } from "@src/providers";

interface OpionButtonProps extends PropsWithChildren {
  onClick?: () => void;
}

export const OptionButton: FC<OpionButtonProps> = ({ children, onClick }) => {
  const { color } = useThemeContext();

  return (
    <button
      onClick={onClick}
      className={`flex justify-center py-[14px] rounded-md bg-[#040404] transition-all hover:bg-${color}-primary z-10`}
      style={{ boxShadow: "0px 8.73px 8.73px 0px rgba(0, 0, 0, 0.25)" }}
    >
      <p className="font-medium text-sm">{children}</p>
    </button>
  );
};

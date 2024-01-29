import type { FC } from "react";
import { useThemeContext } from "@src/providers";

interface ActionProps {
  Icon: JSX.Element
  title: string;
  onClick: () => void;
  isDisabled?: boolean;
}

export const Action: FC<ActionProps> = ({ Icon, title, onClick, isDisabled = false }) => {
  const { color } = useThemeContext();

  return (
    <button className={`group bg-[#0E0D0D] relative rounded-xl px-2 pb-2 pt-4 flex flex-col items-center overflow-hidden hover:enabled:bg-${color}-fill`} disabled={isDisabled} onClick={!isDisabled ? onClick : undefined}>
      {isDisabled && <div className="absolute top-0 left-0 w-full h-full bg-[#0E0D0DB2] rounded-2xl" />}
      {Icon}
      <span className={`text-sm mt-1 text-[#F1F1F1] font-semibold font-poppins group-hover:text-${color}-primary`}>{title}</span>
    </button>
  )
}
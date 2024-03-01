import type { FC } from "react";
import { Soon } from "@src/components/icons";

interface ActionProps {
  Icon: FC<{ className?: string, color?: string }>
  title: string;
  onClick: () => void;
  isDisabled?: boolean;
  isCoomingSoon?: boolean;
}

const ACTIVE_COLOR = "#F1F1F1";
const DISABLED_COLOR = "#525252";

export const Action: FC<ActionProps> = ({ Icon, title, onClick, isDisabled = false, isCoomingSoon = false }) => {
  return (
    <button className={`group min-w-[56px] bg-[#0E0D0D] relative rounded-xl px-2 pb-3 pt-4 flex flex-col items-center  hover:enabled:bg-primary-default`} disabled={isDisabled} onClick={!isDisabled ? onClick : undefined}>
      <Icon
        className={`w-7 h-7 group-hover:text-primary-default`}
        color={isDisabled ? DISABLED_COLOR : ACTIVE_COLOR}
      />
      <span className={`text-xs mt-1 font-semibold font-poppins group-hover:text-primary-default`}
        style={{
          color: isDisabled ? DISABLED_COLOR : ACTIVE_COLOR
        }}
      >{title}</span>
      {
        isCoomingSoon &&
        <Soon className="absolute h-9 w-9 top-[-13px] right-[-1.3rem]" />
      }
    </button>
  )
}
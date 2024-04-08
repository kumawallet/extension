import type { FC } from "react";
import { Soon } from "@src/components/icons";

interface ActionProps {
  Icon: FC<{ className?: string, color?: string , size ?: string;}>
  title: string;
  onClick: () => void;
  isDisabled?: boolean;
  isCoomingSoon?: boolean;
}

const ACTIVE_COLOR = "#F1F1F1";
const DISABLED_COLOR = "#525252";

export const Action: FC<ActionProps> = ({ Icon, title, onClick, isDisabled = false, isCoomingSoon = false }) => {
  return (
    <button className={`group min-w-[56px] bg-[#0E0D0D] relative rounded-xl px-2 pb-3 pt-4 flex flex-col items-center gap-y-3  hover:enabled:bg-primary-default`} disabled={isDisabled} onClick={!isDisabled ? onClick : undefined}>
      <Icon
        className={`w-5 h-5 group-hover:text-primary-default`}
        color={isDisabled ? DISABLED_COLOR : ACTIVE_COLOR}
        size="15"
      />
      <span className={`text-xs mt-1 !font-normal group-hover:text-primary-default`}
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
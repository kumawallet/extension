import { ASSETS_ICONS } from "@src/constants/assets-icons";
import { FC, useMemo } from "react";
import { useCopyToClipboard } from "@src/hooks/common/useCopyToClipboard";
import { More } from "@src/components/icons/more";
import { getHash } from "./funtions/Txfunctions";

interface WalletProps {
  name: string;
  address: string;
  type: string;
  isSelected?: boolean;
  onSelect: () => void;
  showSelectedIcon?: boolean;
  showCopyIcon?: boolean;
  more?: () => void;
}

export const Wallet: FC<WalletProps> = ({
  address,
  name,
  type,
  onSelect,
  isSelected,
  showSelectedIcon = false,
  showCopyIcon = true,
  more,
}) => {
  const iconURL = useMemo(() => {
    if (type.toLowerCase().includes("wasm")) {
      return ASSETS_ICONS["DOT"];
    }

    if (type.toLowerCase().includes("evm")) {
      return ASSETS_ICONS["ETH"];
    }
  }, [type]);

  const { Icon, copyToClipboard } = useCopyToClipboard(address);

  return (
    <div
      className={`flex items-center px-4 py-3 bg-[#1C1C27] rounded-lg ${isSelected && !showSelectedIcon ? "border border-[#2CEC84]" : ""
        }`}
    >
      <button
        className="w-[90%] flex gap-2 items-center overflow-hidden text-ellipsis"
        onClick={onSelect}
      >
        <img
          src={iconURL}
          alt=""
          width={26}
          height={26}
          className="aspect-square rounded-full"
        />
        <div className="flex flex-col w-">
          <span className="text-start text-sm font-semibold">{name}</span>
          <span className="overflow-hidden text-ellipsis text-xs font-inter font-light max-w-[30ch]">
            {getHash(address)}
          </span>
        </div>
      </button>

      <div className="w-[10%] flex items-center gap-1 justify-center">
        {showCopyIcon && (
          <div className="flex gap-3">
            <button onClick={copyToClipboard}>
              <Icon />
            </button>
            {more && (
              <button onClick={more}>
                <More size="18" />
              </button>
            )}
          </div>
        )}

        {showSelectedIcon && (
          <button
            onClick={onSelect}
            className={`p-1 text-[6px] rounded-full border relative  ${isSelected
                ? "border-[#2CEC84] text-[#2CEC84] active-wallet-icon"
                : "border-gray-300"
              }`}
          />
        )}
      </div>
    </div>
  );
};

import { ASSETS_ICONS } from "@src/constants/assets-icons";
import { FC, useMemo } from "react";
import { FaRegCopy } from "react-icons/fa6";

interface WalletProps {
  name: string;
  address: string;
  type: string;
  isSelected?: boolean;
  onSelect: () => void;
  showSelectedIcon?: boolean;
  showCopyIcon?: boolean;
}

export const Wallet: FC<WalletProps> = ({
  address,
  name,
  type,
  onSelect,
  isSelected,
  showSelectedIcon = false,
  showCopyIcon = true
}) => {

  const iconURL = useMemo(() => {

    if (type.toLowerCase().includes("wasm")) {
      return ASSETS_ICONS['DOT']
    }

    if (type.toLowerCase().includes("evm")) {
      return ASSETS_ICONS['ETH']
    }


  }, [type])

  return (
    <div
      className={`flex items-center px-3 py-2 bg-[#1C1C27] rounded-lg ${isSelected && !showSelectedIcon ? "border border-[#2CEC84]" : ""
        }`}
    >
      <button className="w-[90%] flex gap-2 items-center overflow-hidden text-ellipsis" onClick={onSelect}>
        <img src={iconURL} alt="" width={26} height={26} className="aspect-square rounded-full" />
        <div className="flex flex-col w-">
          <span className="text-start text-sm md:text-lg font-semibold">{name}</span>
          <span className="overflow-hidden text-ellipsis font-inter font-light max-w-[30ch]">
            {address}
          </span>
        </div>
      </button>

      <div className="w-[10%] flex items-center gap-1 justify-center">
        {
          showCopyIcon && (
            <FaRegCopy size={16} />
          )
        }

        {
          showSelectedIcon && (
            <button
              onClick={onSelect}
              className={`p-1 text-[6px] rounded-full border relative  ${isSelected ? "border-[#2CEC84] text-[#2CEC84] active-wallet-icon" : "border-gray-300"
                }`}
            />
          )
        }
      </div>
    </div>
  );
};


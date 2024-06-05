import { ASSETS_ICONS } from "@src/constants/assets-icons";
import { FC, useMemo } from "react";
import { useCopyToClipboard } from "@src/hooks/common/useCopyToClipboard";
import { More } from "@src/components/icons/more";
import { getHash } from "@src/utils/transactions-utils";
import { formatAmountWithDecimals } from "@src/utils/assets";
import { AssetIcon } from "@src/components/common";

interface WalletProps {
  name: string;
  address: string;
  type: string;
  isSelected?: boolean;
  onSelect?: () => void;
  showSelectedIcon?: boolean;
  showCopyIcon?: boolean;
  more?: () => void;
  showBalanceforAsset?: boolean;
  _asset?: any;
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
  showBalanceforAsset = false,
  _asset,
}) => {
  const iconURL = useMemo(() => {
    const parsedType = type.toLowerCase();



    if (parsedType.includes("wasm")) {
      return ASSETS_ICONS["DOT"];
    }

    if (parsedType.includes("evm")) {
      return ASSETS_ICONS["ETH"];
    }

    if (parsedType.includes("ol")) {
      return ASSETS_ICONS["OL"];
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
        {showBalanceforAsset ? (<AssetIcon asset={_asset} width={32} />) : (<img
          src={iconURL}
          alt=""
          width={26}
          height={26}
          className="aspect-square rounded-full"
        />)}
        <div className="flex flex-col w-">
          <span className={`text-start ${!showBalanceforAsset ? "text-sm" : "text-[0.7rem]"} font-semibold `}>{name}</span>
          <span className={`overflow-hidden text-ellipsis ${!showBalanceforAsset ? "text-[0.7rem]" : "text-[0.55rem]"} font-inter font-light max-w-[30ch]`}>
            {getHash(address)}
          </span>
        </div>
      </button>

      {!showBalanceforAsset ? (<div className="w-[10%] flex items-center gap-1 justify-center ml-4">
        <div className="flex gap-3">
          {showCopyIcon && (
            <button data-testid="copy-to-clipboard" onClick={copyToClipboard}>
              <Icon />
            </button>
          )}
          {more && (
            <button data-testid="details" onClick={more}>
              <More size="18" />
            </button>
          )}
        </div>


        {showSelectedIcon && (
          <button
            onClick={onSelect}
            className={`p-1 text-[6px] rounded-full border relative  ${isSelected
              ? "border-[#2CEC84] text-[#2CEC84] active-wallet-icon"
              : "border-gray-300"
              }`}
          />
        )}
      </div>) : <div className="flex gap-1 font-semibold text-xs"><p>
        {formatAmountWithDecimals(
          Number(_asset && _asset.balance),
          3,
          _asset && _asset.decimals
        )}</p>
        <p >{_asset && _asset.symbol}</p>
      </div>}
    </div>
  );
};

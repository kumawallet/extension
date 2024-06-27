import { memo } from "react";
import { Switch } from "@headlessui/react";
import { Chain } from "@src/types";
import { ChainStatus } from "@src/storage/entities/Provider";
import { MdOutlineSignalCellularAlt } from "react-icons/md";

interface ChainOptionProps {
  chain: Chain;
  status: ChainStatus | null;
  onClick: () => void;
  isSelected: boolean;
  isDisabled: boolean
}

// eslint-disable-next-line react/display-name
export const ChainOption = memo(
  ({ chain, status, onClick, isSelected, isDisabled }: ChainOptionProps) => {
    return (
      <button
        disabled={isDisabled}
        className={`flex items-center relative justify-between border ${isSelected ? "border-green-500" : "border-gray-600"
          } rounded-lg py-3 px-4`}
        onClick={onClick}
      >
        {isSelected && status && (
          <div className="absolute bottom-1 left-1 rounded-full border p-1 border-gray-500 border-opacity-50">
            <MdOutlineSignalCellularAlt
              size={10}
              className={`${status === ChainStatus.CONNECTED
                ? "text-green-500"
                : "text-yellow-500"
                }`}
            />
          </div>
        )}

        <div className="flex items-center gap-3">
          {chain.isCustom ? (
            <div className="w-6 h-6 bg-gray-400 flex items-center justify-center text-base rounded-full">
              {chain.name[0]}
            </div>
          ) : (
            <img
              src={chain.logo}
              width={24}
              height={24}
              alt={chain.name}
              className="object-cover rounded-full"
            />
          )}
          <span className="text-base">{chain.name}</span>
        </div>
        <div className="flex items-center">
          <Switch
            checked={isSelected}
            className={`${isSelected ? `bg-green-500` : "bg-custom-gray-bg"
              } relative inline-flex items-center h-2 rounded-full w-7 transition-colors duration-200`}
          >
            <span
              className={`${isSelected && "translate-x-4"
                } inline-block w-3 h-3 transform bg-white rounded-full transition-transform duration-200`}
            />
          </Switch>
        </div>
      </button>
    );
  }
);

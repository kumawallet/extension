import { FC } from "react";
import { Popover, Switch } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { MdInfoOutline } from "react-icons/md";

interface RecipientAddressProps {
  address: string;
  containerClassName?: string;
  isNotOwnAddress: boolean;
  isOptional?: boolean;
  isValidAddress: boolean;
  onAddressChange: (address: string) => void;
  onTogleRecipient: (value: boolean) => void;
  recipentAddressFormat?: string;
  infoTooltipMessage?: string;
}

const Address = ({ recipentAddressFormat, text, tooltipMessage }: {
  recipentAddressFormat: string | null;
  text: string;
  tooltipMessage: string | undefined;
}) => {
  return (
    <div className="flex gap-2 items-center relative">
      <span>
        {text}
      </span>
      {
        tooltipMessage && (
          <Popover className="relative h-[12px]">
            <Popover.Button>
              <MdInfoOutline size={12} />
            </Popover.Button>
            <Popover.Panel className="absolute z-10 bg-[#212529] rounded-xl top-3 -left-[80px] w-[200px]">
              <p className="p-3 text-gray-200">{tooltipMessage}</p>
            </Popover.Panel>
          </Popover>
        )
      }
    </div>
  )
}

export const RecipientAddress: FC<RecipientAddressProps> = ({
  address,
  containerClassName,
  isNotOwnAddress,
  isOptional = true,
  isValidAddress,
  onAddressChange,
  onTogleRecipient,
  recipentAddressFormat = null,
  infoTooltipMessage
}) => {
  const { t } = useTranslation("swap");

  return (
    <div className={containerClassName}>
      {
        isOptional ? (
          <Switch.Group>
            <div className="flex items-center mb-1">
              <Switch.Label passive className="mr-2 text-xs font-medium">
                <Address recipentAddressFormat={recipentAddressFormat} text={t("recipent_address")} tooltipMessage={t(infoTooltipMessage || "")} />
              </Switch.Label>
              <Switch
                checked={isNotOwnAddress}
                onChange={onTogleRecipient}
                className={`${isNotOwnAddress ? `bg-primary-default` : "bg-custom-gray-bg"
                  } relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200`}
              >
                <span className="sr-only">{t("recipent_address")}</span>
                <span
                  className={`${isNotOwnAddress ? "translate-x-6" : "translate-x-1"
                    } inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200`}
                />
              </Switch>
            </div>
          </Switch.Group>
        ) : (
          <p className="text-xs font-medium mb-1">
            <Address recipentAddressFormat={recipentAddressFormat} text={t("recipent_address")} tooltipMessage={t(infoTooltipMessage || "")} />
          </p>
        )
      }

      <input
        type="text"
        disabled={isOptional && !isNotOwnAddress}
        className="w-full bg-[#343a40] border border-[#727e8b17] text-[#9CA3AF] font-bold disabled:cursor-not-allowed disabled:opacity-50 rounded-lg py-3 px-4 outline-none focus:outline-none "
        value={address}
        onChange={(e) => onAddressChange(e.target.value)}
      />
      <p>{!isValidAddress && t("invalid_address")}</p>
    </div>
  );
};

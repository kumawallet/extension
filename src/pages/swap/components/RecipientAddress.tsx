import { FC } from "react";
import { Switch } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { useThemeContext } from "@src/providers";

interface RecipientAddressProps {
  address: string;
  containerClassName?: string;
  isNotOwnAddress: boolean;
  isOptional?: boolean;
  isValidAddress: boolean;
  onAddressChange: (address: string) => void;
  onTogleRecipient: (value: boolean) => void;
  recipentAddressFormat?: string;
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
}) => {
  const { t } = useTranslation("swap");
  const { color } = useThemeContext();

  return (
    <div className={containerClassName}>
      {
        isOptional ? (
          <Switch.Group>
            <div className="flex items-center mb-1">
              <Switch.Label passive className="mr-2 text-xs font-medium">
                {recipentAddressFormat} {t("recipent_address")}
              </Switch.Label>
              <Switch
                checked={isNotOwnAddress}
                onChange={onTogleRecipient}
                className={`${isNotOwnAddress ? `bg-${color}-primary` : "bg-custom-gray-bg"
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
          <p className="text-xs font-medium mb-1">{recipentAddressFormat} {t("recipent_address")}</p>
        )
      }

      <input
        type="text"
        disabled={isOptional && !isNotOwnAddress}
        className="w-full bg-[#343a40] border border-[#727e8b17] text-[#9CA3AF] font-bold disabled:cursor-not-allowed disabled:opacity-50 rounded-xl py-3 px-4 outline-none focus:outline-none "
        value={address}
        onChange={(e) => onAddressChange(e.target.value)}
      />
      <p>{!isValidAddress && t("invalid_address")}</p>
    </div>
  );
};

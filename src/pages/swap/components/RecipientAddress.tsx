import { FC } from "react";
import { Switch } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { useThemeContext } from "@src/providers";

interface RecipientAddressProps {
  isNotOwnAddress: boolean;
  onTogleRecipient: (value: boolean) => void;
  address: string;
  onAddressChange: (address: string) => void;
  isValidAddress: boolean;
  containerClassName?: string;
}

export const RecipientAddress: FC<RecipientAddressProps> = ({
  isNotOwnAddress,
  onTogleRecipient,
  address,
  onAddressChange,
  containerClassName,
  isValidAddress,
}) => {
  const { t } = useTranslation("swap");
  const { color } = useThemeContext();

  return (
    <div className={containerClassName}>
      <Switch.Group>
        <div className="flex items-center mb-1">
          <Switch.Label passive className="mr-2 text-xs font-medium">
            {t("recipent_address")}
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

      <input
        type="text"
        disabled={!isNotOwnAddress}
        className="border border-white w-full bg-[#29323C] disabled:cursor-not-allowed disabled:opacity-50 rounded-2xl py-3 px-4 outline-none focus:outline-none "
        value={address}
        onChange={(e) => onAddressChange(e.target.value)}
      />
      <p>{!isValidAddress && t("invalid_address")}</p>
    </div>
  );
};

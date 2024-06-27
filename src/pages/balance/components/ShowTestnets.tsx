import { useEffect, useState, FC } from "react";
import { Switch } from "@headlessui/react";
import { messageAPI } from "@src/messageAPI/api";
import { useNetworkContext } from "@src/providers";
import { SettingKey, SettingType } from "@src/storage/entities/settings/types";
import { useTranslation } from "react-i18next";

interface ShowTestnetsProps {
  validateSwitch: boolean;
}

export const ShowTestnets: FC<ShowTestnetsProps> = ({ validateSwitch }) => {
  const { t } = useTranslation("general_settings");
  const { refreshNetworks } = useNetworkContext();

  const [showTestnets, setShowTestnets] = useState(false);

  useEffect(() => {
    (async () => {
      const setting = await messageAPI.getSetting({
        key: SettingKey.SHOW_TESTNETS,
        type: SettingType.GENERAL,
      });

      const showTestnets = (setting?.value as boolean) || false;

      setShowTestnets(showTestnets);
    })();
  }, []);

  const onToggle = async () => {
    setShowTestnets((value) => !value);
    await messageAPI.updateSetting({
      type: SettingType.GENERAL,
      key: SettingKey.SHOW_TESTNETS,
      value: !showTestnets,
    });
    refreshNetworks();
  };

  return (
    <div className="flex justify-between items-center gap-2">
      <p className="text-lg font-medium">{t("show_testnets")}</p>

      <div className="flex items-center justify-end">
        <Switch.Group>
          <div className="flex items-center">
            <Switch
              data-testid="show-testnets-switch"
              disabled={validateSwitch}
              aria-disabled={validateSwitch}
              checked={showTestnets}
              onChange={onToggle}
              className={`${showTestnets ? `bg-primary-default` : "bg-custom-gray-bg"
                } relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <span className="sr-only">{t("show_testnets")}</span>
              <span
                className={`${showTestnets ? "translate-x-6" : "translate-x-1"
                  } inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50`}
              />
            </Switch>
          </div>
        </Switch.Group>
      </div>
    </div>
  );
};

import { Popover } from "@headlessui/react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FaInfoCircle } from "react-icons/fa"

export const XCMAlertMessage = () => {
  const { t } = useTranslation("send");

  const {
    watch,

  } = useFormContext();

  const isXcm = watch("isXcm");

  if (!isXcm) return null;

  return (
    <Popover className="relative">
      <Popover.Button className="rounded-full p-1">
        <FaInfoCircle />
      </Popover.Button>

      <Popover.Panel className="absolute z-10 max-w-[240px] w-[240px]">
        <p className="shadow-lg rounded-lg p-2 bg-[#212529]">
          {t('xcm_alert_message')}
        </p>
      </Popover.Panel>
    </Popover>
  )

}
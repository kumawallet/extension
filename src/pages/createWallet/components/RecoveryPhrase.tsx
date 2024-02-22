import { useCopyToClipboard } from "@src/hooks";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { PiEyeClosedLight, PiEyeLight } from "react-icons/pi";
import { CreateWalletFormValues } from "../validations";

export const RecoveryPhrase = () => {
  const { t } = useTranslation("common");
  const { getValues } = useFormContext<CreateWalletFormValues>();

  const seed = getValues("seed");

  const { Icon, copyToClipboard } = useCopyToClipboard(seed);
  const [isHide, setIsHide] = useState(true);

  const onUnhide = () => {
    setIsHide(!isHide);
  };

  return (
    <>
      <div className="relative border-[0.3px] border-[#fff5] rounded-md px-3 py-5 overflow-hidden mb-4 mt-4">
        <div className="grid grid-cols-3 gap-y-5 text-center">
          {seed.split(" ").map((word, index) => (
            <p key={index.toString()} className="text-base">
              {word}
            </p>
          ))}
        </div>

        <div className="group absolute w-full h-full top-0 left-0">
          <div
            className={`absolute w-full h-full top-0 left-0 ${isHide ? "backdrop-blur" : "backdrop-blur-0"
              } flex items-center justify-center z-10`}
          />

          <div
            className={`absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-40 p-4 rounded-xl flex items-center justify-center  ${!isHide
                ? "hidden group-hover:backdrop-blur group-hover:block"
                : "block"
              }`}
          >
            <button onClick={onUnhide}>
              {isHide ? (
                <PiEyeClosedLight size={40} />
              ) : (
                <PiEyeLight size={40} />
              )}
            </button>
          </div>
        </div>
      </div>

      <button
        className="flex items-center gap-2 text-base"
        onClick={copyToClipboard}
      >
        <Icon messagePosition="left" />
        <span>{t("copy_to_clipboard")}</span>
      </button>
    </>
  );
};

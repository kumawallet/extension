import { useState, useCallback } from "react";
import { FiCopy } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { IconBaseProps } from "react-icons";

interface IconProps {
  iconProps?: IconBaseProps;
  messagePosition?: "left" | "right";
  messageTopSeparation?: number;
}

export const useCopyToClipboard = (textToCopy: string) => {
  const { t } = useTranslation("common");
  const [isOpen, setIsOpen] = useState(false);

  const copyToClipboard = useCallback(async () => {
    setIsOpen(true);
    await navigator.clipboard.writeText(textToCopy);
    setTimeout(() => {
      setIsOpen(false);
    }, 1000);
  }, [textToCopy]);

  const Icon = ({
    iconProps,
    messagePosition = "left",
    messageTopSeparation = 16,
  }: IconProps) => (
    <div className="relative">
      <FiCopy {...iconProps} />
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: messageTopSeparation,
            ...(messagePosition === "left" ? { left: 0 } : { right: 0 }),
            zIndex: 10,
          }}
          className="border border-[#343A40] rounded-xl p-2 bg-black bg-opacity-70 text-sm"
        >
          {t("copied")}
        </div>
      )}
    </div>
  );

  return {
    Icon,
    copyToClipboard,
  };
};

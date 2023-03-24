import { useState } from "react";
import { PageWrapper } from "@src/components/common";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { QR_CODE_SIZE } from "@src/constants/icons";
import { FiChevronLeft, FiCopy } from "react-icons/fi";
import { useClick, useInteractions, useFloating } from "@floating-ui/react";
import { useAccountContext } from "@src/providers";
import { cropAccount } from "@src/utils/account-utils";

export const Receive = () => {
  const { t } = useTranslation("receive");
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const {
    state: { selectedAccount },
  } = useAccountContext();

  const { x, y, strategy, refs, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
  });

  const click = useClick(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([click]);

  const account = cropAccount(selectedAccount?.value?.address);

  const copyAccount = async () => {
    setIsOpen(true);
    await navigator.clipboard.writeText(selectedAccount?.value?.address);
    setTimeout(() => {
      setIsOpen(false);
    }, 1000);
  };

  return (
    <PageWrapper>
      <div className="flex gap-3 items-center mb-7">
        <FiChevronLeft
          size={26}
          className="cursor-pointer"
          onClick={() => navigate(-1)}
        />
        <p className="text-xl">{t("title")}</p>
      </div>

      <div className="flex flex-col justify-center items-center mt-5">
        <div className="flex mt-5 justify-center items-center text-center text-lg font-medium">
          {selectedAccount.value.name}
        </div>
        <QRCode
          className="rounded-2xl p-2 mt-5 bg-white"
          size={QR_CODE_SIZE}
          value={selectedAccount?.value?.address || ""}
        />
        <div className="flex mt-5 justify-center items-center text-center text-lg font-medium">
          <button
            ref={refs.setReference}
            {...getReferenceProps()}
            className="flex items-center gap-1"
            onClick={copyAccount}
            data-testid="account-button"
          >
            <p className="text-custom-green-bg">{account}</p>
            <FiCopy />
          </button>
          {isOpen && (
            <div
              ref={refs.setFloating}
              style={{
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
                zIndex: 10,
              }}
              {...getFloatingProps()}
              className="border border-[#343A40] rounded-xl p-2 bg-black bg-opacity-70"
            >
              Copied!
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

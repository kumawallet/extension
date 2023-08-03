import { PageWrapper } from "@src/components/common";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import { QR_CODE_SIZE } from "@src/constants/icons";
import { FiChevronLeft } from "react-icons/fi";
import { useAccountContext, useThemeContext } from "@src/providers";
import { cropAccount } from "@src/utils/account-utils";
import { useCopyToClipboard } from "@src/hooks";

export const Receive = () => {
  const { t } = useTranslation("receive");
  const { color } = useThemeContext();
  const navigate = useNavigate();
  const {
    state: { selectedAccount },
  } = useAccountContext();

  const account = cropAccount(selectedAccount?.value?.address);
  const { Icon, copyToClipboard } = useCopyToClipboard(
    selectedAccount?.value?.address || ""
  );

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
            className="flex items-center gap-1"
            onClick={copyToClipboard}
            data-testid="account-button"
          >
            <p className={`text-${color}-primary`}>{account}</p>
            <Icon messageTopSeparation={20} messagePosition="right" />
          </button>
        </div>
      </div>
    </PageWrapper>
  );
};

import { FC } from "react";
import { useTranslation } from "react-i18next";
import { PageWrapper } from "./PageWrapper";

interface ConfirmTrustedSiteProps {
  confirm: () => void;
  cancel: () => void;
  origin: string;
}

export const ConfirmTrustedSite: FC<ConfirmTrustedSiteProps> = ({
  confirm,
  cancel,
  origin,
}) => {
  const { t } = useTranslation("confirm_trusted_site");
  const { t: tCommon } = useTranslation("common");

  return (
    <PageWrapper contentClassName="h-full">
      <div className="flex flex-col mx-auto h-full py-3">
        <div className="flex-1">
          <div className="flex gap-3 items-center mb-7">
            <p className="text-xl">{t("title")}</p>
          </div>
          <div className="font-medium text-sm mt-5">
            <p>{t("new_site_warning")}</p>
          </div>
          <div className="text-sm mt-5">
            <p>{t("do_you_trust_this_site")}</p>
          </div>
          <div className="m-5 text-center rounded-lg py-2 px-4 bg-custom-gray-bg">
            <p>{origin || ""}</p>
          </div>
          <div className="mt-5">
            <p>{t("site_will_be_trusted")}</p>
            <p className="mt-4">
              {t("manage_trusted_sites")}
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            className="mt-5 inline-flex justify-center border border-custom-gray-bg text-white rounded-lg py-2 px-4 hover:bg-gray-400 hover:bg-opacity-30 transition duration-500 ease select-none focus:outline-none focus:shadow-outline text-sm"
            onClick={cancel}
          >
            {tCommon("cancel")}
          </button>
          <button
            type="button"
            className="mt-5 ml-4 inline-flex justify-center border border-custom-green-bg text-white rounded-lg py-2 px-4 transition duration-500 ease select-none bg-custom-green-bg focus:outline-none focus:shadow-outline text-sm"
            onClick={confirm}
          >
            {tCommon("connect")}
          </button>
        </div>
      </div>
    </PageWrapper>
  );
};

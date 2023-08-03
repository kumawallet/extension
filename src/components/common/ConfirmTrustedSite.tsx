import { FC } from "react";
import { useTranslation } from "react-i18next";
import { PageWrapper } from "./PageWrapper";
import { Button } from "./Button";

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
            <p className="mt-4">{t("manage_trusted_sites")}</p>
          </div>
        </div>
        <div className="flex gap-4 justify-end mt-5 items-center">
          <Button variant="text" classname="text-sm" onClick={cancel}>
            {tCommon("cancel")}
          </Button>
          <Button classname="text-sm" onClick={confirm}>
            {tCommon("connect")}
          </Button>
        </div>
      </div>
    </PageWrapper>
  );
};

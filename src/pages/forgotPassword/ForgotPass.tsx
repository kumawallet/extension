import { useState } from "react";
import { useTranslation } from "react-i18next";
import { PageWrapper, Button } from "@src/components/common";
import { HeaderBack } from "@src/components/common/HeaderBack";
import { useNavigate } from "react-router-dom";
import { useLoading, useToast } from "@src/hooks";
import { messageAPI } from "@src/messageAPI/api";
import { styleForgotPass } from "./styles/ForgotPass";
import { Browser } from "@src/utils/constants";


export const ForgotPass = () => {
  const navigate = useNavigate();
  const { t } = useTranslation("forgot_pass");
  const { t: tCommon } = useTranslation("common");

  const [isChecked, setIsChecked] = useState(false);
  const { starLoading, endLoading, isLoading } = useLoading();
  const { showErrorToast } = useToast();

  const resetWallet = async () => {
    starLoading();
    try {
      await messageAPI.resetWallet();
      localStorage.removeItem("color");

      const tab = await Browser.tabs.getCurrent();

      const isInPopup = !tab?.id;

      if (isInPopup) {
        // open in full screen
        const url = Browser.runtime.getURL(`src/entries/newtab/index.html`);
        Browser.tabs.create({ url });
        window.close();
      } else {
        window.location.reload();
      }
    } catch (error) {
      showErrorToast(tCommon(error as string));
      endLoading();
    }
  };

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <PageWrapper>
      <HeaderBack navigate={navigate} title={t("title")} />
      <div className={styleForgotPass.containerBody}>
        <p className={styleForgotPass.text}>{t("paragraph_1")}</p>
        <p className={styleForgotPass.text}>{t("paragraph_2")}</p>
        <p className={styleForgotPass.text}>
          {t("paragraph_3")}
          <a className={styleForgotPass.docs}>{t("docs")}</a>
        </p>
        <div className={styleForgotPass.containerCheckBox}>
          <input
            data-testid="checkbox"
            type="checkbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
            className={styleForgotPass.checkbox}
          />
          <p className={styleForgotPass.textCheckBox}>{t("confirmation")}</p>
        </div>
        <Button
          data-testid="reset-button"
          isLoading={isLoading}
          variant="countained-red"
          classname={styleForgotPass.buttom}
          isDisabled={!isChecked}
          onClick={resetWallet}
        >
          {t("reset")}
        </Button>
      </div>
    </PageWrapper>
  );
};

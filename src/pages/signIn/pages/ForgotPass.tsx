import { useState } from "react"
import { useTranslation } from "react-i18next";
import { PageWrapper, Button } from "@src/components/common"
import { HeaderBack } from "@src/components/common/HeaderBack"
import { useNavigate } from "react-router-dom";
import { styleForgotPass } from "@src/pages/signIn/styles/ForgotPass"
import { useLoading, useToast } from "@src/hooks";
import { messageAPI } from "@src/messageAPI/api";
import { getWebAPI } from "@src/utils/env";

const webAPI = getWebAPI()

export const ForgotPass = () => {

  const navigate = useNavigate();
  const { t } = useTranslation("forgot_pass");
  const { t: tCommon } = useTranslation("common");

  const [isChecked, setIsChecked] = useState(false);
  const {
    starLoading: startLoadingReset,
    endLoading: endLoadingReset,
  } = useLoading();
  const { showErrorToast } = useToast();

  const resetWallet = async () => {
    startLoadingReset();
    try {
      await messageAPI.resetWallet();
      localStorage.removeItem("color");

      const tab = await webAPI.tabs.getCurrent()

      const isInPopup = !tab?.id

      if (isInPopup) {
        // open in full screen
        const url = webAPI.runtime.getURL(`src/entries/newtab/index.html`);
        webAPI.tabs.create({ url });
      } else {
        window.location.reload();
      }

    } catch (error) {
      console.log(error)
      showErrorToast(tCommon(error as string));
      endLoadingReset();
    }
  };
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <PageWrapper>

      <HeaderBack navigate={navigate} title={t("title")} />
      <div className={styleForgotPass.countainerBody}>
        <p className={styleForgotPass.text}>
          {t("paragraph_1")}
        </p>
        <p className={styleForgotPass.text}>
          {t("paragraph_2")}
        </p >
        <p className={styleForgotPass.text}>
          {t("paragraph_3")}
          <a className={styleForgotPass.docs}>{t("docs")}</a>
        </p>
        <div className={styleForgotPass.countainerCheckBox}>
          <input
            type="checkbox"
            checked={isChecked}
            onClick={handleCheckboxChange}
            className={styleForgotPass.checkbox}
          />
          <p className={styleForgotPass.textCheckBox}>{t("confirmation")}</p>
        </div>
        <Button variant="countained-red" classname={styleForgotPass.buttom} isDisabled={!isChecked} onClick={resetWallet}>
          {t("reset")}
        </Button>
      </div>
    </PageWrapper>

  )
}
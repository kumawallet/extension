import { useState } from "react"
import { useTranslation } from "react-i18next";
import { PageWrapper, Button} from "@src/components/common"
import { HeaderBack } from "@src/components/common/HeaderBack"
import { useNavigate } from "react-router-dom";
import { styleForgotPass } from "@src/pages/signIn/styles/ForgotPass"


export const ForgotPass = () => {
    
    const navigate = useNavigate();
    const { t } = useTranslation("forgot_pass");
    
    const [isChecked, setIsChecked] = useState(false);

    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
      };
    
    return (
            <PageWrapper>
            
            <HeaderBack navigate={navigate} title={t("title")}/>
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
                <Button variant="countained-red" classname={styleForgotPass.buttom} isDisabled={!isChecked}>
                    {t("reset")}
                </Button>
            </div>
    </PageWrapper>
        
    )
}
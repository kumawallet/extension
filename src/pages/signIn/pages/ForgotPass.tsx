import { useState } from "react"
import { useTranslation } from "react-i18next";
import { PageWrapper, Button} from "@src/components/common"
import { HeaderBack } from "@src/components/common/HeaderBack"
import { useNavigate } from "react-router-dom";


export const ForgotPass = () => {
    
    const navigate = useNavigate();
    const { t } = useTranslation("forgot_pass");
    const [isChecked, setIsChecked] = useState(false);
    const handleCheckboxChange = () => {
        setIsChecked(!isChecked);
      };
    
    return (
        <div className="h-full bg-[]">
            <PageWrapper contentClassName=" h-full">
            
            <HeaderBack navigate={navigate} title={t("title")}/>
            <div className="mx-4">
                <p className="text-[0.9rem] font-light mb-4 text-justify">
                    {t("paragraph_1")} 
                </p>
                <p className="text-[0.9rem] font-light mb-4 text-justify">
                    {t("paragraph_2")}
                </p >
                <p className="text-[0.9rem] font-light mb-4 text-justify">
                    {t("paragraph_3")}
                    <a className=" cursor-pointer underline hover:no-underline">{t("docs")}</a>
                </p>
                <div className=" flex items-center gap-2 mt-10 mb-5 ">
                <input 
                    type="checkbox" 
                    checked={isChecked}
                    onClick={handleCheckboxChange}
                    className="w-3 h-3 border-[#636669] border-[1px] rounded-sm"
                />
                <p className="text-sm text-[#3D8FEF] font-medium">{t("confirmation")}</p>
                </div>
                <div className="flex items-center h-full">
                <Button variant="countained-red" classname="w-full h-10 font-medium" isDisabled={!isChecked}>
                    {t("reset")}
                </Button>
                </div>
                
            </div>
    </PageWrapper>
        </div>
        
        
    )
}
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { CREATE_ACCOUNT, IMPORT_ACCOUNT } from "@src/routes/paths";
import { Button } from "@src/components/common";
import { AccountFormWrapper } from "@src/components/accountForm";
import { GoChevronRight } from "react-icons/go";
import { ASteriskCircle, SendForeward } from "@src/components/icons";

export const Welcome = () => {
  const { t } = useTranslation("welcome");
  const navigate = useNavigate();

  return (
    <AccountFormWrapper
      topMessage={
        <p className="px-2 mb-8 text-center text-base font-light !text-[24px] tracking-widest py-5 leading-9">
          {t("welcome_message")}
        </p>
      }
      description={t("description") + " ✨"}
      descriptionClassName="!text-[1.4rem] !leading-7 my-3 font-light mb-8 !mt-8 mx-auto max-w-[30ch] md:text-lg"
      centerInnerTitle
    >
      <div className="flex flex-col gap-3">
        <Button
          classname="w-full py-5 rounded-xl"
          variant="contained-black"
          onClick={() => navigate(CREATE_ACCOUNT)}
        >
          <div className="flex items-center justify-around px-2">
            <ASteriskCircle className="w-6 h-6" />
            <span className="text-xl font-normal">{t("create_wallet")}</span>
            <GoChevronRight size={12} />
          </div>
        </Button>
        <Button
          classname="w-full py-5 rounded-xl"
          variant="contained-black"
          onClick={() => navigate(IMPORT_ACCOUNT)}
        >
          <div className="flex items-center justify-around px-2">
            <SendForeward className="w-6 h-6" />
            <span className="text-xl font-normal">{t("import_wallet")}</span>{" "}
            <GoChevronRight size={12} />
          </div>
        </Button>
      </div>
    </AccountFormWrapper>
  );
};

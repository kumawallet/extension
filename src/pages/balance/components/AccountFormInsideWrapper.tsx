import { type FC, useMemo, useState } from "react";
import { Button } from "@src/components/common";
import { FiChevronLeft } from "react-icons/fi";
import { CgClose } from "react-icons/cg";
import { ASteriskCircle, SendForeward } from "@src/components/icons";
import { GoChevronRight } from "react-icons/go";
import { useTranslation } from "react-i18next";

interface AccountFormInsideWrapperProps {
  onBack: () => void;
  onClose: () => void;
  onSelecteOption?: (option: 1 | 2) => void;
  Option1Component: JSX.Element;
  option1TitleContent?: string;
  option1Description?: string;
  option1Text: string;
  option1Title: string;
  hideOption1?: boolean;
  Option2Component: JSX.Element;
  option2TitleContent?: string;
  option2Description?: string;
  option2Text: string;
  option2Title: string;
  hideOption2?: boolean;
  step1Title: string;
}

export const AccountFormInsideWrapper: FC<AccountFormInsideWrapperProps> = ({
  onBack,
  onClose,
  onSelecteOption,
  Option1Component,
  option1Description,
  option1TitleContent,
  option1Text,
  option1Title,
  Option2Component,
  option2Description,
  option2TitleContent,
  option2Text,
  option2Title,
  step1Title,
  hideOption1,
  hideOption2,
}) => {
  const [step, setStep] = useState(1);
  const { t } = useTranslation("account_form");
  const [optionSelected, setOptionSelected] = useState<1 | 2 | null>(null);

  const _onSelecteOption = (option: 1 | 2) => {
    onSelecteOption?.(option);
    setOptionSelected(option);
    setStep(2);
  };

  const _onBack = () => {
    if (!optionSelected) return onBack();

    setStep(1);
    setOptionSelected(null);
  };

  const title = useMemo(() => {
    if (step === 1) return step1Title;

    if (optionSelected === 1) return option1Title;

    return option2Title;
  }, [step]);

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={_onBack}
          className="flex items-center text-base md:text-xl"
        >
          <FiChevronLeft size={18} />
          <p>{title}</p>
        </button>
        <button onClick={onClose}>
          <CgClose size={18} />
        </button>
      </div>
      {optionSelected && (
        <>
          <div
            className={`${title === "Recovery phrase" || title === "Accounts"
              ? "mt-3"
              : "mt-10"
              }`}
          >
            <p className="text-xl font-bold">
              {optionSelected === 1 ? option1TitleContent : option2TitleContent}
            </p>
          </div>
          <div
            className={`py-1 text-white opacity-80 font-extralight ${optionSelected === 1 ? "mb-0" : "mb-3"
              }`}
          >
            <p>
              {optionSelected === 1 ? option1Description : option2Description}
            </p>
          </div>
        </>
      )}

      {step === 1 ? (
        <div className="flex flex-col gap-5">
          {title === "Import Account" ? (
            <p className="text-[0.75rem] text-white opacity-80">
              {t("import_account_description")}
            </p>
          ) : null}
          {!hideOption1 && (
            <Button
              data-testid="option1-button"
              variant="contained-black"
              onClick={() => _onSelecteOption(1)}
              classname="w-full py-5"
            >
              <div className="flex items-center justify-between px-2 font-semibold ">
                <div className="flex items-center gap-2">
                  <ASteriskCircle className="w-4 h-4" />
                  <span className="text-[0.85rem]">{option1Text}</span>
                </div>
                <GoChevronRight size={12} />
              </div>
            </Button>
          )}
          {!hideOption2 && (
            <Button
              data-testid="option2-button"
              variant="contained-black"
              onClick={() => _onSelecteOption(2)}
              classname="w-full py-5"
            >
              <div className="flex items-center justify-between px-2 font-semibold">
                <div className="flex items-center gap-2">
                  <SendForeward className="w-4 h-4" />
                  <span className="text-[0.85rem]">{option2Text}</span>
                </div>
                <GoChevronRight size={12} />
              </div>
            </Button>
          )}
          {title === "Import Account" ? (
            <p className="text-[0.75rem]  text-white opacity-80">
              {t("import_account_warning")}
            </p>
          ) : null}
        </div>
      ) : (
        <div className="py-2">
          {optionSelected === 1 ? Option1Component : Option2Component}
        </div>
      )}
    </>
  );
};

import { type FC, useMemo, useState } from "react";
import { Button } from "@src/components/common";
import { FiChevronLeft } from "react-icons/fi";
import { CgClose } from "react-icons/cg";
import { ASteriskCircle, SendForeward } from "@src/components/icons";
import { GoChevronRight } from "react-icons/go";

interface AccountFormInsideWrapperProps {
  onBack: () => void;
  onClose: () => void;
  onSelecteOption?: (option: 1 | 2) => void;
  Option1Component: JSX.Element;
  option1Description?: string;
  option1Text: string;
  option1Title: string;
  Option2Component: JSX.Element;
  option2Description?: string;
  option2Text: string;
  option2Title: string;
  step1Title: string;
}

export const AccountFormInsideWrapper: FC<AccountFormInsideWrapperProps> = ({
  onBack,
  onClose,
  onSelecteOption,
  Option1Component,
  option1Description,
  option1Text,
  option1Title,
  Option2Component,
  option2Description,
  option2Text,
  option2Title,
  step1Title,
}) => {
  const [step, setStep] = useState(1);

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
        <div className="py-1 text-gray-300">
          <p className="font-poppins">
            {optionSelected === 1 ? option1Description : option2Description}
          </p>
        </div>
      )}

      {step === 1 ? (
        <div className="flex flex-col gap-5">
          <Button
            variant="contained-black"
            onClick={() => _onSelecteOption(1)}
            classname="w-full py-5"
          >
            <div className="flex items-center justify-between px-2 font-semibold">
              <div className="flex items-center gap-2">
                <ASteriskCircle className="w-4 h-4" />
                <span className="text-xs">{option1Text}</span>
              </div>
              <GoChevronRight size={12} />
            </div>
          </Button>
          <Button
            variant="contained-black"
            onClick={() => _onSelecteOption(2)}
            classname="w-full py-5"
          >
            <div className="flex items-center justify-between px-2 font-semibold">
              <div className="flex items-center gap-2">
                <SendForeward className="w-4 h-4" />
                <span className="text-xs">{option2Text}</span>
              </div>
              <GoChevronRight size={12} />
            </div>
          </Button>
        </div>
      ) : (
        <div className="py-2">
          {optionSelected === 1 ? Option1Component : Option2Component}
        </div>
      )}
    </>
  );
};

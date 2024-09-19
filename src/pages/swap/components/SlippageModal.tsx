import { FC, Fragment, useState } from "react";
import { Transition, Dialog } from "@headlessui/react";
import { Button } from "@src/components/common";
import { IoCloseOutline } from "react-icons/io5";
import { _slippage } from "./SwapInfo";
import { InputErrorMessage } from "@src/components/common";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
interface SlippageProps {
  isOpen: boolean;
  onClose: () => void;
  setSlippage: (val:number) => void;
  slippag: string
}

export interface SlippageForm {
  slippage:string
}
export const SlippageModal : FC<SlippageProps> = ({
  isOpen,
  onClose,
  setSlippage,
  slippag,
}) => {

  const { t: t } = useTranslation("account");
  const {
    register,
    formState: { errors },
    handleSubmit,
    setError,
    clearErrors,
  } = useFormContext<SlippageForm>();

  const [isValid, setIsValid] = useState<boolean>(false)

  const validateSlippage = (value: string) => {

    clearErrors("slippage");
    if(value.trim() === ""){
      setIsValid(true);
      return true
    }
    const parsedSlippage = parseFloat(value.trim());
    if (isNaN(parsedSlippage)|| value.trim().endsWith(".")) {
      setError("slippage", {
        type: "manual",
        message: "Please enter a valid number.",
      });
      setIsValid(false)
      return false;

    }
    if (parsedSlippage > 5) {
      setError("slippage", {
        type: "manual",
        message: "Slippage must be 5% or less.",
      });
      setIsValid(false)
      return false;
    }
    setIsValid(true)
    return true;
  };

  const onSubmit = (data: SlippageForm) => {
    if (data.slippage !== ""  && validateSlippage(data.slippage)) {
      const parsedSlippage = Number(data.slippage);
      setSlippage(parsedSlippage/100);
      onClose();
    }
  };

  return (

    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-20
        "
        onClose={onClose}
      >
        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex justify-center items-end min-h-full text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="relative w-full max-w-[357px] transform overflow-hidden rounded-2xl bg-[#171720]  p-3 text-left align-middle shadow-xl h-[450px] transition-all flex justify-center items-center">
                <div className="fixed bottom-0 left-0 right-0 mx-auto bg-[#333343]/50 rounded-lg p-6 pt-2 max-w-[357px] w-full">
                  <div className="w-full flex justify-between items-center mb-5 mt-4">
                    <p className="text-base">{`Slippage:  ${_slippage[String(slippag)] || `${(Number(slippag) * 100)}%` } `}</p>
                    <button
                      className="absolute text-xl top-6 text-white right-5"
                      onClick={onClose}
                    >
                      <IoCloseOutline />
                    </button>
                  </div>
                  <div className="flex flex-col  gap-y-[1rem] py-4">
                  <div className="w-full flex justify-between">
                        {
                          Object.keys(_slippage).map((key)=> (
                            <button 
                              key={key} 
                              className={`px-5 py-3 !w-[4rem] hover:bg-primary-default bg-transparent border border-[1.5px] border-[#A3A3A3] rounded-md ${slippag.toString() === key  && "!bg-primary-default"}`} 
                              onClick={() => {
                                      setSlippage(Number(key));
                                      onClose();
                                      }}
                            >
                                {_slippage[key]}
                            </button>
                          ))
                        }

                  </div>
                  
                 <div className="flex flex-col gap-y-2">
                    <div className="flex flex-col gap-1">
                        {
                          <input
                          data-testid="slippage"
                          id="slippage"
                          className="w-full mt-2 relative border border-[1.5px] border-[#A3A3A3] bg-transparent py-2 px-4 rounded-md "
                          defaultValue={""}
                          placeholder="1 - 5"
                          {...register("slippage", {
                            onChange: (e) => validateSlippage(e.target.value),
                          })}
                        /> 
                        }  
                        {errors.slippage && (
                        <InputErrorMessage message={errors.slippage.message} />
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-y-2 text-[#EBE212] text-start ">
                      <p className="text-sm">
                        {"Be cautious!"}
                      </p>
                      <p className="text-xs">
                        {
                          "Raising the slippage tolerance can increase the likelihood of your transactions being successful, but it might lead to a less favorable price. Use with caution."
                        }
                      </p>
                    </div>
                 </div>
                    

                  </div>
                  
                  
                  <div className="flex justify-between mt-[1rem] gap-1 w-full ">
                      <Button
                          classname="w-full py-2 text-[0.7rem] "
                          onClick={onClose}
                        >
                          {t("cancel")}
                      </Button>
                      <Button
                          isDisabled={!isValid}
                          classname="w-full py-2 text-[0.7rem] "
                          onClick={handleSubmit(onSubmit)}
                        >
                          {t("Apply")}
                        </Button>
                    
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

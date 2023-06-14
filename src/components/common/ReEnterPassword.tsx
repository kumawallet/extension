import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";
import { useLoading, useToast } from "@src/hooks";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import Extension from "@src/Extension";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { captureError } from "@src/utils/error-handling";

export const ReEnterPassword = ({ cb }: { cb?: () => void }) => {
  const { t } = useTranslation("re_enter_password");
  const navigate = useNavigate();
  const { isLoading, starLoading, endLoading } = useLoading();
  const { showErrorToast } = useToast();

  const [showDialog, setShowDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordType, setPasswordType] = useState("password");
  const togglePassword = () => {
    setPasswordType(passwordType === "password" ? "text" : "password");
  };

  useEffect(() => {
    (() => {
      setShowDialog(!Extension.isAuthorized());
    })();
  }, []);

  const signIn = async () => {
    starLoading();
    try {
      await Extension?.signIn(password);
      setShowDialog(false);
      await cb?.();
    } catch (error) {
      captureError(error);
      showErrorToast(error);
    }
    endLoading();
  };

  return (
    <Transition appear show={showDialog} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => null}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-custom-gray-bg p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 "
                >
                  <div className="flex items-center gap-2">
                    <FiChevronLeft
                      size={26}
                      className="cursor-pointer"
                      onClick={() => navigate(-1)}
                    />
                    <span>{t("title")}</span>
                  </div>
                </Dialog.Title>
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-400">
                    {t("re_enter_password_text")}
                  </label>
                  <div className="relative mt-4">
                    <input
                      placeholder={t("password") as string}
                      max={32}
                      value={password}
                      type={passwordType}
                      onChange={({ target }) => setPassword(target.value)}
                      className="input-primary"
                      onKeyDown={({ key }) => key === "Enter" && signIn()}
                    />
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer z-50"
                      onClick={togglePassword}
                    >
                      {passwordType === "password" ? (
                        <BsEyeSlash size={20} />
                      ) : (
                        <BsEye size={20} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={signIn}
                    isLoading={isLoading}
                    isDisabled={isLoading}
                  >
                    {t("confirm")}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

import { FC, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@src/hooks";
import { BALANCE, FORGOT_PASS } from "@src/routes/paths";
import { useTranslation } from "react-i18next";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { captureError } from "@src/utils/error-handling";
import {
  Button,
  ColoredBackground,
  Logo,
  PageWrapper,
} from "@src/components/common";
import { messageAPI } from "@src/messageAPI/api";

interface SignInProps {
  afterSignIn?: () => void;
}

export const SignIn: FC<SignInProps> = ({ afterSignIn }) => {
  const { t } = useTranslation("sign_in");
  const { t: tCommon } = useTranslation("common");

  const navigate = useNavigate();
  const { showErrorToast } = useToast();

  const [password, setPassword] = useState("");

  const [passwordType, setPasswordType] = useState("password");
  const togglePassword = () => {
    setPasswordType(passwordType === "password" ? "text" : "password");
  };

  const isValid = useMemo(() => {
    return password && password.length >= 8;
  }, [password]);

  const signIn = async () => {
    try {
      await messageAPI?.signIn({
        password,
      });
      if (afterSignIn) {
        afterSignIn();
        return;
      }
      navigate(BALANCE);
    } catch (error) {
      captureError(error);
      showErrorToast(tCommon(error as string));
    }
  };

  return (
    <PageWrapper contentClassName="bg-[#1F1432] h-[100dvh] relative !px-0 !py-0">
      <ColoredBackground />

      <div className="flex flex-col py-6 px-4">
        <Logo
          className="mx-auto mt-14 w-[14rem] h-[14rem]"
          fillClassName="fill-chain-default-primary"
          lineClassName="#070707"
        />
        <p className="font-semibold text-2xl mb-2 text-center">
          {t("welcome")}
        </p>
        <p className="font-light text-sm mb-9 text-center">
          {t("description")}
        </p>

        <div className="relative mt-3 mb-2">
          <input
            id="password"
            min={8}
            placeholder={t("password_placeholder") as string}
            onPaste={(e) => e.preventDefault()}
            type={passwordType}
            value={password}
            className="input-primary"
            onChange={({ target }) => setPassword(target.value)}
            onKeyDown={({ key }) => key === "Enter" && signIn()}
          />

          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer z-50"
            onClick={togglePassword}
          >
            {passwordType === "password" ? (
              <BsEyeSlash className="cursor-pointer" size={20} />
            ) : (
              <BsEye className="cursor-pointer" size={20} />
            )}
          </button>
        </div>

        <div className="flex">
          <Button
            classname="font-medium text-base max-w-md  w-full py-2 md:py-4 mx-auto z-10 !bg-[#040404] !text-white"
            aria-disabled={!isValid}
            isDisabled={!isValid}
            onClick={signIn}
          >
            {t("signin_button_text")}
          </Button>
        </div>
        <a
          className="text-center mb-6 z-10 cursor-pointer"
          onClick={() => navigate(FORGOT_PASS)}
        >
          {t("forgot_password")}
        </a>
      </div>
    </PageWrapper>
  );
};

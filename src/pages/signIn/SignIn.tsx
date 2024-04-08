import { FC, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@src/hooks";
import { BALANCE, FORGOT_PASS } from "@src/routes/paths";
import { useTranslation } from "react-i18next";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { PiEyeClosed } from "react-icons/pi";
import { captureError } from "@src/utils/error-handling";
import {
  Button,
  ColoredBackground,
  Logo,
  PageWrapper,
} from "@src/components/common";
import { messageAPI } from "@src/messageAPI/api";
import { styleSingIn } from "@src/pages/signIn/styles/SingIn";
import { Key } from "@src/components/icons/Key"
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
    <PageWrapper contentClassName={styleSingIn.pageWrapper}
      innerContentClassName={styleSingIn.innerWrapper}
    >
      <ColoredBackground />
      <div className={styleSingIn.containerBody}>
        <Logo
          className={styleSingIn.logo}
          fillClassName="fill-chain-default-primary"
          lineClassName="#070707"
        />
        <p className={styleSingIn.welcome}>
          {t("welcome")}
        </p>
        <p className={styleSingIn.description}>
          {t("description")}
        </p>

        <div className={styleSingIn.containerForm}>
          <input
            id="password"
            min={8}
            placeholder={t("password_placeholder") as string}
            onPaste={(e) => e.preventDefault()}
            type={passwordType}
            value={password}
            className={styleSingIn.input}
            onChange={({ target }) => setPassword(target.value)}
            onKeyDown={({ key }) => key === "Enter" && signIn()}
          />
          <Key className={styleSingIn.iconKey} />
          <button
            className={styleSingIn.inputButton}
            onClick={togglePassword}
          >
            {passwordType === "password" ? (
              <PiEyeClosed className={styleSingIn.iconEye} size={20} />
            ) : (
              <BsEye className={styleSingIn.iconEye} size={20} />
            )}
          </button>
        </div>

        <Button
          classname={styleSingIn.button}
          aria-disabled={!isValid}
          isDisabled={!isValid}
          onClick={signIn}
        >
          {t("signin_button_text")}
        </Button>
        <a
          className={styleSingIn.forgotPass}
          onClick={() => navigate(FORGOT_PASS)}
        >
          {t("forgot_password")}
        </a>
      </div>
    </PageWrapper>
  );
};

import { FC, useState } from "react";
import { PageWrapper } from "../../components/common/PageWrapper";
import { BiLeftArrowAlt } from "react-icons/bi";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FaCheckCircle } from "react-icons/fa";
import { mnemonicGenerate, mnemonicValidate } from "@polkadot/util-crypto";
import { LoadingButton } from "../../components/common/LoadingButton";
import { useLoading } from "@hooks/useLoading";
import { object, string, ref } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { InputErrorMessage } from "../../components/common/InputErroMessage";
import { AccountType } from "@src/accounts/AccountManager";
import { useTranslation } from "react-i18next";
import { useAccountContext } from "../../providers/AccountProvider";
import { useNetworkContext } from "../../providers/NetworkProvider";
import { ethers } from "ethers";

export type AccountFormType = AccountForm & { seed?: string };

interface AddAccountFormProps {
  title: string;
  fields?: {
    accountType?: boolean;
    privateKeyOrSeed?: boolean;
  };
  generateSeed?: boolean;
  signUp?: boolean;
  resetPassword?: boolean;
  onSubmitFn: (props: AccountFormType) => Promise<boolean>;
  callback?: () => void;
  buttonText: string;
  backButton?: boolean;
  goAfterSubmit: string;
  afterSubmitMessage: string;
}

export interface AccountForm {
  accountType?: AccountType;
  name: string;
  password?: string;
  confirmPassword?: string;
  privateKeyOrSeed?: string;
  isSignUp?: boolean;
  resetPassword?: boolean;
}

export const AccountForm: FC<AddAccountFormProps> = ({
  title,
  fields,
  generateSeed = false,
  signUp = true,
  resetPassword = false,
  buttonText,
  backButton,
  goAfterSubmit,
  afterSubmitMessage,
  onSubmitFn,
  callback,
}) => {
  const {
    state: { selectedChain },
  } = useNetworkContext();

  const {
    state: { selectedAccount },
  } = useAccountContext();

  const { t } = useTranslation("account_form");
  const PASSWORD_RULES = t("form.password_hint");
  const passwordIsRequired = signUp || resetPassword;

  const [passwordType, setPasswordType] = useState("password");
  const togglePassword = () => {
    if (passwordType === "password") {
      setPasswordType("text");
      return;
    }
    setPasswordType("password");
  };

  const [confirmPasswordType, setConfirmPasswordType] = useState("password");

  const toggleConfirmPassword = () => {
    if (confirmPasswordType === "password") {
      setConfirmPasswordType("text");
      return;
    }
    setConfirmPasswordType("password");
  };

  // TODO: move this to separate file
  const schema = object({
    privateKeyOrSeed:
      fields?.privateKeyOrSeed && fields?.accountType
        ? string().when("accountType", {
            is: (value: string) => value && value === "EVM",
            then: string().test(
              "evm validation",
              "invalid private key",
              (val) => {
                try {
                  new ethers.Wallet(val || "");
                } catch (e) {
                  return false;
                }
                return true;
              }
            ),
            otherwise: string().test(
              "wasm validation",
              "invalid seed",
              (val) => {
                return mnemonicValidate(val || "");
              }
            ),
          })
        : fields?.privateKeyOrSeed && !fields?.accountType
        ? string().required("required")
        : string().optional(),
    name: string().optional(),
    password: passwordIsRequired
      ? string()
          .matches(
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
            PASSWORD_RULES
          )
          .required("required!")
      : string().notRequired(),
    confirmPassword: passwordIsRequired
      ? string()
          .oneOf(
            [ref("password"), null],
            t("form.confirm_password_hint") as string
          )
          .required("required")
      : string().notRequired(),
  }).required();

  const { isLoading, endLoading, starLoading } = useLoading();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AccountForm>({
    defaultValues: {
      accountType: selectedAccount?.type || AccountType.EVM,
      confirmPassword: "",
      password: "",
      name: "",
      privateKeyOrSeed: "",
    },
    resolver: yupResolver(schema),
  });

  const _onSubmit = handleSubmit(async (data) => {
    starLoading();
    try {
      const result = await onSubmitFn({
        ...data,
        seed,
        isSignUp: passwordIsRequired,
      });

      result && setIsSuccessful(true);
      callback && callback();
    } catch (e) {
      console.error(e);
    } finally {
      endLoading();
    }
  });

  const navigate = useNavigate();

  const [isSuccessful, setIsSuccessful] = useState(false);
  const [showSeed, setShowSeed] = useState(false);
  const [seed] = useState(() => (generateSeed ? mnemonicGenerate(12) : ""));

  if (isSuccessful)
    return (
      <PageWrapper contentClassName="h-full">
        <div className="flex flex-col text-center pt-0 justify-center h-full">
          <div className="flex gap-3 items-center mb-3 justify-center">
            <p className="text-3xl text-custom-green-bg">
              {afterSubmitMessage}
            </p>
            <FaCheckCircle color="green" size={30} />
          </div>

          <button
            className="border bg-custom-green-bg text-white rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-custom-green-bg focus:outline-none focus:shadow-outline w-fit mx-auto"
            onClick={() => navigate(goAfterSubmit)}
          >
            {t("form.continue_button_text")}
          </button>
        </div>
      </PageWrapper>
    );

  return (
    <PageWrapper>
      <div className="flex gap-3 items-center">
        {backButton && (
          <BiLeftArrowAlt
            size={26}
            className="cursor-pointer"
            onClick={() => navigate(-1)}
          />
        )}
        <p className="text-xl">{title}</p>
      </div>
      <div className="flex flex-col gap-6 mt-5">
        {generateSeed && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              {t("form.seed")}
            </label>
            <div className="relative">
              <textarea
                className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white resize-none relative select-none"
                value={seed}
                aria-readonly={true}
                readOnly={true}
                disabled
                onSelect={(e) => e.preventDefault()}
                onCopy={(e) => e.preventDefault()}
              />
              {!showSeed && (
                <div className="absolute left-0 top-0 w-full h-full bg-transparent backdrop-blur-sm rounded-lg flex justify-center items-center">
                  <button
                    className="flex flex-col items-center"
                    onClick={() => setShowSeed(true)}
                  >
                    <p>{t("form.show_seed")}</p>
                    <BsEye size={18} />
                  </button>
                </div>
              )}
            </div>
            <p className="text-gray-400 p-2 px-1"> {t("form.seed_message")}</p>
          </div>
        )}
        {fields?.accountType && signUp && (
          <div>
            <label
              htmlFor="accountType"
              className="block text-sm font-medium mb-1"
            >
              {t("form.account_type")}
            </label>
            <select
              id="accountType"
              className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
              {...register("accountType")}
            >
              <option value={AccountType.EVM}>{t("form.evm_type")}</option>
              <option value={AccountType.WASM}>{t("form.wasm_type")}</option>
            </select>
          </div>
        )}
        {fields?.privateKeyOrSeed && (
          <div>
            <label
              htmlFor="privateKeyOrSeed"
              className="block text-sm font-medium mb-1"
            >
              {!resetPassword
                ? AccountType.EVM == watch("accountType")
                  ? t("form.private_key")
                  : t("form.seed_phrase")
                : t("form.recovery_phrase")}
            </label>
            <input
              id="privateKeyOrSeed"
              type={"password"}
              className=" border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
              {...register("privateKeyOrSeed")}
            />
            <InputErrorMessage message={errors.privateKeyOrSeed?.message} />
          </div>
        )}
        {!resetPassword && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              {t("form.account_name")}
            </label>
            <input
              id="name"
              placeholder={t("form.account_name_placeholder") as string}
              max={32}
              className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white "
              {...register("name")}
            />
          </div>
        )}
        {passwordIsRequired && (
          <>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1"
              >
                {t("form.password")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  min={8}
                  onPaste={(e) => e.preventDefault()}
                  type={passwordType}
                  className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-8 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                  {...register("password")}
                />

                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={togglePassword}
                >
                  {passwordType === "password" ? (
                    <BsEyeSlash size={20} />
                  ) : (
                    <BsEye size={20} />
                  )}
                </button>
              </div>

              {errors.password?.message ? (
                <InputErrorMessage message={errors.password?.message} />
              ) : (
                <p className="text-gray-400 p-2 px-1"> {PASSWORD_RULES}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-1"
              >
                {t("form.confirm_password")}
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  onPaste={(e) => e.preventDefault()}
                  type={confirmPasswordType}
                  className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                  {...register("confirmPassword")}
                />

                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={toggleConfirmPassword}
                >
                  {confirmPasswordType === "password" ? (
                    <BsEyeSlash size={20} />
                  ) : (
                    <BsEye size={20} />
                  )}
                </button>
              </div>
              <InputErrorMessage message={errors.confirmPassword?.message} />
            </div>
          </>
        )}
        <div className="flex justify-end">
          <LoadingButton onClick={_onSubmit} isLoading={isLoading}>
            {buttonText}
          </LoadingButton>
        </div>
      </div>
    </PageWrapper>
  );
};

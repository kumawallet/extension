import { FC, useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import { useForm } from "react-hook-form";
import { mnemonicGenerate, mnemonicValidate } from "@polkadot/util-crypto";
import { useLoading, useCopyToClipboard } from "@src/hooks";
import { object, string, ref } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { useAccountContext } from "@src/providers";
import { AccountType } from "@src/accounts/types";
import { getAccountType } from "@src/utils/account-utils";
import {
  InputErrorMessage,
  LoadingButton,
  PageWrapper,
  SucessMessage,
} from "@src/components/common";
import { FiChevronLeft } from "react-icons/fi";
import { ConfirmRecoveryPhrase } from "@src/components/common/confirm_recovery_phrase/ConfirmRecoveryPhrase";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export type AccountFormType = AccountForm & { seed?: string };

export interface AddAccountFormProps {
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
  const navigate = useNavigate();
  const { t } = useTranslation("account_form");
  const { t: tCommon } = useTranslation("common");
  const {
    state: { selectedAccount },
  } = useAccountContext();

  const PASSWORD_RULES = t("form.password_hint");
  const passwordIsRequired = signUp || resetPassword;

  const { isLoading, endLoading, starLoading } = useLoading();
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [showSeed, setShowSeed] = useState(false);
  const [seed] = useState(() => (generateSeed ? mnemonicGenerate(24) : ""));
  const { Icon, copyToClipboard } = useCopyToClipboard(seed);

  const [showInsertSeedStep, setShowInsertSeedStep] = useState(false);
  const [seedConfirmationIsValid, setSeedConfirmationIsValid] = useState(false);
  const [passwordType, setPasswordType] = useState("password");
  const togglePassword = () => {
    setPasswordType(passwordType === "password" ? "text" : "password");
  };

  const [confirmPasswordType, setConfirmPasswordType] = useState("password");
  const toggleConfirmPassword = () => {
    setConfirmPasswordType(
      confirmPasswordType === "password" ? "text" : "password"
    );
  };

  const submit = () => {
    if (generateSeed && !showInsertSeedStep) {
      handleSubmit(() => setShowInsertSeedStep(true))();
    } else {
      _onSubmit();
    }
  };

  const schema = object({
    privateKeyOrSeed:
      fields?.privateKeyOrSeed && fields?.accountType
        ? string().when("accountType", {
            is: (value: string) => value && value === "EVM",
            then: string().test(
              "evm validation",
              t("form.private_key_validation") as string,
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
              t("form.seed_phrasey_validation") as string,
              (val) => {
                return mnemonicValidate(val || "");
              }
            ),
          })
        : fields?.privateKeyOrSeed && !fields?.accountType
        ? string().required(t("form.required") as string)
        : string().optional(),
    name: string().optional(),
    password: passwordIsRequired
      ? string()
          .matches(
            /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/,
            PASSWORD_RULES
          )
          .required(t("form.required") as string)
      : string().notRequired(),
    confirmPassword: passwordIsRequired
      ? string()
          .oneOf(
            [ref("password"), null],
            t("form.confirm_password_hint") as string
          )
          .required(t("form.required") as string)
      : string().notRequired(),
  }).required();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AccountForm>({
    defaultValues: {
      accountType:
        (getAccountType(selectedAccount?.type) as AccountType) ||
        AccountType.EVM,
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

  if (isSuccessful)
    return (
      <SucessMessage
        title={afterSubmitMessage}
        onClick={() => navigate(goAfterSubmit)}
        buttonText={t("form.continue_button_text")}
      />
    );

  return (
    <PageWrapper>
      <div className="flex gap-3 items-center">
        {backButton && (
          <FiChevronLeft
            size={26}
            className="cursor-pointer"
            onClick={() => navigate(-1)}
          />
        )}
        <p className="text-xl">{title}</p>
      </div>
      <div className="flex flex-col gap-6 mt-5">
        {!showInsertSeedStep && (
          <>
            {generateSeed && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1"
                >
                  {t("form.recovery_phrase")}
                </label>
                <div className="relative">
                  <textarea
                    className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 h-[120px] md:h-[65px] border-gray-600 placeholder-gray-400 text-white resize-none relative select-none pr-10"
                    value={seed}
                    aria-readonly={true}
                    readOnly={true}
                    disabled
                  />
                  <button
                    className="absolute top-1/2 -translate-y-1/2 right-5"
                    onClick={copyToClipboard}
                  >
                    <Icon messagePosition="right" />
                  </button>
                  {!showSeed && (
                    <div
                      className="absolute left-0 top-0 w-full h-full bg-transparent backdrop-blur-sm rounded-lg flex justify-center items-center cursor-pointer z-50"
                      onClick={() => setShowSeed(true)}
                    >
                      <button className="flex flex-col items-center">
                        <p>{tCommon("show")}</p>
                        <BsEye size={18} />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-gray-400 p-2 px-1">
                  {" "}
                  {t("form.seed_message")}
                </p>
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
                  <option value={AccountType.WASM}>
                    {t("form.wasm_type")}
                  </option>
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
                  data-testid="privateKeyOrSeed"
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
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1"
                >
                  {t("form.account_name")}
                </label>
                <input
                  id="name"
                  placeholder={t("form.account_name_placeholder") as string}
                  max={32}
                  className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white "
                  {...register("name")}
                  onKeyDown={({ key }) =>
                    key === "Enter" && !generateSeed && submit()
                  }
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
                      data-testid="password"
                      id="password"
                      min={8}
                      onPaste={(e) => e.preventDefault()}
                      type={passwordType}
                      className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-8 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                      {...register("password")}
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
                      data-testid="confirmPassword"
                      id="confirmPassword"
                      onPaste={(e) => e.preventDefault()}
                      type={confirmPasswordType}
                      className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                      {...register("confirmPassword")}
                      onKeyDown={({ key }) => key === "Enter" && submit()}
                    />

                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer z-50"
                      onClick={toggleConfirmPassword}
                    >
                      {confirmPasswordType === "password" ? (
                        <BsEyeSlash size={20} />
                      ) : (
                        <BsEye size={20} />
                      )}
                    </button>
                  </div>
                  <InputErrorMessage
                    message={errors.confirmPassword?.message}
                  />
                </div>
              </>
            )}
          </>
        )}
        {showInsertSeedStep && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              {t("form.confirm_recovery_phrase")}
            </label>
            <DndProvider backend={HTML5Backend}>
              <ConfirmRecoveryPhrase
                seed={seed}
                confirm={(confirm: boolean) =>
                  setSeedConfirmationIsValid(confirm)
                }
              />
            </DndProvider>
          </div>
        )}
        <div className="flex justify-end" data-testid="submitbtn">
          <LoadingButton
            onClick={submit}
            isLoading={isLoading}
            isDisabled={
              (generateSeed && !showSeed) ||
              (showInsertSeedStep && !seedConfirmationIsValid)
            }
          >
            {generateSeed && !showInsertSeedStep ? t("form.next") : buttonText}
          </LoadingButton>
        </div>
      </div>
    </PageWrapper>
  );
};

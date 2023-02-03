import { FC, useState } from "react";
import { PageWrapper } from "../common/PageWrapper";
import { BiLeftArrowAlt } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { AccountType } from "@src/utils/AccountManager";
import { FaCheckCircle } from "react-icons/fa";
import { mnemonicGenerate } from "@polkadot/util-crypto";
import { LoadingButton } from "../common/LoadingButton";
import { useLoading } from "@hooks/useLoading";
import { object, string, ref } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { InputErrorMessage } from "../common/InputErroMessage";

const PASSWORD_RULES =
  "The password must contain at least eight characters, at least one number, both lower and uppercase letters and special characters.";
interface AddAccountFormProps {
  title: string;
  fields: {
    accountType?: boolean;
    privateKeyOrSeed?: boolean;
  };
  generateSeed?: boolean;
  signUp?: boolean;
  resetPassword?: boolean;
  onSubmitFn: (props: AccountForm & { seed?: string }) => Promise<boolean>;
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
  const passwordIsRequired = signUp || resetPassword;

  // TODO: move this to separate file
  const schema = object({
    name: string().required(),
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
          .oneOf([ref("password"), null], "Passwords don't match")
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
      accountType: AccountType.EVM,
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
    } finally {
      endLoading();
    }
  });

  const navigate = useNavigate();

  const [isSuccessful, setIsSuccessful] = useState(false);
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
            Continue
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
              Seed
            </label>
            <textarea
              className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white resize-none"
              value={seed}
              aria-readonly={true}
              readOnly={true}
            />
          </div>
        )}
        {fields.accountType && (
          <div>
            <label
              htmlFor="accountType"
              className="block text-sm font-medium mb-1"
            >
              Account type
            </label>
            <select
              id="accountType"
              className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
              {...register("accountType")}
            >
              <option value={AccountType.EVM}>EVM</option>
              <option value={AccountType.WASM}>WASM</option>
            </select>
          </div>
        )}
        {fields.privateKeyOrSeed && (
          <div>
            <label
              htmlFor="privateKeyOrSeed"
              className="block text-sm font-medium mb-1"
            >
              {!resetPassword
                ? AccountType.EVM == watch("accountType")
                  ? "Private Key"
                  : `Seed Phrase`
                : "Recovery Phrase"}
            </label>
            <input
              id="privateKeyOrSeed"
              type={"password"}
              className=" border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
              {...register("privateKeyOrSeed")}
            />
          </div>
        )}
        {!resetPassword && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Account Name (optional)
            </label>
            <input
              id="name"
              placeholder="Max 32 characters"
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
                Password
              </label>
              <input
                id="password"
                min={8}
                onPaste={(e) => e.preventDefault()}
                type={"password"}
                className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white "
                {...register("password")}
              />
              {errors.password?.message ? (
                <InputErrorMessage message={errors.password?.message} />
              ) : (
                <p className="text-gray-400 py-2 px-1"> {PASSWORD_RULES}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-1"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                onPaste={(e) => e.preventDefault()}
                type={"password"}
                className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
                {...register("confirmPassword")}
              />
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

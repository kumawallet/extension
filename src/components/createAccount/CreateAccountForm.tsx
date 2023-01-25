import { AccountType } from "@src/utils/handlers/AccountManager";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { AccountForm } from "./createAccount-interfaces";

interface CreateAccountFormProps {
  onSubmit: (data: AccountForm) => void;
}

export const CreateAccountForm: FC<CreateAccountFormProps> = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountForm>();
  const _onSubmit = handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <>
      <div>
        <label htmlFor="accounType" className="block text-sm font-medium mb-1">
          Account type
        </label>
        <select
          id="accounType"
          className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          {...register("accountType")}
        >
          <option value={AccountType.EVM}>EVM</option>
          <option value={AccountType.WASM}>WASM</option>
        </select>
      </div>
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Account name/alias (optional)
        </label>
        <input
          id="name"
          className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          {...register("name")}
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          id="password"
          className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          {...register("password")}
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          className="bg-gray-50 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          {...register("confirmPassword")}
        />
      </div>
      <div className="flex justify-end">
        <button
          className="border bg-custom-green-bg text-white rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-custom-green-bg focus:outline-none focus:shadow-outline"
          onClick={_onSubmit}
        >
          Create
        </button>
      </div>
    </>
  );
};

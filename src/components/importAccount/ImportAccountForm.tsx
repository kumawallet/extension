import { AccountType } from "@src/utils/AccountManager";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { ImportAccountFormType } from "./importAccount-interfaces";

interface ImportAccountFormProps {
  onSubmit: (data: ImportAccountFormType) => void;
}

export const ImportAccountForm: FC<ImportAccountFormProps> = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ImportAccountFormType>();
  const _onSubmit = handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <>
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Account Name (optional)
        </label>
        <input
          id="name"
          className="  text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white "
          {...register("name")}
        />
      </div>
      <div>
        <label htmlFor="accounType" className="block text-sm font-medium mb-1">
          Account type
        </label>
        <select
          id="accounType"
          className="  text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white "
          {...register("accountType")}
        >
          <option value={AccountType.EVM}>EVM</option>
          <option value={AccountType.WASM}>WASM</option>
        </select>
      </div>
      <div>
        <label htmlFor="privateKey" className="block text-sm font-medium mb-1">
          Private Key
        </label>
        <input
          id="privateKey"
          type={"password"}
          className=" border  text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
          {...register("privateKey")}
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          id="password"
          type={"password"}
          className=" border  text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
          {...register("password")}
        />
      </div>
      <div className="flex justify-end">
        <button
          className="border bg-custom-green-bg text-white rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-custom-green-bg focus:outline-none focus:shadow-outline"
          onClick={_onSubmit}
        >
          Import
        </button>
      </div>
    </>
  );
};

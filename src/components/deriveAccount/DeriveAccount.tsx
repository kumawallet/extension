import { AccountType } from "@src/utils/handlers/AccountManager";
import { useForm } from "react-hook-form";
import { PageWrapper } from "../common/PageWrapper";
import { DerivateAccountForm } from "./DerivateAccount-interfaces";
import Extension from "../../utils/Extension";
import { useNavigate } from "react-router-dom";

export const DeriveAccount = () => {
  const navigate = useNavigate();
  const ext = Extension.getInstance();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DerivateAccountForm>();
  const _onSubmit = handleSubmit(async (data) => {
    try {
      ext.accountType = data.accountType;
      const isCreated = await ext.derivateAccount(data.name);
      isCreated && navigate("/balance");
    } catch (error) {
      console.log(error);
    }
  });

  return (
    <PageWrapper>
      <div className="flex flex-col gap-6 mt-5">
        <div>
          <label
            htmlFor="accounType"
            className="block text-sm font-medium mb-1"
          >
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
        <div className="flex justify-end">
          <button
            className="border bg-custom-green-bg text-white rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-custom-green-bg focus:outline-none focus:shadow-outline"
            onClick={_onSubmit}
          >
            Create
          </button>
        </div>
      </div>
    </PageWrapper>
  );
};

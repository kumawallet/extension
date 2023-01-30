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
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          id="password"
          required
          type={"password"}
          className="border  text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white "
          {...register("password")}
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type={"password"}
          className=" border  text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
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

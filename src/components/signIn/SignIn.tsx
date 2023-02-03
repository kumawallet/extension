import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "../common/PageWrapper";
import Extension from "../../utils/Extension";
import { useToast } from "@src/hooks";
import { BALANCE } from "@src/routes/paths";

export const SignIn = () => {
  const navigate = useNavigate();
  const { showErrorToast } = useToast();

  const [password, setPassword] = useState("");

  const isValid = useMemo(() => {
    return password !== "";
  }, [password]);

  const signIn = async () => {
    try {
      await Extension?.signIn(password);
      navigate(BALANCE);
    } catch (error) {
      showErrorToast(error);
    }
  };

  return (
    <PageWrapper>
      <div className="flex flex-col">
        <p className="text-center text-xl mb-6">Welcome back</p>
        <input
          placeholder="password"
          onChange={({ target }) => setPassword(target.value)}
          value={password}
          className="mb-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 resize-none"
        />
        <button
          aria-disabled={!isValid}
          disabled={!isValid}
          className="border bg-custom-green-bg text-white rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-custom-green-bg focus:outline-none focus:shadow-outline w-fit mx-auto disabled:bg-gray-600"
          onClick={signIn}
        >
          Sign In
        </button>
      </div>
    </PageWrapper>
  );
};

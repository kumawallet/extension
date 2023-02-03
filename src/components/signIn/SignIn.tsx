import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "../common/PageWrapper";
import Extension from "../../utils/Extension";
import { useToast } from "@src/hooks";
import { BALANCE, RESTORE_PASSWORD } from "@src/routes/paths";
import logo from "@src/assets/img/logo.svg";

export const SignIn = () => {
  const navigate = useNavigate();
  const { showErrorToast } = useToast();

  const [password, setPassword] = useState("");

  const isValid = useMemo(() => {
    return password && password.length >= 8;
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
        <img src={logo} className="mx-auto mt-20 mb-5 w-36 md:w-40" />
        <p className="text-center text-xl mb-6">Welcome back</p>
        <input
          id="password"
          min={8}
          placeholder="Type your password"
          onPaste={(e) => e.preventDefault()}
          type={"password"}
          value={password}
          className="mb-10 border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white "
          onChange={({ target }) => setPassword(target.value)}
        />
        <button
          aria-disabled={!isValid}
          disabled={!isValid}
          className="mb-4 border bg-custom-green-bg text-white rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-custom-green-bg focus:outline-none focus:shadow-outline w-fit mx-auto disabled:bg-gray-600"
          onClick={signIn}
        >
          Sign In
        </button>
        <p className="text-center mb-6" onClick={() => navigate(RESTORE_PASSWORD)}>Forgot password?</p>
      </div>
    </PageWrapper>
  );
};

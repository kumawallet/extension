import { useEffect, useState } from "react";
import { mnemonicGenerate } from "@polkadot/util-crypto";
import { PageWrapper } from "../common/PageWrapper";
import { BiLeftArrowAlt } from "react-icons/bi";
import Extension from "@src/utils/Extension";
import { CreateAccountForm } from "./CreateAccountForm";
import { AccountForm } from "./createAccount-interfaces";
import { CreateAccountMessage } from "./CreateAccountMessage";
import { useNavigate } from "react-router-dom";

export const CreateAccount = () => {
  const navigate = useNavigate();
  const [seed, setSeed] = useState<null | string>(null);
  const [isCreated, setIsCreated] = useState(false);

  useEffect(() => {
    try {
      const seed = mnemonicGenerate(12);
      setSeed(seed);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const createAccount = (data: AccountForm) => {
    console.log(data);
    const { name, password, accounType } = data;
    try {
      const ext = new Extension({}, accounType);
      ext.createAccount({ password, seed });
      setIsCreated(true);
    } catch (error) {
      console.log(error);
    }
  };

  if (isCreated) return <CreateAccountMessage />;

  return (
    <PageWrapper>
      <div className="flex gap-3 items-center">
        <BiLeftArrowAlt
          size={26}
          className="cursor-pointer"
          onClick={() => navigate(-1)}
        />
        <p className="text-xl">create account</p>
      </div>
      <div className="flex flex-col gap-6 mt-5">
        <div>
          <label
            htmlFor="seed"
            className="block text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Seed
          </label>
          <textarea
            disabled
            id="seed"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 resize-none"
            value={seed || ""}
          />
        </div>
        <CreateAccountForm onSubmit={createAccount} />
      </div>
    </PageWrapper>
  );
};

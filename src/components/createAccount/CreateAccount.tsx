import { useEffect, useState } from "react";
import { mnemonicGenerate } from "@polkadot/util-crypto";
import { PageWrapper } from "../common/PageWrapper";
import { BiLeftArrowAlt } from "react-icons/bi";
import Extension, { AccountType } from "@src/utils/Extension";

export const CreateAccount = () => {
  const [seed, setSeed] = useState<null | string>(null);
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState(AccountType.EVM);

  useEffect(() => {
    try {
      const seed = mnemonicGenerate(12);
      setSeed(seed);
    } catch (error) {
      console.log(error);
    }
  }, []);

  const createAccount = () => {
    if (seed && password) {
      try {
        const ext = new Extension({}, accountType);
        ext.createAccount({ password, seed });

        console.log("created");
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <PageWrapper>
      <div className="flex gap-3 items-center">
        <BiLeftArrowAlt size={26} />
        <p className="text-xl">create account</p>
      </div>
      <div className="flex flex-col gap-6 mt-5">
        <label
          htmlFor="first_name"
          className="block text-sm font-medium text-gray-900 dark:text-gray-300"
        >
          Account type
        </label>
        <select
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          value={accountType}
          onChange={({ target }) => setAccountType(target.value as AccountType)}
        >
          <option value={AccountType.EVM}>evm</option>
          <option value={AccountType.WASM}>wasm</option>
        </select>
        <div>
          <label
            htmlFor="first_name"
            className="block text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Mnemonic
          </label>
          <textarea
            disabled
            id="first_name"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={seed || ""}
          />
        </div>
        <div>
          <label
            htmlFor="first_name"
            className="block text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            Password
          </label>
          <input
            id="first_name"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <div className="flex justify-end">
          <button className="bg-custom-green-bg" onClick={createAccount}>
            create
          </button>
        </div>
      </div>
    </PageWrapper>
  );
};

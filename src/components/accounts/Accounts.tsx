import { useEffect, useState } from "react";
import Extension from "../../utils/Extension";
import { useNavigate } from "react-router-dom";

export const Accounts = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<any>([]);

  useEffect(() => {
    getAllAccounts();
  }, []);

  const getAllAccounts = async () => {
    const ext = Extension.getInstance();
    const accounts = await ext.getAllAccounts();
    setAccounts(accounts);
  };

  const changeSelectedAccount = (account: any) => {
    console.log(`new account will be:`, account);
  };

  return (
    <>
      <div className="flex justify-between mb-6 mt-3">
        <button
          onClick={() => navigate("/derive-import")}
          className="border border-custom-green-bg text-white rounded-xl py-2 transition duration-500 ease select-none hover:bg-custom-green-bg focus:outline-none focus:shadow-outline w-[40%]"
        >
          Import
        </button>
        <button
          onClick={() => navigate("/derive-account")}
          className="border border-custom-green-bg text-white rounded-xl py-2 transition duration-500 ease select-none hover:bg-custom-green-bg focus:outline-none focus:shadow-outline w-[40%]"
        >
          Create
        </button>
      </div>
      <div className="flex flex-col gap-5">
        {accounts.map(({ address, type, name, key }: any, index) => (
          <div
            key={address}
            className={`${
              index === 0 && "bg-gray-400 bg-opacity-30"
            }  bg-opacity-30 flex justify-between rounded-lg py-2 px-4 text-white cursor-pointer`}
            onClick={() => changeSelectedAccount({ address, type, name, key })}
          >
            <p className="w-3/4 overflow-hidden text-ellipsis">
              <p className="text-cl">{name}</p>
              <p>{address}</p>
            </p>
            <p>{type}</p>
          </div>
        ))}
      </div>
    </>
  );
};

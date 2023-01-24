import { useEffect, useState } from "react";
import Extension from "../../utils/Extension";
import { PageWrapper } from "../common/PageWrapper";
import { BsArrowLeftShort } from "react-icons/bs";
import { useNavigate } from "react-router-dom";

export const Accounts = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    getAllAccounts();
  }, []);

  const getAllAccounts = async () => {
    const ext = new Extension({});
    const accounts = await ext.getAllAccounts();
    setAccounts(accounts);
  };

  return (
    <PageWrapper>
      <div className="flex items-center mb-14 gap-3">
        <BsArrowLeftShort
          size={24}
          onClick={() => navigate(-1)}
          className="cursor-pointer"
        />
        <p className="font-medium text-2xl">Accounts</p>
      </div>
      <div className="flex justify-between mb-6 mt-3">
        <button className="border bg-custom-green-bg text-white rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-custom-green-bg focus:outline-none focus:shadow-outline w-[40%]">
          Import
        </button>
        <button className="border bg-custom-green-bg text-white rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-custom-green-bg focus:outline-none focus:shadow-outline w-[40%]">
          Create
        </button>
      </div>
      <div>
        {accounts.map((account, index) => {
          const address = Object.keys(account)[0];
          const type = account[address].accountType;
          return (
            <div
              key={index.toString()}
              className="bg-gray-400 bg-opacity-30 flex justify-between rounded-lg py-2 px-4 text-white text-xl"
            >
              <p className="w-3/4 overflow-hidden text-ellipsis">{address}</p>
              <p>{type}</p>
            </div>
          );
        })}
      </div>
    </PageWrapper>
  );
};

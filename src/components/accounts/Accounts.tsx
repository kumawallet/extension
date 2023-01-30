import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAccountContext } from "@src/providers";
import { Menu } from "@headlessui/react";

export const Accounts = () => {
  const navigate = useNavigate();
  const {
    state: { selectedAccount, accounts },
    getAllAccounts,
    setSelectedAccount,
  } = useAccountContext();

  useEffect(() => {
    getAllAccounts();
  }, []);

  const changeSelectedAccount = (account: any) => {
    setSelectedAccount(account);
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
        <Menu.Item>
          {({ close }) => (
            <>
              {accounts.map(({ address, name, type, key }: any, index) => (
                <div
                  key={address}
                  className={`${
                    selectedAccount?.value?.address === address &&
                    "bg-gray-400 bg-opacity-30"
                  }  bg-opacity-30 flex justify-between rounded-lg py-2 px-4 text-white cursor-pointer`}
                  onClick={() => {
                    changeSelectedAccount({ address, type, name, key });
                    close();
                  }}
                >
                  <p className="w-3/4 overflow-hidden text-ellipsis">
                    <p className="text-cl">{name}</p>
                    <p>{address}</p>
                  </p>
                  <p>{type}</p>
                </div>
              ))}
            </>
          )}
        </Menu.Item>
      </div>
    </>
  );
};

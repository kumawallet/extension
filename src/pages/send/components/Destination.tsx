import { FC, useEffect, useState } from "react";
import { Listbox } from "@headlessui/react";
import Extension from "@src/Extension";
import { useAccountContext } from "@src/providers";

interface DestionationProps {
  onSelectedAccount: (address: string) => void;
}

export const Destination: FC<DestionationProps> = ({ onSelectedAccount }) => {
  const [destination, setDestination] = useState({});
  const [accountToSelect, setAccountToSelect] = useState([]);

  const {
    state: { accounts, selectedAccount },
  } = useAccountContext();

  useEffect(() => {
    (async () => {
      const data = await Extension.getContacts();
      const _accounts = await accounts
        .filter((acc) => acc.key !== selectedAccount.key)
        .map((acc) => acc.value);
      setAccountToSelect([...data, ..._accounts]);
    })();
  }, [accounts]);

  const onChangeAccount = (account) => {
    onSelectedAccount?.(account);
    setDestination(account);
  };

  return (
    <Listbox value={destination} onChange={onChangeAccount}>
      <div className="relative mt-1">
        <Listbox.Button className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 flex w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white">
          {destination ? (
            <div className="text-start min-h-[40px] w-full">
              <p>{destination.name}</p>
              <p className="text-sm overflow-hidden text-ellipsis">
                {destination.address}
              </p>
            </div>
          ) : (
            ""
          )}
        </Listbox.Button>
        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-[#212529] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50">
          {accountToSelect.map((account, index) => (
            <Listbox.Option
              key={index.toString()}
              value={account}
              className="px-2 hover:bg-gray-400 hover:bg-opacity-50 cursor-pointer rounded-md overflow-hidden"
            >
              <div>
                <p>{account.name}</p>
                <p className="text-gray-400 text-sm text-ellipsis overflow-hidden">
                  {account.address}
                </p>
              </div>
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
};

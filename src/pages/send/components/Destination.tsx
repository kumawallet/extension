import { FC, useEffect, useState, useMemo } from "react";
import { Combobox } from "@headlessui/react";
import Extension from "@src/Extension";

interface DestionationProps {
  onSelectedAccount: (address: string) => void;
}

export const Destination: FC<DestionationProps> = ({ onSelectedAccount }) => {
  const [destination, setDestination] = useState({});
  const [accountToSelect, setAccountToSelect] = useState<any>([]);
  const [isOpenOptions, setisOpenOptions] = useState(false);

  useEffect(() => {
    (async () => {
      const { contacts, ownAccounts, recent } =
        await Extension.getRegistryAddresses();
      setAccountToSelect([
        {
          label: "recent",
          values: recent,
        },
        {
          label: "contacts",
          values: contacts,
        },
        {
          label: "own accounts",
          values: ownAccounts,
        },
      ]);
    })();
  }, []);

  const onChangeAccount = (account: any) => {
    let _account = account;
    if (typeof _account === "string") {
      _account = { address: account };
    }
    onSelectedAccount?.(_account);
    setDestination(_account);
  };

  const filteredAddresses = useMemo(() => {
    if (accountToSelect.length === 0) return [];
    if (!destination?.address) return accountToSelect || [];

    const [recent, contacts, ownAccounts] = accountToSelect;

    const filters = [];

    const filterdRecent = recent.values.filter((v) =>
      v?.address
        ?.toLowerCase()
        .includes(destination.address.toLowerCase() || "")
    );
    const filterdContacts = contacts.values.filter((v) =>
      v?.address
        ?.toLowerCase()
        .includes(destination.address.toLowerCase() || "")
    );
    const filterdOwnAccounts = ownAccounts.values.filter((v) =>
      v?.address
        ?.toLowerCase()
        .includes(destination.address.toLowerCase() || "")
    );

    filterdRecent.length > 0 &&
      filters.push({
        label: "recent",
        values: filterdRecent,
      });

    filterdContacts.length > 0 &&
      filters.push({
        label: "contacts",
        values: filterdContacts,
      });

    filterdOwnAccounts.length > 0 &&
      filters.push({
        label: "contacts",
        values: filterdOwnAccounts,
      });

    return filters;
  }, [accountToSelect, destination]);

  return (
    <Combobox value={destination} onChange={onChangeAccount}>
      <div className="relative mt-1">
        <Combobox.Input
          className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 flex w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
          onChange={({ target }) => onChangeAccount(target.value)}
          displayValue={(dest) => {
            if (typeof dest === "string") {
              return dest;
            }

            return dest?.address || "";
          }}
          onClick={() => setisOpenOptions(true)}
          onBlur={() => {
            setTimeout(() => {
              setisOpenOptions(false);
            }, 100);
          }}
        />
        {filteredAddresses.length > 0 && (
          <Combobox.Options
            static={isOpenOptions}
            className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-[#212529] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50"
          >
            {filteredAddresses.map(
              (type) =>
                type.values?.length > 0 && (
                  <>
                    <p className="px-2 text-[#808385] text-sm">{type.label}</p>
                    {type.values.map((acc) => (
                      <>
                        <Combobox.Option
                          key={acc.id}
                          value={acc}
                          className="px-2 hover:bg-gray-400 hover:bg-opacity-50 cursor-pointer rounded-md overflow-hidden"
                          onClick={() => setisOpenOptions(false)}
                        >
                          <p>{acc.name}</p>
                          <p className="text-gray-400 text-sm text-ellipsis overflow-hidden">
                            {acc.address}
                          </p>{" "}
                        </Combobox.Option>
                      </>
                    ))}
                  </>
                )
            )}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
};

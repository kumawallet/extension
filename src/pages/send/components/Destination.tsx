import { FC, useEffect, useState, useMemo } from "react";
import { Combobox } from "@headlessui/react";
import Extension from "@src/Extension";
import { useFormContext } from "react-hook-form";

interface DestionationProps {
  onSelectedAccount: (address: string) => void;
}

export const Destination: FC<DestionationProps> = ({ onSelectedAccount }) => {
  const { register, setValue } = useFormContext();
  const { onBlur, onChange, ...r } = register("destinationAccount");

  const [destination, setDestination] = useState({
    name: "",
    address: "",
  });
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

    const filterdRecent = recent.values.filter((v: any) =>
      v?.address
        ?.toLowerCase()
        .includes(destination.address.toLowerCase() || "")
    );
    const filterdContacts = contacts.values.filter((v: any) =>
      v?.address
        ?.toLowerCase()
        .includes(destination.address.toLowerCase() || "")
    );
    const filterdOwnAccounts = ownAccounts.values.filter((v: any) =>
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
    <Combobox
      value={destination}
      onChange={(value) => {
        onChangeAccount(value);
        setValue("destinationAccount", value?.address || "");
      }}
    >
      <div className="relative mt-1">
        <Combobox.Input
          autoComplete="off"
          className="text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 flex w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
          onChange={({ target, type }) => {
            onChangeAccount(target.value);
            onChange({ target, type });
          }}
          {...r}
          displayValue={(dest: any) => {
            if (typeof dest === "string") {
              return dest;
            }

            return dest?.address || "";
          }}
          onClick={() => setisOpenOptions(true)}
          onBlur={() => {
            setTimeout(() => {
              setisOpenOptions(false);
            }, 200);
          }}
        />
        {filteredAddresses.length > 0 && (
          <Combobox.Options
            static={isOpenOptions}
            className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-[#212529] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-50 px-2"
          >
            {filteredAddresses.map(
              (type: any) =>
                type.values?.length > 0 && (
                  <div key={type.label}>
                    <div className="flex items-center gap-3 whitespace-nowrap">
                      <p className="text-[#808385] text-lg">{type.label}</p>
                      <div className="h-[1px] w-full bg-[#343A40]" />
                    </div>
                    {type.values.map((acc: any) => (
                      <Combobox.Option
                        key={acc.address}
                        value={acc}
                        className="hover:bg-gray-400 hover:bg-opacity-50 cursor-pointer rounded-md overflow-hidden px-1 py-1"
                        onClick={() => setisOpenOptions(false)}
                      >
                        <p className="font-light text-gray-100">{acc.name}</p>
                        <p className="text-gray-100 font-light text-sm text-ellipsis overflow-hidden">
                          {acc.address}
                        </p>{" "}
                      </Combobox.Option>
                    ))}
                  </div>
                )
            )}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
};

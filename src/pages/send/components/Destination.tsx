import { useEffect, useState, useMemo } from "react";
import { Combobox } from "@headlessui/react";
import Extension from "@src/Extension";
import { useFormContext } from "react-hook-form";
import { useAccountContext, useNetworkContext } from "@src/providers";
import { transformAddress } from "@src/utils/account-utils";
import { isHex } from "@polkadot/util";

export const Destination = () => {
  const {
    state: { selectedChain },
  } = useNetworkContext();
  const {
    state: { selectedAccount },
  } = useAccountContext();

  const { register } = useFormContext();

  const [destinationAddress, setDestinationAddress] = useState("");

  const [accountToSelect, setAccountToSelect] = useState<any>([]);
  const [isOpenOptions, setisOpenOptions] = useState(false);

  useEffect(() => {
    if (selectedAccount.key && selectedChain?.name) {
      (async () => {
        const { contacts, ownAccounts, recent } =
          await Extension.getRegistryAddresses();

        const _ownAccounts = ownAccounts
          .map((acc) =>
            !isHex(acc.address)
              ? {
                  name: acc.name,
                  address: transformAddress(
                    acc.address,
                    selectedChain?.addressPrefix
                  ),
                }
              : acc
          )
          .filter((acc) => acc.address !== selectedAccount.value.address);

        const _contacts = contacts.map((acc) =>
          !isHex(acc.address)
            ? {
                name: acc.name,
                address: transformAddress(
                  acc.address,
                  selectedChain?.addressPrefix
                ),
              }
            : acc
        );

        const _recent = recent.map((acc) =>
          !isHex(acc.address)
            ? {
                address: transformAddress(
                  acc.address,
                  selectedChain?.addressPrefix
                ),
              }
            : acc
        );

        setAccountToSelect([
          {
            label: "recent",
            values: _recent,
          },
          {
            label: "contacts",
            values: _contacts,
          },
          {
            label: "own accounts",
            values: _ownAccounts,
          },
        ]);
      })();
    }
  }, [selectedAccount?.key, selectedChain?.name]);

  const onChangeAccount = (account: string) => {
    setDestinationAddress(account);
  };

  const filteredAddresses = useMemo(() => {
    if (accountToSelect.length === 0 || !selectedAccount?.value?.address)
      return [];
    if (!destinationAddress) return accountToSelect || [];

    const [recent, contacts, ownAccounts] = accountToSelect;

    const filters = [];

    const filterdRecent = recent.values.filter((v: any) =>
      v?.address?.toLowerCase().includes(destinationAddress.toLowerCase() || "")
    );
    const filterdContacts = contacts.values.filter((v: any) =>
      v?.address?.toLowerCase().includes(destinationAddress.toLowerCase() || "")
    );
    const filterdOwnAccounts = ownAccounts.values.filter((v: any) =>
      v?.address?.toLowerCase().includes(destinationAddress.toLowerCase() || "")
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
  }, [accountToSelect, destinationAddress, selectedAccount?.value?.address]);

  const { onChange, ...r } = { ...register("destinationAccount") };

  return (
    <Combobox
      value={destinationAddress}
      onChange={(value) => {
        onChangeAccount(value);
        onChange({
          target: {
            name: "destinationAccount",
            value,
          },
          type: "string",
        });
      }}
    >
      <div className="relative mt-1">
        <Combobox.Input
          autoComplete="off"
          className="bg-[#343A40] text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 flex w-full p-2.5  border-gray-600 placeholder-gray-400 text-white"
          {...r}
          onChange={({ target, type }) => {
            onChangeAccount(target.value);
            onChange({ target, type });
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
            className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-[#212529] py-1  shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 px-2"
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
                        value={acc.address}
                        className="hover:bg-gray-400 hover:bg-opacity-20 cursor-pointer rounded-md overflow-hidden px-1 py-1 font-extralight text-sm text-gray-300"
                        onClick={() => setisOpenOptions(false)}
                      >
                        <p>{acc.name}</p>
                        <p className="text-ellipsis overflow-hidden">
                          {acc.address}
                        </p>
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

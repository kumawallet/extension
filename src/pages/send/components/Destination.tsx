import { useEffect, useState, useMemo } from "react";
import { Combobox } from "@headlessui/react";
import Extension from "@src/Extension";
import { useFormContext } from "react-hook-form";
import { useAccountContext, useNetworkContext } from "@src/providers";
import Contact from "@src/storage/entities/registry/Contact";
import { captureError } from "@src/utils/error-handling";
import { useToast } from "@src/hooks";
import { useTranslation } from "react-i18next";
import Register from "@src/storage/entities/registry/Register";
import { Chain } from "@src/storage/entities/Chains";
import { AccountType } from "@src/accounts/types";
import { isHex } from "@polkadot/util";
import { transformAddress } from "@src/utils/account-utils";


const filterAddress = (account: Register | Contact, type: AccountType) => {
  const address = account.address;

  if (isHex(address) && type.includes("EVM")) return true

  if (!isHex(address) && type.includes("WASM")) return true

  return false
}

export const Destination = () => {
  const { showErrorToast } = useToast();
  const { t } = useTranslation("common");
  const {
    state: { selectedChain, type },
  } = useNetworkContext();
  const {
    state: { selectedAccount },
  } = useAccountContext();

  const { register, watch } = useFormContext();

  const [destinationAddress, setDestinationAddress] = useState("");

  const [accountToSelect, setAccountToSelect] = useState<{ label: string, values: Contact[] | Register[] }[]>([]);
  const [isOpenOptions, setisOpenOptions] = useState(false);

  const isXcm = watch("isXcm");
  const to = watch("to");

  useEffect(() => {
    if (selectedAccount.key && selectedChain?.name && to.name) {
      (async () => {
        try {
          const { contacts, ownAccounts, recent } =
            await Extension.getRegistryAddresses();

          let _ownAccounts: Contact[] = [];

          _ownAccounts = !isXcm ? ownAccounts.filter(
            (acc) => acc.name !== selectedAccount.value.name
          ) : ownAccounts

          const filterByType = (to as Chain).supportedAccounts.includes(type as AccountType) ? type as AccountType : (to as Chain).supportedAccounts[0] as AccountType;

          setAccountToSelect([
            {
              label: "recent",
              values: recent.filter((v) => filterAddress(v, filterByType))
            },
            {
              label: "contacts",
              values: contacts.filter((v) => filterAddress(v, filterByType)),
            },
            {
              label: "own accounts",
              values: _ownAccounts.filter((v) => filterAddress(v, filterByType)).map(v => ({
                ...v, address: transformAddress(
                  v?.address,
                  selectedChain?.addressPrefix
                )
              })),
            },
          ]);

        } catch (error) {
          captureError(error);
          showErrorToast(t("failed_to_get_addresses"));
        }
      })();
    }
  }, [selectedAccount?.key, selectedChain?.name, isXcm, type, to?.name]);



  const onChangeAccount = (account: string) => {
    setDestinationAddress(account);
  };

  const filteredAddresses = useMemo(() => {
    if (accountToSelect.length === 0 || !selectedAccount?.value?.address)
      return [];
    if (!destinationAddress) return accountToSelect || [];

    const [recent, contacts, ownAccounts] = accountToSelect;

    const filters = [];

    const filterdRecent = (recent.values as Register[]).filter((v: { address: string }) =>
      v?.address?.toLowerCase().includes(destinationAddress.toLowerCase() || "")
    );
    const filterdContacts = (contacts.values as Contact[]).filter((v: { address: string }) =>
      v?.address?.toLowerCase().includes(destinationAddress.toLowerCase() || "")
    );
    const filterdOwnAccounts = (ownAccounts.values as Contact[]).filter(
      (v: { address: string }) =>
        v?.address
          ?.toLowerCase()
          .includes(destinationAddress.toLowerCase() || "")
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
        label: "own accounts",
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
          data-testid="destination-input"
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
            data-testid="destination-options"
            static={isOpenOptions}
            className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-[#212529] py-1  shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 px-2"
          >
            {filteredAddresses.map(
              (type: {
                label: string;
                values: Register[] | Contact[];
              }) =>
                type.values?.length > 0 && (
                  <div key={type.label}>
                    <div className="flex items-center gap-3 whitespace-nowrap">
                      <p className="text-[#808385] text-lg">{type.label}</p>
                      <div className="h-[1px] w-full bg-[#343A40]" />
                    </div>
                    {type.values.map(
                      (acc: Register | Contact) => (
                        <Combobox.Option
                          key={acc.address}
                          value={acc.address}
                          className="hover:bg-gray-400 hover:bg-opacity-20 cursor-pointer rounded-md overflow-hidden px-1 py-1 font-extralight text-sm text-gray-300"
                          onClick={() => setisOpenOptions(false)}
                        >
                          <p>{'name' in acc ? acc.name : ""}</p>
                          <p className="text-ellipsis overflow-hidden">
                            {acc.address}
                          </p>
                        </Combobox.Option>
                      )
                    )}
                  </div>
                )
            )}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
};

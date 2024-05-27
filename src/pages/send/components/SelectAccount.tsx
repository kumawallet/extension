import { FC, useMemo, useState } from "react";
import { useAccountContext } from "@src/providers";
import { RiWallet3Line } from "react-icons/ri";
import { HiOutlineChevronDown } from "react-icons/hi";
import { SelectableOptionModal } from "@src/components/common";
import { useTranslation } from "react-i18next";
import { GoCheckCircle, GoCircle } from "react-icons/go";
import { cropAccount, iconURL } from "@src/utils/account-utils";



interface SelectAccountProps {
  selectedAddress: string | null;
  onChangeValue: (address: string) => void;
}

export const SelectAccount: FC<SelectAccountProps> = ({
  onChangeValue,
  selectedAddress,
}) => {
  const { t } = useTranslation("send");
  const {
    state: { selectedAccount, accounts },
  } = useAccountContext();

  const formattedAccounts = accounts.map((account) => ({
    name: account.value?.name as string,
    address: account.value?.address as string,
    symbol: iconURL(account.type),
  }));

  const [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const selectedAccont = useMemo(() => {
    return accounts.find(
      (account) => account.value?.address === selectedAddress
    );
  }, [accounts, selectedAddress, formattedAccounts]);

  if (selectedAccount?.value) return null;

  return (
    <>
      <div
        onClick={openModal}
        className="flex items-center text-sm gap-1 w-full bg-[#1C1C27] text-white px-2 py-4  rounded-lg"
      >
        <div className="flex items-center gap-3 flex-1">
          <RiWallet3Line size={16} />

          {!selectedAccont?.value ? (
            <span>{t("select_account")}</span>
          ) : (
            <div className="flex flex-col overflow-x-hidden">
              <span className="text-xs inline-flex">{selectedAccont.value?.name}</span>
              <span className="text-xs inline-flex">{cropAccount(selectedAccont.value?.address as string, 12)}</span>
            </div>
          )}
        </div>
        {!selectedAccont && <HiOutlineChevronDown size={18} />}
      </div>

      <SelectableOptionModal<{ address: string; symbol: string; name: string }>
        isOpen={isOpen}
        items={formattedAccounts}
        closeModal={closeModal}
        emptyMessage="No items"
        title={t("select_account")}
        filterBy={["address"]}
        Item={({ item }) => (
          <button
            onClick={() => {
              onChangeValue(item.address);
              closeModal();
            }}
            className="flex items-center bg-[#1C1C27] hover:bg-gray-500 hover:bg-opacity-30 w-full py-2 px-4 rounded-xl overflow-hidden"
          >
            <div className="flex flex-1 gap-2 items-center">
              <img src={item.symbol} width={18} className="rounded-full" />

              <div className="flex flex-col overflow-x-hidden">
                <span className="inline-flex" >{item.name}</span>
                <span className="inline-flex">{cropAccount(item.address, 12)}</span>
              </div>
            </div>
            <div>
              {selectedAccont?.value?.address === item.address ? (
                <GoCheckCircle size={16} color="#2CEC84" />
              ) : (
                <GoCircle size={16} color="#AEAEB2" />
              )}
            </div>
          </button>
        )}
      />
    </>
  );
};

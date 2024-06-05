import { SelectableOptionModal } from "@src/components/common";
import Contact from "@src/storage/entities/registry/Contact";
import { FC, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SendTxForm } from "../Send";
import { LiaBookSolid } from "react-icons/lia";
import { getHash } from "@src/utils/transactions-utils";

interface AddressBookProps {
  contacts: Contact[];
  isLoading: boolean;
}

export const AddressBook: FC<AddressBookProps> = ({ contacts, isLoading }) => {
  const { t } = useTranslation("send");

  const { setValue } = useFormContext<SendTxForm>();

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        data-testid="open-address-book"
        className="flex items-center gap-1 text-[#7C4DC4] text-xs font-medium"
        onClick={() => setIsModalOpen(true)}
      >
        <LiaBookSolid size={16} />
        <span>{t("address_book")}</span>
      </button>
      <SelectableOptionModal<Contact>
        isOpen={isModalOpen}
        items={contacts}
        closeModal={() => setIsModalOpen(false)}
        emptyMessage={t("no_contacts")}
        isLoading={isLoading}
        filterBy={["name", "address"]}
        Item={({ item }) => (
          <button
            data-testid="select-contact"
            className="flex flex-col bg-[#1C1C27] hover:bg-gray-500 hover:bg-opacity-30 w-full p-2 rounded-xl"
            onClick={() => {
              setValue("recipientAddress", item.address);
              setIsModalOpen(false);
            }}
          >
            <span>{item.name}</span>
            <span>{getHash(item.address)}</span>
          </button>
        )}
      />
    </>
  );
};

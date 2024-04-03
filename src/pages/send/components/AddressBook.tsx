import { SelectableOptionModal } from "@src/components/common";
import { useLoading } from "@src/hooks";
import { messageAPI } from "@src/messageAPI/api";
import Contact from "@src/storage/entities/registry/Contact";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SendTxForm } from "../Send";
import { LiaBookSolid } from "react-icons/lia";

export const AddressBook = () => {
  const { t } = useTranslation("send");

  const { setValue } = useFormContext<SendTxForm>();

  const { isLoading, starLoading, endLoading } = useLoading();

  const [contacts, setContacts] = useState<Contact[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      starLoading();
      try {
        const { contacts } = await messageAPI.getRegistryAddresses();

        setContacts(contacts);
      } catch (error) {
        console.log("error_loading_contacts");
      }
      endLoading();
    })();
  }, []);

  return (
    <>
      <button
        data-testid="open-address-book"
        className="flex items-center gap-1 text-[#7C4DC4]"
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
        Item={({ item }) => (
          <button
            data-testid="select-contact"
            className="flex flex-col hover:bg-gray-500 hover:bg-opacity-30 w-full p-2"
            onClick={() => {
              setValue("recipientAddress", item.address);
              setIsModalOpen(false);
            }}
          >
            <span>{item.name}</span>
            <span>{item.address}</span>
          </button>
        )}
      />
    </>
  );
};

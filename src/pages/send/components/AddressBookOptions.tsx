import { useEffect, useState } from "react";
import { AddressBook } from "./AddressBook";
import { AddAddress } from "./AddAddress";
import Contact from "@src/storage/entities/registry/Contact";
import { useLoading } from "@src/hooks";
import { messageAPI } from "@src/messageAPI/api";

export const AddressBookOptions = () => {
  const { isLoading, starLoading, endLoading } = useLoading();

  const [contacts, setContacts] = useState<Contact[]>([]);

  const loadContacts = async () => {
    starLoading();
    try {
      const { accounts } = await messageAPI.getRegistryAddresses();

      setContacts(accounts);
    } catch (error) {
      console.log("error_loading_contacts");
    }
    endLoading();
  };

  useEffect(() => {
    loadContacts();
  }, []);

  return (
    <div className="flex items-center justify-end gap-4">
      <AddressBook
        contacts={contacts}
        isLoading={isLoading}
      />
      <AddAddress onSaveContact={loadContacts} />
    </div>
  );
};

import { ICON_SIZE } from "@src/constants/icons";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@src/components/common/PageWrapper";
import { Contact } from "@src/storage/entities/Registry";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@src/hooks";
import Extension from "@src/Extension";
import { Loading } from "@src/components/common";
import { BsPlus, BsTrash } from "react-icons/bs";

export const Contacts = () => {
  const { t } = useTranslation("contacts");
  const { t: tCommon } = useTranslation("common");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateContact, setIsCreateContact] = useState(false);
  const [contacts, setContacts] = useState([] as Contact[]);
  const [search, setSearch] = useState("" as string);
  const { showErrorToast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    getContacts();
  }, []);

  const getContacts = async () => {
    try {
      const contacts = await Extension.getContacts();
      setContacts(contacts);
    } catch (error) {
      setContacts([]);
      showErrorToast(tCommon(error as string));
    } finally {
      setIsLoading(false);
    }
  };

  const saveContact = async (name: string, address: string) => {
    try {
      if (!name) throw new Error("name_required");
      if (!address) throw new Error("address_required");
      const contact = new Contact(name, address);
      await Extension.saveContact(contact);
      getContacts();
    } catch (error) {
      showErrorToast(tCommon(error as string));
    } finally {
      setIsCreateContact(false);
    }
  };

  const deleteContact = async (address: string) => {
    try {
      await Extension.removeContact(address);
      getContacts();
    } catch (error) {
      showErrorToast(tCommon(error as string));
    }
  };

  const toggleCreateContact = () => {
    setIsCreateContact(!isCreateContact);
  };

  if (isLoading) {
    return <Loading />;
  }
  return (
    <PageWrapper>
      <div className="flex items-center gap-3 mb-10">
        <FiChevronLeft
          className="cursor-pointer"
          size={ICON_SIZE}
          onClick={() => navigate(-1)}
        />
        <p className="font-medium text-2xl">{t("title")}</p>
        {!isCreateContact && (
          <div className="flex-1 flex justify-end">
            <button
              type="button"
              className="mt-5 inline-flex justify-center rounded-md border border-transparent bg-custom-green-bg px-4 py-2 text-sm font-medium"
              onClick={() => toggleCreateContact()}
            >
              Add
              <BsPlus />
            </button>
          </div>
        )}
      </div>
      {isCreateContact ? (
        <>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            {t("name")}
          </label>
          <input
            id="name"
            placeholder="Insert contact name"
            max={32}
            min={1}
            className="mb-5 border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
          />
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            {t("address")}
          </label>
          <input
            id="address"
            placeholder="Insert address"
            className="mb-5 border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
          />
          <div className="flex justify-end">
            <button
              type="button"
              className="mt-5 inline-flex justify-center rounded-md border border-transparent bg-custom-green-bg px-4 py-2 text-sm font-medium"
              onClick={() => saveContact(name, address)}
            >
              {t("save_contact")}
            </button>
          </div>
        </>
      ) : (
        <>
          <input
            id="search"
            placeholder={t("search") || "Search"}
            className=" border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
            onChange={(e) => {
              setSearch(e.target.value);
            }}
          />

          <div className="flex flex-col gap-1 mt-5">
            {contacts.length === 0 && (
              <div className="flex justify-center items-center mt-5">
                <p className="text-lg font-medium">
                  {tCommon("no_contacts_found")}
                </p>
              </div>
            )}
            {contacts.length > 0 &&
              contacts
                .filter((contact) => {
                  return (
                    contact.name.toLowerCase().includes(search.toLowerCase()) ||
                    contact.address.toLowerCase().includes(search.toLowerCase())
                  );
                })
                .map((contact, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center hover:bg-custom-green-bg hover:bg-opacity-40 rounded-xl px-3 py-3 cursor-pointer"
                  >
                    <div className="overflow-hidden text-ellipsis">
                      <p className="text-lg font-medium">{contact?.name}</p>
                      <p>{contact?.address}</p>
                    </div>
                    <BsTrash
                      className="text-lg"
                      onClick={() => deleteContact(contact.address)}
                    />
                  </div>
                ))}
          </div>
        </>
      )}
    </PageWrapper>
  );
};

import { useState, useEffect } from "react";
import { ICON_SIZE } from "@src/constants/icons";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@src/components/common/PageWrapper";
import Contact from "@src/storage/entities/registry/Contact";
import { useTranslation } from "react-i18next";
import { useToast } from "@src/hooks";
import Extension from "@src/Extension";
import { Loading } from "@src/components/common";
import { BsTrash } from "react-icons/bs";
import { useForm } from "react-hook-form";
import { object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

interface AccountForm {
  name: string;
  address: string;
}

export const Contacts = () => {
  const { t } = useTranslation("contacts");
  const { t: tCommon } = useTranslation("common");
  const navigate = useNavigate();

  const schema = object({
    name: string().required(t("required") as string),
    address: string().required(t("required") as string),
  }).required();

  const { register, handleSubmit, reset } = useForm<AccountForm>({
    defaultValues: {
      name: "",
      address: "",
    },
    resolver: yupResolver(schema),
  });

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

  const saveContact = handleSubmit(async (form: AccountForm) => {
    try {
      const { name, address } = form;

      const contact = new Contact(name, address);
      await Extension.saveContact(contact);
      getContacts();
    } catch (error) {
      showErrorToast(tCommon(error as string));
    } finally {
      setIsCreateContact(false);
      reset();
    }
  });

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

  const getGroupedContacts = () => {
    const groupedContacts = contacts
      .filter(
        (contact) =>
          contact.name.toLowerCase().includes(search.toLowerCase()) ||
          contact.address.toLowerCase().includes(search.toLowerCase())
      )
      .reduce((acc: any, contact) => {
        const firstLetter = contact.name.charAt(0).toUpperCase();
        if (!acc[firstLetter]) {
          acc[firstLetter] = [];
        }
        acc[firstLetter].push(contact);
        return acc;
      }, {});
    return Object.entries(groupedContacts).sort(([letterA], [letterB]) =>
      letterA.localeCompare(letterB)
    );
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
              data-testid="new-contact"
              type="button"
              className="mt-5 inline-flex justify-between items-center rounded-lg border border-transparent hover:bg-gray-400 hover:bg-opacity-30 px-4 py-2 text-sm"
              onClick={() => toggleCreateContact()}
            >
              <span>{t("new_contact")} </span>
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
            data-testid="name"
            id="name"
            placeholder="Insert contact name"
            max={32}
            min={1}
            className="mb-5 border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
            {...register("name")}
          />
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            {t("address")}
          </label>
          <input
            data-testid="address"
            id="address"
            placeholder="Insert address"
            className="mb-5 border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
            {...register("address")}
          />
          <div className="flex justify-end">
            <button
              type="button"
              className="mt-5 inline-flex justify-center border border-custom-gray-bg text-white rounded-lg py-2 px-4 hover:bg-gray-400 hover:bg-opacity-30 transition duration-500 ease select-none focus:outline-none focus:shadow-outline text-sm"
              onClick={() => toggleCreateContact()}
            >
              {tCommon("cancel")}
            </button>
            <button
              data-testid="save"
              type="button"
              className="mt-5 ml-4 inline-flex justify-center border border-custom-green-bg text-white rounded-lg py-2 px-4 transition duration-500 ease select-none bg-custom-green-bg focus:outline-none focus:shadow-outline text-sm"
              onClick={saveContact}
            >
              {tCommon("save")}
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
            {getGroupedContacts().map(([letter, contacts]) => (
              <section key={letter}>
                <h3 className="text-lg font-medium my-2 text-custom-green-bg">
                  {letter}
                </h3>
                {(contacts as Contact[]).map((contact, index) => (
                  <div
                    data-testid="contact"
                    key={index}
                    className="flex justify-between items-center hover:bg-custom-green-bg hover:bg-opacity-40 rounded-xl px-3 py-3 cursor-pointer"
                  >
                    <div className="overflow-hidden text-ellipsis w-[75%] break-all">
                      <p className="text-lg font-medium">{contact?.name}</p>
                      <p>{contact?.address}</p>
                    </div>
                    <div className="w-[20%] flex justify-end">
                      <BsTrash
                        className="text-lg hover:text-custom-red-bg"
                        onClick={() => deleteContact(contact.address)}
                      />
                    </div>
                  </div>
                ))}
              </section>
            ))}
          </div>
        </>
      )}
    </PageWrapper>
  );
};

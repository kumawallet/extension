import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Contact from "@src/storage/entities/registry/Contact";
import { useTranslation } from "react-i18next";
import { useToast } from "@src/hooks";
import { Button, HeaderBack, Loading, PageWrapper } from "@src/components/common";
import { AiOutlineEdit } from "react-icons/ai";
import { FormProvider, useForm } from "react-hook-form";
import { object, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { decodeAddress, encodeAddress, isAddress } from "@polkadot/util-crypto";
import { isHex } from "@polkadot/util";
import { captureError } from "@src/utils/error-handling";
import { messageAPI } from "@src/messageAPI/api";
import { AddAddressModal } from "../../../../components/common/AddAddressModal";
import "../../style/input.css";
import { CiSearch } from "react-icons/ci";
import { PiGhost } from "react-icons/pi";
import { AddressForm } from "@src/types";

export const AddressBook = () => {
    const { t } = useTranslation("address_book");
    const { t: tCommon } = useTranslation("common");
    const navigate = useNavigate();
    const [typeAction, setTypeAction] = useState<"create" | "update">("create");
    const [name, setName] = useState("");
    const [address, setAddress] = useState("")

    const schema = object({
        name: string().required(t("required") as string),
        address: string()
            .typeError(t("required") as string)
            .test(
                "valid address",
                tCommon("invalid_address") as string,
                (address) => {
                    try {
                        if (!address) return false;

                        if (isHex(address)) {
                            return isAddress(address);
                        } else {
                            encodeAddress(decodeAddress(address));
                        }

                        return true;
                    } catch (error) {
                        return false;
                    }
                }
            )
            .required(t("required") as string),
    }).required();

    const getDefaultValue = () => {
        const init = typeAction === "create" ?
            {
                name: "",
                address: "",
            }
            :
            {
                name: name,
                address: address,
            }
        return init;
    }

    const methods = useForm<AddressForm>({
        resolver: yupResolver(schema),
        values: getDefaultValue(),
    });

    const { handleSubmit, reset } = methods;

    const [isLoading, setIsLoading] = useState(true);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [contacts, setContacts] = useState([] as Contact[]);
    const [search, setSearch] = useState("" as string);
    const { showErrorToast } = useToast();


    useEffect(() => {
        setIsLoading(true);
        getContacts();
    }, []);

    const getContacts = async () => {
        try {
            const contacts = await messageAPI.getContacts();
            setContacts(contacts);
        } catch (error) {
            setContacts([]);
            captureError(error);
            showErrorToast(tCommon(error as string));
        } finally {
            setIsLoading(false);
        }
    };

    const saveContact = handleSubmit(async (form: AddressForm) => {
        try {
            const { name, address } = form;
            const contact = new Contact(name, address);
            await messageAPI.saveContact({
                contact,
            });
            setSearch("");
            getContacts();
        } catch (error) {
            captureError(error);
            showErrorToast(tCommon(error as string));
        } finally {
            setIsOpenModal(false);
            reset();
        }
    });

    const deleteContact = async (address: string) => {
        try {
            await messageAPI.removeContact({
                address,
            });
            getContacts();
            setIsOpenModal(false);
        } catch (error) {
            showErrorToast(tCommon(error as string));
        }
    };
    const updateContact = handleSubmit(async (form: AddressForm) => {
        try {
            const { name, address } = form;
            await messageAPI.updateContact({
                name,
                address,
            });
            setSearch("");
            getContacts();
        } catch (error) {
            captureError(error);
            showErrorToast(tCommon(error as string));
        } finally {
            setIsOpenModal(false);
            reset();
        }
    });

    const toggleCreateContact = () => {
        setTypeAction("create");
        setName("");
        setAddress("");
        reset({
            name: "",
            address: "",
        });
        setIsOpenModal(!isOpenModal);
    };

    const groupedContacts = useMemo(() => {
        const groupedContacts = contacts
            .filter(
                (contact) =>
                    contact.name.toLowerCase().includes(search.toLowerCase()) ||
                    contact.address.toLowerCase().includes(search.toLowerCase())
            )
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    }, [contacts, search]);
    if (isLoading) {
        return <Loading />;
    }
    return (
        <PageWrapper>
            <FormProvider {...methods}>
                <HeaderBack navigate={navigate} title={t("title")}/>
                <div className="flex-1 flex justify-star mb-4">
                    <div className="flex-1 flex justify-star">
                        <Button
                            data-testid="new-contact"
                            classname=" text-sm"
                            onClick={toggleCreateContact}
                        >
                            {t("new_contact")}
                        </Button>
                    </div>
                </div>
                <AddAddressModal
                    isOpen={isOpenModal}
                    onClose={toggleCreateContact}
                    type={typeAction}
                    onSaveContact={saveContact}
                    onUpdateContact={updateContact}
                    onDeleteContact={() => deleteContact(address)}
                />
                <div className="relative">
                    <input
                        id="search"
                        placeholder={t("search")}
                        className="input-primary bg-[#1C1C27] pl-8 border-0 font-bold"
                        onChange={(e) => {
                            setSearch(e.target.value);
                        }}
                    />
                    <CiSearch className="absolute top-1/2 left-2 transform font-mediums -translate-y-1/2 text-white" />
                </div>

                <p className="text-sm font-medium mt-8">{t("my_contacts")}</p>
                <div className="flex flex-col gap-1 mt-5">
                    {contacts.length === 0 && (
                        <div className="grid place-items-center mt-5 opacity-50 ">
                            <PiGhost className=" text-[6rem] font-light" />
                            <p className="text-base font-medium  ">
                                {tCommon("no_contacts_found")}
                            </p>
                        </div>
                    )}

                    {groupedContacts.map(([letter, contacts]) => (
                        <section key={letter}>
                            <h3 className={`text-lg font-medium my-2 text-primary-default`}>
                                {letter}
                            </h3>
                            {(contacts as Contact[]).map((contact, index) => (
                                <div
                                    data-testid="contact"
                                    key={index}
                                    className={`flex justify-between items-center hover:bg-prtext-primary-default hover:bg-opacity-40 rounded-xl px-3 py-3 cursor-pointer`}
                                >
                                    <div className="overflow-hidden text-ellipsis w-[75%] break-all">
                                        <p className="text-lg font-medium">{contact?.name}</p>
                                        <p>{contact?.address}</p>
                                    </div>
                                    <div className="w-[20%] flex justify-end">

                                        <AiOutlineEdit onClick={() => {
                                            setName(contact?.name);
                                            setAddress(contact.address);
                                            setTypeAction("update");
                                            setIsOpenModal(true);
                                        }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </section>

                    ))}
                </div>
            </FormProvider>
        </PageWrapper>
    );
};

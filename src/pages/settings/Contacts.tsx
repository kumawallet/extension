import {useState, useEffect, useMemo} from "react";
import {ICON_SIZE} from "@src/constants/icons";
import {FiChevronLeft} from "react-icons/fi";
import {useNavigate} from "react-router-dom";
import Contact from "@src/storage/entities/registry/Contact";
import {useTranslation} from "react-i18next";
import {useToast} from "@src/hooks";
import Extension from "@src/Extension";
import {
    Button,
    InputErrorMessage,
    Loading,
    PageWrapper,
} from "@src/components/common";
import {BsTrash} from "react-icons/bs";
import {useForm} from "react-hook-form";
import {object, string} from "yup";
import {yupResolver} from "@hookform/resolvers/yup";
import {decodeAddress, encodeAddress, isAddress} from "@polkadot/util-crypto";
import {isHex} from "@polkadot/util";
import {captureError} from "@src/utils/error-handling";
import {useThemeContext} from "@src/providers";

interface AccountForm {
    name: string;
    address: string;
}

export const Contacts = () => {
    const {t} = useTranslation("contacts");
    const {t: tCommon} = useTranslation("common");
    const {color} = useThemeContext();
    const navigate = useNavigate();

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

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors},
    } = useForm<AccountForm>({
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
    const {showErrorToast} = useToast();

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
            captureError(error);
            showErrorToast(tCommon(error as string));
        } finally {
            setIsLoading(false);
        }
    };

    const saveContact = handleSubmit(async (form: AccountForm) => {
        try {
            const {name, address} = form;

            const contact = new Contact(name, address);
            await Extension.saveContact(contact);
            setSearch("");
            getContacts();
        } catch (error) {
            captureError(error);
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

    const groupedContacts = useMemo(() => {
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
    }, [contacts, search]);

    if (isLoading) {
        return <Loading/>;
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
                        <Button
                            data-testid="new-contact"
                            classname=" text-sm"
                            onClick={toggleCreateContact}
                        >
                            {t("new_contact")}
                        </Button>
                    </div>
                )}
            </div>
            {isCreateContact ? (
                <>
                    <div className="mb-5">
                        <label htmlFor="name" className="block text-sm font-medium mb-1">
                            {t("name")}
                        </label>
                        <input
                            data-testid="name"
                            id="name"
                            placeholder={t("insert_name") as string}
                            max={32}
                            min={1}
                            className="input-primary"
                            {...register("name")}
                        />
                        <InputErrorMessage message={errors.name?.message}/>
                    </div>

                    <div className="mb-5">
                        <label htmlFor="name" className="block text-sm font-medium mb-1">
                            {t("address")}
                        </label>
                        <input
                            data-testid="address"
                            id="address"
                            placeholder={t("insert_address") as string}
                            className="input-primary"
                            {...register("address")}
                        />
                        <InputErrorMessage message={errors.address?.message}/>
                    </div>

                    <div className="flex gap-4 justify-end mt-5">
                        <Button
                            variant="text"
                            classname="text-sm"
                            onClick={toggleCreateContact}
                        >
                            {tCommon("cancel")}
                        </Button>
                        <Button
                            data-testid="save"
                            classname={`text-sm`}
                            onClick={saveContact}
                        >
                            {tCommon("save")}
                        </Button>
                    </div>
                </>
            ) : (
                <>
                    <input
                        id="search"
                        placeholder={t("search") as string}
                        className="input-primary"
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
                        {groupedContacts.map(([letter, contacts]) => (
                            <section key={letter}>
                                <h3
                                    className={`text-lg font-medium my-2 text-${color}-primary`}
                                >
                                    {letter}
                                </h3>
                                {(contacts as Contact[]).map((contact, index) => (
                                    <div
                                        data-testid="contact"
                                        key={index}
                                        className={`flex justify-between items-center hover:bg-${color}-primary hover:bg-opacity-40 rounded-xl px-3 py-3 cursor-pointer`}
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

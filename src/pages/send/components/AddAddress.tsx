import { yupResolver } from "@hookform/resolvers/yup";
import { isHex } from "@polkadot/util";
import { decodeAddress, encodeAddress, isAddress } from "@polkadot/util-crypto";
import { AddAddressModal } from "@src/components/common/AddAddressModal";
import { useToast } from "@src/hooks";
import { messageAPI } from "@src/messageAPI/api";
import Contact from "@src/storage/entities/registry/Contact";
import { AddressForm } from "@src/types";
import { captureError } from "@src/utils/error-handling";
import { FC, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { object, string } from "yup";
import { FaCirclePlus } from "react-icons/fa6";

interface AddAddressProps {
  onSaveContact: () => void;
}

export const AddAddress: FC<AddAddressProps> = ({ onSaveContact }) => {
  const { t } = useTranslation("send");
  const { t: tCommon } = useTranslation("common");

  const { showErrorToast } = useToast();

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

  const methods = useForm<AddressForm>({
    defaultValues: {
      name: "",
      address: "",
    },
    resolver: yupResolver(schema),
  });

  const { handleSubmit, reset } = methods;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const saveContact = handleSubmit(async (form: AddressForm) => {
    try {
      const { name, address } = form;
      const contact = new Contact(name, address);
      await messageAPI.saveContact({
        contact,
      });
      onSaveContact();
    } catch (error) {
      captureError(error);
      showErrorToast(tCommon(error as string));
    }
    onToggleModal();
  });

  const onToggleModal = () => {
    setIsModalOpen(!isModalOpen);
    reset({
      address: "",
      name: "",
    });
  };

  return (
    <FormProvider {...methods}>
      <button
        data-testid="open-address-book"
        className="flex items-center gap-1 text-[#7C4DC4] text-xs font-medium"
        onClick={onToggleModal}
      >
        <FaCirclePlus size={16} color="#7C4DC4" />
        <span>{t("add_address")}</span>
      </button>

      <AddAddressModal
        isOpen={isModalOpen}
        onSaveContact={saveContact}
        onClose={onToggleModal}
      />
    </FormProvider>
  );
};

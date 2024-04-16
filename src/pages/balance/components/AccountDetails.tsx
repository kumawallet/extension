import { FC, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAccountContext, useNetworkContext } from "@src/providers";
import { useCopyToClipboard } from "@src/hooks/common/useCopyToClipboard";
import { useLoading, useToast } from "@src/hooks";
import { messageAPI } from "@src/messageAPI/api";
import { getHash } from "./funtions/Txfunctions";
import { Button } from "@src/components/common";
import Account from "@src/storage/entities/Account";
import { getWebAPI } from "@src/utils/env";
import { ConfirmMessage } from "../../../components/common/ConfirmMessage";

import { IoAlert } from "react-icons/io5";
import { Key } from "@src/components/icons/Key";
import { ICON_SIZE } from "@src/constants/icons";
import { FiChevronLeft } from "react-icons/fi";
import { PiEyeClosedThin, PiEyeClosed } from "react-icons/pi";
import { AiOutlineFileSearch, AiOutlineEdit } from "react-icons/ai";
import { RiDeleteBinLine } from "react-icons/ri";
import { BsEye } from "react-icons/bs";


import { AddressForm } from "@src/types";
import { yupResolver } from "@hookform/resolvers/yup";
import { object, string } from "yup";
import { isHex } from "@polkadot/util";
import { decodeAddress, encodeAddress, isAddress } from "@polkadot/util-crypto";
import { FormProvider, useForm } from "react-hook-form";


interface AccountDetailsProps {
  onBack: () => void;
  onClose?: () => void;
  title: string;
  style?: string;
  accountData: Account;
}

export const AccountDetails: FC<AccountDetailsProps> = ({
  onBack,
  title,
  accountData,
}) => {
  const [inputValue, setInputValue] = useState(accountData.value.name);
  const { t: tCommon } = useTranslation("common");
  const { t: t } = useTranslation("account");

  const [inputEnabled, setInputEnabled] = useState(false);
  const [hideKeys, setHideKeys] = useState(true);
  const [password, setPassword] = useState("");
  const [passwordType, setPasswordType] = useState("password");
  const [validated, setValidated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  const {
    state: { accounts },
    updateAccountName,
    deleteAccount,
  } = useAccountContext();
  const {
    state: { selectedChain },
  } = useNetworkContext();

  const { Icon, copyToClipboard } = useCopyToClipboard(
    accountData.value.address
  );
  const { showErrorToast } = useToast();
  const { starLoading: startLoadingReset, endLoading: endLoadingReset } =
    useLoading();

  const isValid = useMemo(() => {
    return password && password.length >= 8;
  }, [password]);

  
  

  const webAPI = getWebAPI();

  const togglePassword = () => {
    setPasswordType(passwordType === "password" ? "text" : "password");
  };

  const handleChange = (event: any) => {
    setInputValue(event.target.value);
  };

  const handleFocus = (event: any) => {
    event.target.select();
  };

  const handleKeyDown = (event: any) => {
    if (event.key === "Enter") {
      if (!/^[a-zA-Z0-9]+$/.test(event.target.value)) {
        setError("Invalid name");
      } else {
        setError("");
        setInputValue(event.target.value);
        setInputEnabled(!inputEnabled);
        updateAccountName(accountData.key, event.target.value);
      }
    }
  };

  const resetWallet = async () => {
    startLoadingReset();
    try {
      await messageAPI.resetWallet();
      localStorage.removeItem("color");

      const tab = await webAPI.tabs.getCurrent();
      

      const isInPopup = !tab?.id;

      if (isInPopup) {
        const url = webAPI.runtime.getURL(`src/entries/newtab/index.html`);
        webAPI.tabs.create({ url });
        window.close();
      } else {
        window.location.reload();
      }
    } catch (error) {
      showErrorToast(tCommon(error as string));
      endLoadingReset();
    }
  };

  const deleteSelectedAccount = () => {
    if (accounts.length > 1) {
      deleteAccount(accountData.key);
      onBack();
    } else {
      resetWallet();
    }
  };
  const enableInput = () => {
    setInputValue(accountData.value.name);
    setInputEnabled(true);
  };

  const getLink = () => {
    const network = accountData.value.keyring;
    const typeNet =
      network.length > 3 ? network.split("").splice(-4).join("") : network;

    if (typeNet.toLowerCase() === selectedChain?.type) {
      if (typeNet.toLowerCase() === "evm") {
        return `${selectedChain?.explorer}/account/${accountData.value.address}`;
      } else {
        return `${selectedChain?.explorer}/address/${accountData.value.address}`;
      }
    } else {
      undefined;
    }
  };

  const validatePassword = async () => {
    try {
      const key = accountData.key;
      const keyring = accountData.value.keyring;
      let privateKeyOrSeed: string | undefined =
        await messageAPI?.validatePassword({
          password,
          key,
          keyring,
        });

      if (!privateKeyOrSeed) {
        throw new Error("no_private_key_or_seed");
      }
      if (privateKeyOrSeed.includes("/")) {
        const index = privateKeyOrSeed.indexOf("/");
        privateKeyOrSeed = privateKeyOrSeed.substring(0, index);
      }
      setPrivateKey(privateKeyOrSeed);
      setValidated(true);
      return true;
    } catch (error) {
      setValidated(false);
      showErrorToast(tCommon(error as string));
      return false;
    }
  };
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
        name: accountData.value.name,
        address: getHash(accountData.value.address),
    },
    resolver: yupResolver(schema),
});

  return (
    <>
    <FormProvider {...methods}>
      <div className="w-full">
        <button className="flex items-center" onClick={onBack}>
          <FiChevronLeft size={ICON_SIZE} />
          <p className="text-base">{title}</p>
        </button>
      </div>
      <div className="flex flex-col mt-10 gap-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-4 items center">
            {!inputEnabled ? (
              <>
                <p className="text-sm">{inputValue}</p>
                <button data-testid="edit-button" onClick={enableInput}>
                  <AiOutlineEdit />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center relative ">
                <input
                  data-testid="input-name"
                  type="text"
                  className={`bg-[#171720] text-sm border-2 ${error.length > 0 ? "border-[#FF0202]" : "border-white"
                    } `}
                  value={inputValue}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                />
                <p className="text-[#FF0202] text-[0.65rem]  absolute top-[1.5rem]">
                  {error}
                </p>
              </div>
            )}
          </div>
          <button
            data-testid="delete-account"
            onClick={() => setIsOpen(true)}>
            <RiDeleteBinLine
              className="text-base"
              color="#FF0202"
              height="20px"
            />
          </button>
        </div>
        <ConfirmMessage
          isOpen={isOpen}
          onClose={() => setIsOpen(!isOpen)}
          type="delete"
          name={accountData.value.name}
          address={accountData.value.address}
          confirmed={deleteSelectedAccount}
        />

        <div>
          <p className="text-sm">{t("address")}</p>
          <div className="flex">
            <p className="opacity-80">{getHash(accountData?.value.address)}</p>
            <button onClick={copyToClipboard} className="ml-5">
              <Icon />
            </button>
          </div>
        </div>
        <div>
          {accountData.value.keyring.toLowerCase().includes("evm") ? (
            <p>{t("private_key")}</p>
          ) : (
            <p>{t("seed_phrase")}</p>
          )}
          <div className={`relative ${!validated && !hideKeys ? "my-8" : "my-0"}`}>
            <textarea
              className="text-center text-xs h-[100px]  focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-[#1C1C27]  placeholder-gray-400 text-white resize-none relative select-none"
              value={privateKey}
              readOnly
              onSelect={(e) => e.preventDefault()}
              onCopy={(e) => e.preventDefault()}
              // onChange={(e) => setKey(e.target.value)}
              onFocus={handleFocus}
            />
            <div
              className={`absolute left-0 top-0 w-full h-full ${hideKeys
                ? "backdrop-blur-sm"
                : !hideKeys && !validated
                  ? "bg-[#171720]"
                  : ""
                }   flex justify-center items-center`}
            >
              {hideKeys ? (
                <button
                  data-testid="show-key-button"
                  className="flex flex-col items-center"
                  onClick={() => setHideKeys(false)}
                >
                  <PiEyeClosedThin className="w-[2rem] h-[2rem] font-thin" />
                </button>
              ) : !validated && !hideKeys ? (
                <div className="flex flex-col w-full border-3 border-white gap-y-4 mt-[2rem]">
                  <div className="relative mb-2 border-3 border-white">
                    <input
                      data-testid="password-input"
                      id="password"
                      min={8}
                      placeholder="Enter password"
                      onPaste={(e) => e.preventDefault()}
                      type={passwordType}
                      value={password}
                      className={`px-10 w-full bg-[#1C1C27] border-3 border-white h-[3rem] rounded-md`}
                      onChange={({ target }) => setPassword(target.value)}
                      onKeyDown={({ key }) =>
                        key === "Enter" && validatePassword()
                      }
                    />
                    <Key className="absolute left-[0.5rem] top-[0.9rem] w-[1rem]" />
                    <button
                      className="absolute top-[1rem] right-[0.7rem]"
                      onClick={togglePassword}
                    >
                      {passwordType === "password" ? (
                        <PiEyeClosed className="cursor-pointer " size={20} />
                      ) : (
                        <BsEye className="cursor-pointer" size={20} />
                      )}
                    </button>
                    <p className="flex text-[#EBE212] text-center text-[0.65rem] font-light px-5 mt-[1rem]">
                      <IoAlert className="!text-xl !font-black" />
                      {t("private_alert")}
                    </p>
                  </div>
                  <div className="flex justify-between my-3">
                    <Button
                      classname="!w-[48%] py-3"
                      onClick={() => setHideKeys(true)}
                    >
                      {t("cancel")}
                    </Button>
                    <Button
                      data-testid="confirm-password"
                      classname="!w-[48%] py-3"
                      aria-disabled={!isValid}
                      isDisabled={!isValid}
                      onClick={validatePassword}
                    >
                      {t("continue")}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div>
          {!getLink() ? null : hideKeys || (!hideKeys && validated) ? (
            <a
              href={getLink()}
              className="flex items-center gap-2"
              target="_blank"
              rel="noreferrer"
            >
              <AiOutlineFileSearch />
              <p>{t("view_explorer")}</p>
            </a>
          ) : null}
        </div>
      </div>
      </FormProvider>
    </>
  );
};

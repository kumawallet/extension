import { Button, PageWrapper } from "@src/components/common";
import { HeaderBack } from "@src/components/common/HeaderBack";
import { useTranslation, Trans } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { SelectableAssetBuy } from "./components/SelectableAsset";
import { LinkUrl } from "./components/LinkUrl";
import { useEffect, useMemo, useState } from "react";
import { useAccountContext } from "@src/providers";
import { getType } from "../../utils/assets";
import { SelectAccount } from "../send/components/SelectAccount";
import { transakLinks } from "../../utils/constants";
import useBuy from "./hook/useBuy"
import { Chain } from "./types";

export const Buy = () => {
  const { t } = useTranslation("buy");
  const navigate = useNavigate();
  const {
    state: { selectedAccount, accounts },
  } = useAccountContext();
  const { chains, createOrder } = useBuy();

  const [isChecked, setIsChecked] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string | undefined>(selectedAccount?.value?.address || accounts[0].value?.address);
  

  const options = useMemo(() => {
    if (selectedAccount?.value) {
      return chains.filter(
        (chain) => chain.type === getType(selectedAccount.type.toLowerCase())
      );
    } else {
      const _account = accounts.find(
        (_account) => _account.value?.address === selectedAddress
      );
      const type = _account && getType(_account.type.toLowerCase());
      return chains.filter((chain) => chain.type === type);
    }
  }, [selectedAccount, chains, accounts,selectedAddress])

  const [value, setValue] = useState<Chain>(options[0]);

  const handlerTransak = async () => {
    if (selectedAddress) {
      const url = await createOrder(value.symbol, selectedAddress, value.network, value.isSupportSell);
      window.open(url, "_blank");
    }
  };

  useEffect(() => {
    setValue(options[0]);
  }, [options,selectedAccount?.key]);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <PageWrapper
      contentClassName="h-full flex-1 "
      innerContentClassName="flex flex-col !bg-[#212529] gap-[2rem]"
    >
      <HeaderBack
        navigate={navigate}
        title={t("buy_title")}
        classNameContainer=" !mb-2 "
      />
      <div className={`flex  flex-col w-full gap-[2rem]`}>
        {!selectedAccount?.value && (
          <SelectAccount
            onChangeValue={(account) => setSelectedAddress(account)}
            selectedAddress={selectedAddress || null}
          />
        )}
        <div className="flex  flex-col w-full gap-2 ">
          <SelectableAssetBuy
            defaulValue={value}
            options={options}
            label=""
            value={value}
            onChange={(asset) => setValue(asset)}
          />
          <div className="w-full gap-[0.7rem] flex items-center">
            <img
              src="https://assets.transak.com/images/website/transak.svg"
              alt="transak"
              className="w-[1rem]"
            />
            <span className="text-xs text-justify opacity-50">
              {t("service")}
            </span>
          </div>
        </div>
      </div>
      <div className="w-full gap-[1rem] flex flex-col items-center">
        <div className="text-justify">
          <Trans
            t={t}
            components={{
              term: (
                <LinkUrl
                  url={`${transakLinks.transak_terms}`}
                  content={t("terms_of_service")}
                />
              ),
              policy: (
                <LinkUrl
                  url={`${transakLinks.transak_policy}`}
                  content={t("privacy_policy")}
                />
              ),
              support: (
                <LinkUrl
                  url={`${transakLinks.transak_support}`}
                  content={t("support")}
                />
              ),
            }}
            i18nKey={`info`}
          />
        </div>
        <div className="flex items-center w-full space-x-4">
          <input
            data-testid="checkbox"
            type="checkbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
            className="w-4 h-4 border-[#636669] border-[2px] rounded-sm "
          />
          <span className="font-medium text-sm text-[#3D8FEF]" onClick={handleCheckboxChange}>
            {t("yes_i_understand")}
          </span>
        </div>
      </div>
      <Button
        onClick={handlerTransak}
        classname="w-full"
        isDisabled={!isChecked}
      >
        {t("buy_title")}
      </Button>
    </PageWrapper>
  );
};

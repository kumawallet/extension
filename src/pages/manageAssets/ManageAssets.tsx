import { LoadingButton, PageWrapper } from "@src/components/common";
import { useTranslation } from "react-i18next";
import { BiLeftArrowAlt } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useToast } from "@src/hooks";
import { useNetworkContext } from "@src/providers/networkProvider/NetworkProvider";
import { useState } from "react";
import Extension from "../../Extension";
import { BALANCE } from "../../routes/paths";
import { useAssetContext } from "@src/providers/assetProvider";

export const ManageAssets = () => {
  const { t } = useTranslation("manage_assets");
  const {
    state: { selectedChain },
  } = useNetworkContext();
  const { loadAssets } = useAssetContext();

  const navigate = useNavigate();
  const { showErrorToast } = useToast();

  const [form, setForm] = useState({
    address: "",
    symbol: "",
    decimals: 0,
  });

  const onSubmit = async () => {
    try {
      await Extension.addAsset(selectedChain.name, form);
      loadAssets();
      navigate(BALANCE);
    } catch (error) {
      showErrorToast(error);
    }
  };

  const onChange = (target: EventTarget & HTMLInputElement) => {
    setForm((state) => ({
      ...state,
      [target.name]: target.value,
    }));
  };

  return (
    <>
      <PageWrapper>
        <div className="flex gap-3 items-center mb-7">
          <BiLeftArrowAlt
            size={26}
            className="cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <p className="text-xl">{t("title")}</p>
        </div>
        <div className="flex flex-col gap-2">
          <input
            name="address"
            value={form.address}
            onChange={({ target }) => onChange(target)}
            placeholder="adress"
            className=" border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
          />
          <input
            name="symbol"
            value={form.symbol}
            onChange={({ target }) => onChange(target)}
            placeholder="symbol"
            className=" border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
          />
          <input
            name="decimals"
            value={form.decimals}
            onChange={({ target }) => onChange(target)}
            placeholder="decimals"
            className=" border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
          />
          <LoadingButton onClick={onSubmit}>{t("create")}</LoadingButton>
        </div>
      </PageWrapper>
    </>
  );
};

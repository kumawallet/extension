import { useMemo, useEffect } from "react";
import {
  InputErrorMessage,
  LoadingButton,
  PageWrapper,
} from "@src/components/common";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useToast } from "@src/hooks";
import Extension from "@src/Extension";
import { BALANCE } from "@src/routes/paths";
import { useAssetContext, useNetworkContext } from "@src/providers";
import { number, object, string } from "yup";
import { isHex, u8aToHex } from "@polkadot/util";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { FiChevronLeft } from "react-icons/fi";
import { decodeAddress } from "@polkadot/util-crypto";

interface AssetForm {
  address: string;
  decimals: number;
  symbol: string;
}

const defaultValues: AssetForm = {
  address: "",
  symbol: "",
  decimals: 0,
};

export const ManageAssets = () => {
  const { t } = useTranslation("manage_assets");
  const {
    state: { selectedChain, type },
  } = useNetworkContext();
  const { loadAssets } = useAssetContext();

  const navigate = useNavigate();
  const { showErrorToast } = useToast();

  const schema = useMemo(() => {
    return object({
      address: string().test(
        "adress validation",
        t("invalid_address") as string,
        (val) => {
          try {
            return type === "EVM"
              ? isHex(val)
              : !!u8aToHex(decodeAddress(val as string));
          } catch (error) {
            return false;
          }
        }
      ),
      decimals: number()
        .typeError(t("invalid_number") as string)
        .required(t("required") as string),
      symbol: string().required(t("required") as string),
    });
  }, [t, type]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AssetForm>({
    defaultValues,
    resolver: yupResolver(schema),
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await Extension.addAsset(selectedChain.name, data);
      loadAssets();
      navigate(BALANCE);
    } catch (error) {
      showErrorToast(error);
    }
  });

  useEffect(() => {
    if (type === "WASM" && selectedChain) {
      setValue("decimals", selectedChain?.nativeCurrency?.decimals);
    }
  }, [selectedChain, type]);

  return (
    <>
      <PageWrapper>
        <div className="flex gap-3 items-center mb-7">
          <FiChevronLeft
            size={26}
            className="cursor-pointer"
            onClick={() => navigate(-1)}
          />
          <p className="text-xl">{t("title")}</p>
        </div>
        <div className="flex flex-col gap-2">
          <div>
            <label htmlFor="address" className="block text-sm font-medium mb-1">
              {t("address")}
            </label>
            <input
              id="address"
              {...register("address")}
              className=" border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
            />
            <InputErrorMessage message={errors.address?.message} />
          </div>

          <div>
            <label htmlFor="symbol" className="block text-sm font-medium mb-1">
              {t("symbol")}
            </label>
            <input
              id="symbol"
              {...register("symbol")}
              className=" border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
            />
            <InputErrorMessage message={errors.symbol?.message} />
          </div>

          <div>
            <label
              htmlFor="decimals"
              className="block text-sm font-medium mb-1"
            >
              {t("decimals")}
            </label>
            <input
              disabled={type === "WASM"}
              id="decimals"
              {...register("decimals")}
              className=" border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white disabled:opacity-60"
            />
            <InputErrorMessage message={errors.decimals?.message} />
          </div>
          <div className="flex justify-end" data-testid="submitbtn">
            <LoadingButton onClick={onSubmit} isLoading={isSubmitting}>
              {t("add")}
            </LoadingButton>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};

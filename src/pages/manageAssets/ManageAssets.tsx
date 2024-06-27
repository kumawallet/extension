import { useMemo } from "react";
import { InputErrorMessage, Button, PageWrapper, HeaderBack } from "@src/components/common";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useToast } from "@src/hooks";
import { BALANCE } from "@src/routes/paths";
import { useNetworkContext } from "@src/providers";
import { number, object, string } from "yup";
import { isHex } from "@polkadot/util";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { messageAPI } from "@src/messageAPI/api";
import { ChainType } from "@src/types";

interface AssetForm {
  chainId: string;
  address: string;
  decimals: number;
  symbol: string;
}

const defaultValues: AssetForm = {
  chainId: "",
  address: "",
  symbol: "",
  decimals: 0,
};


export const ManageAssets = () => {
  const { t } = useTranslation("manage_assets");
  const { t: tCommon } = useTranslation("common");
  const {
    state: { selectedChain, chains },
  } = useNetworkContext();

  const navigate = useNavigate();
  const { showErrorToast } = useToast();

  const schema = useMemo(() => {
    return object({
      chainId: string().required(t("required") as string),
      address: string().test(
        "adress validation",
        tCommon("invalid_address") as string,
        (val) => isHex(val)
      ),
      decimals: number()
        .typeError(t("invalid_number") as string)
        .required(t("required") as string),
      symbol: string().required(t("required") as string),
    });
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AssetForm>({
    defaultValues,
    resolver: yupResolver(schema),
  });

  const chainsToSelect = useMemo(() => {
    const chainsKeys = Object.keys(selectedChain).filter(
      (key) => selectedChain[key].type === ChainType.EVM
    );

    const allChains = chains.map((chain) => chain.chains).flat();

    return allChains.filter((chain) => chainsKeys.includes(chain.id));
  }, []);

  const onSubmit = handleSubmit(async ({ chainId, ...asset }) => {
    try {
      await messageAPI.addAsset({
        asset: asset,
        chain: chainId,
      });
      navigate(BALANCE);
    } catch (error) {
      showErrorToast(error);
    }
  });

  return (
    <>
      <PageWrapper>
       <HeaderBack title={t("title")} navigate={navigate}/>
        <div className="flex flex-col gap-2">
          <div>
            <label htmlFor="address" className="block text-sm font-medium mb-1">
              {t("chain")}
            </label>
            <select
              data-testid="chain"
              className="input-primary"
              {...register("chainId")}
            >
              {chainsToSelect.map((chain) => (
                <option key={chain.id} value={chain.id}>
                  {chain.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium mb-1">
              {t("address")}
            </label>
            <input
              data-testid="address"
              id="address"
              {...register("address")}
              className="input-primary"
            />
            <InputErrorMessage message={errors.address?.message} />
          </div>

          <div>
            <label htmlFor="symbol" className="block text-sm font-medium mb-1">
              {t("symbol")}
            </label>
            <input
              data-testid="symbol"
              id="symbol"
              {...register("symbol")}
              className="input-primary"
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
              data-testid="decimals"
              id="decimals"
              {...register("decimals")}
              className="input-primary disabled:opacity-60"
            />
            <InputErrorMessage message={errors.decimals?.message} />
          </div>
          <div className="flex justify-end" data-testid="submitbtn">
            <Button onClick={onSubmit} isLoading={isSubmitting}>
              {t("add")}
            </Button>
          </div>
        </div>
      </PageWrapper>
    </>
  );
};

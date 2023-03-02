import { ICON_SIZE } from "@src/constants/icons";
import { FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "@src/components/common/PageWrapper";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useToast } from "@src/hooks";
import { Loading } from "@src/components/common";
import { Chain } from "@src/constants/chains";
import Extension from "@src/Extension";

export const ManageNetworks = () => {
  const { t } = useTranslation("manage_networks");
  const { t: tCommon } = useTranslation("common");
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [networks, setNetworks] = useState([] as Chain[]);
  const { showErrorToast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    getNetworks();
  }, []);

  const getNetworks = async () => {
    try {
      const networks = await Extension.getAllChains();
      console.log(networks);
      setNetworks(networks);
    } catch (error) {
      setNetworks([]);
      showErrorToast(tCommon(error as string));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNetwork = async (chainName: string) => {
    try {
      //await Extension.removeChain(chainName);
      getNetworks();
    } catch (error) {
      showErrorToast(tCommon(error as string));
    }
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center gap-3 mb-10">
          <Loading />
        </div>
      </PageWrapper>
    );
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
      </div>
      {networks &&
        networks.map((network, index) => {
          return (
            <div
              key={index}
              className="flex justify-between items-center gap-2"
            >
              <p className="font-medium text-lg">{network.name}</p>
              <button
                className="text-red-500 font-medium"
                onClick={() => deleteNetwork(network.name)}
              >
                {t("delete")}
              </button>
            </div>
          );
        })}
    </PageWrapper>
  );
};

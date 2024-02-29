import { useTranslation } from "react-i18next";
import { Action } from "./Action";
import { useNavigate } from "react-router-dom";
import { SEND, SWAP } from "@src/routes/paths";
import { useMemo } from "react";
import { useNetworkContext } from "@src/providers";
import { SUPPORTED_CHAINS_FOR_SWAP } from "@src/pages/swap/base";
import { Buy, Send, Swap } from "@src/components/icons";

export const Actions = () => {
  const { t } = useTranslation("balance");
  const navigate = useNavigate();

  const {
    state: { selectedChain },
  } = useNetworkContext();

  const isSwapAvailable = useMemo(() => {
    if (!selectedChain?.name) return false;

    const chainType = selectedChain.type === "wasm" ? "wasm" : "evm"

    return SUPPORTED_CHAINS_FOR_SWAP[chainType].includes(selectedChain?.name);
  }, [selectedChain]);

  return (
    <div className="flex gap-5 justify-center">
      <Action
        Icon={Send}
        title={t("send")}
        onClick={() => navigate(SEND)}
      />

      <Action
        Icon={Swap}
        title={t("swap")}
        onClick={() => navigate(SWAP)}
        isDisabled={!isSwapAvailable}
      />

      <Action
        Icon={Buy}
        title={t("buy")}
        onClick={() => navigate("")}
        isDisabled={true}
        isCoomingSoon={true}
      />
    </div>
  );
};

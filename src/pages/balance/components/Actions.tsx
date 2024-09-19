import { useTranslation } from "react-i18next";
import { Action } from "./Action";
import { useNavigate } from "react-router-dom";
import { SEND, SWAP, BUY } from "@src/routes/paths";
import { Buy, Send, Swap } from "@src/components/icons";
import { useAccountContext } from "@src/providers";
import { getType } from "@src/utils/assets";

export const Actions = () => {
  const { t } = useTranslation("balance");
  const navigate = useNavigate();
  const { state: { selectedAccount }} = useAccountContext()
  return (
    <div data-testid="actions-container" className="flex gap-5 justify-center">
      <Action
        Icon={Send}
        title={t("send")}
        onClick={() => navigate(SEND)}
      />

      <Action
        Icon={Swap}
        title={t("swap")}
        onClick={() => navigate(SWAP)}
        isDisabled={selectedAccount?.type && getType(selectedAccount.type.toLocaleLowerCase()) === "ol"? true : false}
      />

      <Action
        Icon={Buy}
        title={t("buy")}
        onClick={() => navigate(BUY)}
      />
    </div>
  );
};

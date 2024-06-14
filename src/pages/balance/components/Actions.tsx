import { useTranslation } from "react-i18next";
import { Action } from "./Action";
import { useNavigate } from "react-router-dom";
import { SEND, SWAP, BUY } from "@src/routes/paths";
import { Buy, Send, Swap } from "@src/components/icons";

export const Actions = () => {
  const { t } = useTranslation("balance");
  const navigate = useNavigate();

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
      />

      <Action
        Icon={Buy}
        title={t("buy")}
        onClick={() => navigate(BUY)}
      />
    </div>
  );
};

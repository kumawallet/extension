import { PageWrapper } from "@src/components/common";
import { HeaderBack } from "@src/components/common/HeaderBack";
import { useAccountContext } from "@src/providers";
import { useNavigate, useLocation } from "react-router-dom";
import { Wallet } from "./Wallet";
import { Footer } from "./Footer";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

export const BalanceAccounts = () => {
  const { t } = useTranslation("balance");
  const navigate = useNavigate();
  const {
    state: { asset },
  } = useLocation();
  const {
    state: { accounts },
  } = useAccountContext();

  const accounstToShow = accounts.filter(
    (account) => asset.accounts[account.key]
  );

  return (
    <>
      <PageWrapper contentClassName="!h-[90vh]">
        <div className="h-full flex flex-col overflow-auto settings-container">
          <HeaderBack title={t("accounts.accounts")} navigate={navigate} />
          <div data-testid="wallets" className="flex flex-col gap-2 h-full">
            {accounstToShow.map((account) => (
              <Wallet
                address={account.value!.address}
                name={account.value!.name}
                type={account.type}
                key={account.key}
                _asset={asset?.accounts?.[account.key]}
                showBalanceforAsset={true}
              />
            ))}
          </div>
        </div>
      </PageWrapper>
      <Footer />
    </>
  );
};

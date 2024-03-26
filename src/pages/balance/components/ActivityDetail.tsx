import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

import { HeaderBack } from "@src/components/common/HeaderBack";
import { PageWrapper, Button } from "@src/components/common";
import { Footer } from "@src/pages/balance/components";
import Contact from "@src/storage/entities/registry/Contact";
import { NetworkIcon } from "./NetworkIcon";
import { Status } from "@src/components/common/TxStatus";
import { useCopyToClipboard } from "@src/hooks/common/useCopyToClipboard";
import { Chain } from "@src/types";
import { messageAPI } from "@src/messageAPI/api";
import { useNetworkContext, useAccountContext } from "@src/providers";
import { useToast } from "@src/hooks";
import { XCM } from "@src/constants/xcm";
import {
  estimatedFee,
  getHash,
  getValue,
  getTip,
} from "@src/pages/balance/components/funtions/Txfunctions";

import { styleAD } from "./style/activityDetails";
import { FaChevronRight } from "react-icons/fa";

export const ActivityDetail = () => {
  const { t: tCommon } = useTranslation("common");
  const { t } = useTranslation("activity_details");
  const navigate = useNavigate();

  const { showErrorToast } = useToast();
  const {
    state: { selectedAccount },
  } = useAccountContext();
  const {
    state: { chains, selectedChain },
  } = useNetworkContext();

  const [contacts, setContacts] = useState([] as Contact[]);
  const [ownAccounts, setOwnAccounts] = useState([] as Contact[]);
  const [isLoading, setIsLoading] = useState(true);

  const location = useLocation();
  const {
    hash,
    status,
    originNetwork,
    targetNetwork,
    sender,
    recipient,
    fee,
    type,
    amount,
    asset,
    tip,
  } = location.state;
  const { Icon, copyToClipboard } = useCopyToClipboard(hash);

  useEffect(() => {
    if (selectedAccount) {
      Promise.all([getContacts()]);
    }
  }, [selectedAccount.key]);

  const allChains = chains.flatMap((c) => c.chains);

  const getContacts = async () => {
    try {
      setIsLoading(true);
      const { contacts, ownAccounts } = await messageAPI.getRegistryAddresses();
      setContacts(contacts);
      setOwnAccounts(ownAccounts);
    } catch (error) {
      setContacts([]);
      showErrorToast(tCommon(error as string));
    } finally {
      setIsLoading(false);
    }
  };

  const getXCM = (network: string, recipientNetwork: string) => {
    if (network !== recipientNetwork) {
      const dataNetwork = allChains.find(
        (chain) => chain.name === network
      ) as Chain;
      if (dataNetwork && dataNetwork.id) {
        if (dataNetwork.id in XCM) {
          return true;
        }
        return false;
      }
      return false;
    }
    return false;
  };

  const getLink = (chain: Chain, hash: string) => {
    const chainType = chain?.type;
    if (chainType === "wasm") {
      window.open(`${chain?.explorer}/extrinsic/${hash}`);
    } else {
      window.open(`${selectedChain?.explorer}/tx/${hash}`);
    }
  };

  const getContactName = (address: string) => {
    const contact = contacts.find((c) => c.address === address);
    const ownAccount = ownAccounts.find((c) => c.address === address);
    return contact || ownAccount
      ? {
        contact: contact?.name || ownAccount?.name,
        value: address.slice(0, 12) + "..." + address.slice(-12),
      }
      : { value: address.slice(0, 12) + "..." + address.slice(-12) };
  };

  const transaction = {
    Hash: getHash(hash),
    Type: type,
    Status: status,
    Sender: getContactName(sender),
    Recipient: getContactName(recipient),
    Network: "hola",
    Amount: getValue({
      value: amount,
      symbol: asset,
    }),
    "Estimeted fee": estimatedFee(
      {
        fee,
        symbol: asset,
      },
      selectedChain?.decimals as number
    ),
    Tip: getTip({
      tip,
      symbol: asset,
    }),
  };

  return (
    <PageWrapper contentClassName="mt-1/2 ">
      <div className="mt-1 m-3">
        <HeaderBack title={t("title")} navigate={navigate} />
        <div className="grid gap-5">
          {Object.entries(transaction).map(([key, value]) => (
            <div key={key} className={styleAD.countendItems}>
              <p className={styleAD.items}>{key}</p>
              {key === "Hash" ? (
                <div className={styleAD.itemsValue}>
                  {value}
                  <button
                    onClick={copyToClipboard}
                    className={styleAD.copyButton}
                    data-testid="account-button"
                  >
                    <Icon
                      iconProps={{
                        className: styleAD.copyButton,
                      }}
                    />
                  </button>
                </div>
              ) : key === "Sender" || key === "Recipient" ? (
                <>
                  {value.contact ? (
                    <div className="grid w-full">
                      <p className={styleAD.itemsValue}>{value.contact}</p>
                      <p className={styleAD.itemsValue}>{value.value}</p>
                    </div>
                  ) : (
                    <p className={styleAD.itemsValue}>{value.value}</p>
                  )}
                </>
              ) : key === "Status" ? (
                <div className={styleAD.itemsValue}>
                  <Status status={value} />
                </div>
              ) : key === "Network" ? (
                getXCM(originNetwork, targetNetwork) ? (
                  <div className={styleAD.countainerNetworks}>
                    <div className={styleAD.networks}>
                      <NetworkIcon
                        networkName={originNetwork}
                        width={16}
                        chains={allChains}
                      />
                      <FaChevronRight size={12} />
                      <NetworkIcon
                        networkName={targetNetwork}
                        chains={allChains}
                        width={16}
                      />
                    </div>
                    <p className={styleAD.textNetwork}>{t("xcm")}</p>
                  </div>
                ) : (
                  <div className={styleAD.networks}>
                    <NetworkIcon
                      networkName={originNetwork}
                      width={16}
                      chains={allChains}
                    />
                    <FaChevronRight size={12} className="font-ligth" />
                    <NetworkIcon
                      networkName={targetNetwork}
                      chains={allChains}
                      width={16}
                    />
                  </div>
                )
              ) : (
                <p className={styleAD.itemsValue}>{value}</p>
              )}
            </div>
          ))}
        </div>
      </div>
      <Button
        classname={styleAD.button}
        onClick={() => getLink(selectedChain as Chain, hash)}
      >
        {t("explorer")}
      </Button>
      <Footer />
    </PageWrapper>
  );
};

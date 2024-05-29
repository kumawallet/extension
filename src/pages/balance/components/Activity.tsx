import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Status } from "@src/components/common/TxStatus";
import { Button, Loading } from "@src/components/common";
import Contact from "@src/storage/entities/registry/Contact";
import { ACTIVITY_DETAIL } from "@src/routes/paths";
import { useAccountContext } from "@src/providers";
import { messageAPI } from "@src/messageAPI/api";
import { HiOutlineInboxArrowDown } from "react-icons/hi2";
import { SendIcon } from "@src/components/icons/SendIcon";
import { BsChevronRight } from "react-icons/bs";
import { stylesActivity } from "@src/pages/balance/components/style/activity";
import { SwapIcon } from "@src/components/icons/SwapIcon";
import { IoIosCloseCircle } from "react-icons/io";
import { transformAddress } from "@src/utils/account-utils";
import { RecordStatus } from "@src/storage/entities/activity/types";
import { SelectAccountActivity } from "./SelectAccountActivity";

const isSameAddress = (address1: string, address2: string) => {
  return (
    transformAddress(address1, undefined) ===
    transformAddress(address2, undefined)
  );
};

export const Activity = () => {
  const { t } = useTranslation("activity");
  const navigate = useNavigate();

  const {
    state: { selectedAccount, accounts },
  } = useAccountContext();

  const { t: tCommon } = useTranslation("common");
  const [isLoading, setIsLoading] = useState(true);
  const [contacts, setContacts] = useState([] as Contact[]);
  const [ownAccounts, setOwnAccounts] = useState([] as Contact[]);
  const [transactions, setTransactions] = useState([] as any[]);
  const [addressToSearch, setAddressToSearch] = useState("");

  const getContacts = async () => {
    // try {
    //   setIsLoading(true);
    //   const { contacts, ownAccounts } = await messageAPI.getRegistryAddresses();
    //   setContacts(contacts);
    //   setOwnAccounts(ownAccounts);
    // } catch (error) {
    //   setContacts([]);
    //   showErrorToast(tCommon(error as string));
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const getContactName = (address: string) => {
    const contact = contacts.find((c) => c.address === address);
    const ownAccount = ownAccounts.find((c) => c.address === address);
    return contact || ownAccount
      ? contact?.name || ownAccount?.name
      : address.slice(0, 6) + "..." + address.slice(-4);
  };

  const getAmount = (data: { value: string; symbol: string }) => {
    if (!data || !data.value) return "$0.0";
    if (data.value.length > 7 && /^0+\.0*[0]{5}[1-9]*$/.test(data.value)) {
      return `< 0.00001 ${data.symbol}`;
    } else if (data.value.length > 7) {
      const value = parseFloat(data.value);
      const million = Math.floor(value / 1000000);
      if (million >= 1) {
        return `${million}M ${data.symbol}`;
      } else {
        return `${value.toFixed(2)} ${data.symbol}`;
      }
    }
    return `${data.value} ${data.symbol}`;
  };

  const onSelectAccount = async (address: string) => {
    try {
      setIsLoading(true);

      const account = accounts.find((a) => a.value?.address === address);
      if (!account) return;

      setAddressToSearch(address);

      await messageAPI.setAccountToActivity({
        address: address,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // useEffect(() => {
  //   const handleScroll = () => {
  //     const { scrollTop, clientHeight, scrollHeight } =
  //       document.documentElement;
  //     if (
  //       scrollTop + clientHeight >= scrollHeight - 20 &&
  //       hasNextPage &&
  //       !isLoadingTxs
  //     ) {
  //       loadMoreActivity();
  //     }
  //   };

  //   window.addEventListener("scroll", handleScroll);
  //   return () => {
  //     window.removeEventListener("scroll", handleScroll);
  //   };
  // }, [isLoadingTxs, hasNextPage]);

  useEffect(() => {
    if (selectedAccount) {
      Promise.all([getContacts()]);
    }
  }, [selectedAccount?.key]);

  useEffect(() => {
    setIsLoading(true);

    messageAPI
      .activitySubscribe((transactions) => {
        setTransactions(transactions);
        setIsLoading(false);
      })
      .then((transactions) => {
        setTransactions(transactions);
        setIsLoading(false);
      });
  }, []);

  return (
    <>
      <div className={stylesActivity.containerGlobal}>
        <SelectAccountActivity
          selectedAddress={addressToSearch}
          onChangeValue={onSelectAccount}
        />
      </div>

      {isLoading ? (
        <Loading />
      ) : (
        <div
          data-testid="activity-container"
          className={stylesActivity.containerTx}
        >
          {transactions.length === 0 && (
            <div
              className={` ${stylesActivity.flexItemsCenter} ${stylesActivity.containerEmptyActivity}`}
            >
              <p className={stylesActivity.textEmptyActivity}>{t("empty")}</p>
            </div>
          )}
          {transactions.map(
            ({
              isSwap,
              hash,
              sender,
              asset,
              recipient,
              status,
              amount,
              fee,
              originNetwork,
              targetNetwork,
              type,
              tip,
              version,
              chainLogo,
              link,
              isXcm,
            }) => (
              <Button
                variant="contained-little-gray"
                key={hash}
                classname={stylesActivity.TxButton}
                onClick={() =>
                  navigate(ACTIVITY_DETAIL, {
                    state: {
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
                      version,
                      link,
                      isXcm,
                    },
                  })
                }
              >
                <div
                  className={`${stylesActivity.flexItemsCenter} ${stylesActivity.containerButton}`}
                >
                  <div className={stylesActivity.flexItemsCenter}>
                    <div className={stylesActivity.explorer}>
                      <div className={`relative ${stylesActivity.circleIcon}`}>
                        {isSwap ? (
                          <SwapIcon size="18" />
                        ) : isSameAddress(addressToSearch, sender) ? (
                          <SendIcon size="18" />
                        ) : (
                          <HiOutlineInboxArrowDown />
                        )}
                        <div className={stylesActivity.containerAssetIcon}>
                          {!chainLogo ? (
                            <IoIosCloseCircle
                              className={stylesActivity.faildIcon}
                            />
                          ) : (
                            <img
                              src={chainLogo}
                              alt="Logo"
                              className="object-cover rounded-full"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={stylesActivity.containerText}>
                      {isSwap ? (
                        <p className={stylesActivity.textTxType}>{t("swap")}</p>
                      ) : !isSameAddress(addressToSearch, recipient) ? (
                        <p className={stylesActivity.textTxType}>{t("send")}</p>
                      ) : (
                        <p className={stylesActivity.textTxType}>
                          {t("receive")}
                        </p>
                      )}
                      <p className={stylesActivity.textAddress}>
                        {getContactName(recipient)}
                      </p>
                    </div>
                  </div>
                </div>
                <Status status={status as RecordStatus} classname="ml-2" />
                <div className={stylesActivity.containerDivEnd}>
                  <div className={stylesActivity.flexItemsCenter}>
                    <div
                      className={`${stylesActivity.containerText}${stylesActivity.containerAmounts}`}
                    >
                      <p
                        className={`${getAmount({
                          value: amount,
                          symbol: asset,
                        }).length > 10
                            ? "text-[px] "
                            : "text-[10px]"
                          } font-bold`}
                      >
                        {getAmount({
                          value: amount,
                          symbol: asset,
                        })}
                      </p>
                      <p className={stylesActivity.textFee}>{fee}</p>
                    </div>
                    <BsChevronRight className={stylesActivity.iconArrow} />
                  </div>
                </div>
              </Button>
            )
          )}
        </div>
      )}
    </>
  );
};

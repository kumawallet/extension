import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useToast } from "@src/hooks";
import { Status } from '@src/components/common/TxStatus'
import { Loading, Button, } from "@src/components/common";
import { RecordData } from "@src/storage/entities/activity/types";
import Contact from "@src/storage/entities/registry/Contact";
import { ACTIVITY_DETAIL } from '@src/routes/paths'
import {
  useNetworkContext,
  useTxContext,
  useAccountContext,
} from "@src/providers";
import { messageAPI } from "@src/messageAPI/api";
import { Chain } from "@src/types";
import { estimatedFee } from '@src/pages/balance/components/funtions/Txfunctions'
import { CiSearch } from "react-icons/ci";
import { HiOutlineInboxArrowDown } from "react-icons/hi2";
import { SendIcon } from "@src/components/icons/SendIcon"
import { BsChevronRight } from "react-icons/bs";
import { stylesActivity } from '@src/pages/balance/components/style/activity';
import { SwapIcon } from "@src/components/icons/SwapIcon"
import { IoIosCloseCircle } from "react-icons/io";


export const Activity = () => {
  const { t } = useTranslation("activity");
  const navigate = useNavigate();

  const {
    state: { chains, selectedChain },
  } = useNetworkContext();

  const {
    state: { selectedAccount },
  } = useAccountContext();

  const {
    state: { activity },
  } = useTxContext();

  const { t: tCommon } = useTranslation("common");
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("" as string);
  const [contacts, setContacts] = useState([] as Contact[]);
  const [ownAccounts, setOwnAccounts] = useState([] as Contact[]);
  const { showErrorToast } = useToast();


  useEffect(() => {
    if (selectedAccount) {
      Promise.all([getContacts()]);
    }
  }, [selectedAccount.key]);


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

  const getContactName = (address: string) => {
    const contact = contacts.find((c) => c.address === address);
    const ownAccount = ownAccounts.find((c) => c.address === address);
    return contact || ownAccount
      ? contact?.name || ownAccount?.name
      : address.slice(0, 6) + "..." + address.slice(-4);
  };

  const getAmount = (data: RecordData) => {
    if (!data || !data.value) return "$0.0";
    if (data.value.length > 7 && /^0+\.0*[1-9][0-9]*$/.test(data.value)) {
      return `< 0.00001 ${data.symbol}`;
    }
    else if (data.value.length > 7) {
      const value = parseFloat(data.value);
      const million = Math.floor(value / 1000000);
      if (million >= 1) {
        return `${million}M ${data.symbol}`
      }
      else {
        return `${value.toFixed(3)} ${data.symbol}`
      }
    }
    return `${data.value} ${data.symbol}`;
  }


  const getLink = (chain: Chain, hash: string) => {
    const chainType = chain?.type
    if (chainType === "wasm") {
      return `${chain?.explorer}/extrinsic/${hash}`;
    } else {
      return `${selectedChain?.explorer}/tx/${hash}`;
    }
  };

  const allChains = chains.flatMap((c) => c.chains);

  const logo = (symbol: string) => {
    const asset: Chain | undefined = allChains.find((obj) => obj.symbol === symbol);
    return !asset ? undefined : asset.logo.toString();

  }

  const filteredRecords = useMemo(() => {
    const _search = search.trim().toLocaleLowerCase();
    if (!_search) return activity;

    return activity
      .filter(({ hash, reference, address }) => {
        return (
          hash.toLowerCase().includes(_search) ||
          reference?.toLowerCase().includes(_search) ||
          address.toLowerCase().includes(_search)
        );
      })
      .sort((a, b) => (b.lastUpdated as number) - (a.lastUpdated as number));
  }, [search, activity]);




  if (isLoading) {
    return <Loading />;
  }


  return (
    <>
      <div className={stylesActivity.containerGlobal}>
        <input
          data-testid="search-input"
          id="search"
          placeholder={t("search") as string}
          className={stylesActivity.inputTxSearch}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
        />
        <CiSearch className={stylesActivity.iconSearch} />
      </div>
      <div className={stylesActivity.countainerTx}>
        {activity.length === 0 && (
          <div className={` ${stylesActivity.flexItemsCenter} ${stylesActivity.countainerEmptyActivity}`}>
            <p className={stylesActivity.textEmptyActivity}>{t("empty")}</p>
          </div>
        )}
        {filteredRecords.map(
          ({
            address,
            status,
            reference,
            data,
            network,
            hash,
            recipientNetwork,
            type,
            isSwap

          }) => (
            <Button
              variant="contained-little-gray"
              key={hash}
              classname={stylesActivity.TxButton}
              onClick={() => navigate(ACTIVITY_DETAIL, {
                state: {
                  hash: hash,
                  status: status,
                  reference: reference,
                  address: address,
                  network: network,
                  recipientNetwork: recipientNetwork,
                  data: data,
                  type: type,
                }
              })}

            >
              <div className={`${stylesActivity.flexItemsCenter} ${stylesActivity.countainerButton}`}>
                <div className={stylesActivity.flexItemsCenter}>
                  <a
                    className={stylesActivity.explorer}
                    href={getLink(selectedChain as Chain, hash)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <div className={`relative ${stylesActivity.circleIcon}`}>
                      {isSwap ? (

                        <SwapIcon size="18" />


                      )
                        :
                        selectedAccount?.value?.address === data.from ? (
                          <SendIcon size="18" />
                        )
                          :
                          (
                            <HiOutlineInboxArrowDown />
                          )
                      }
                      <div className={stylesActivity.countainerAssetIcon}>
                        {
                          !logo(data.symbol) ?
                            (<IoIosCloseCircle className={stylesActivity.faildIcon} />) :
                            (<img src={logo(data.symbol)} alt="Logo" />)
                        }
                      </div>
                    </div>
                  </a>
                  <div className={stylesActivity.countainerText}>
                    {isSwap ? (
                      <p className={stylesActivity.textTxType}>{t("swap")}</p>
                    )
                      : selectedAccount?.value?.address !== address ? (
                        <p className={stylesActivity.textTxType}>{t("send")}</p>
                      )
                        : (
                          <p className={stylesActivity.textTxType}>{t("receive")}</p>
                        )
                    }
                    <p className={stylesActivity.textAddress}>{getContactName(address)}</p>
                  </div>

                </div>

              </div>
              <Status status={status} />
              <div className={stylesActivity.countainerDivEnd}>
                <div className={stylesActivity.flexItemsCenter}>
                  <div className={`${stylesActivity.countainerText}${stylesActivity.countainerAmounts}`}>

                    <p className={`${getAmount(data).length > 10 ? 'text-[px] ' : 'text-[10px]'} font-bold`}>
                      {getAmount(data)}
                    </p>
                    <p className={stylesActivity.textFee}>
                      {estimatedFee(data, selectedChain?.decimals || 1)}
                    </p>
                  </div>
                  <BsChevronRight className={stylesActivity.iconArrow} />
                </div>
              </div>

            </Button>
          )
        )}
      </div>
    </>
  );
};

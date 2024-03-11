import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useToast } from "@src/hooks";
import { Status } from '@src/components/common/TxStatus'
import { Loading,Button, } from "@src/components/common";
import { RecordData, RecordStatus } from "@src/storage/entities/activity/types";
import Contact from "@src/storage/entities/registry/Contact";
import { ACTIVITY_DETAIL } from '@src/routes/paths'
import {
  useNetworkContext,
  useTxContext,
  useAccountContext,
} from "@src/providers";
import { messageAPI } from "@src/messageAPI/api";
import { Chain } from "@src/types";
import {estimatedFee} from '@src/pages/balance/components/funtions/Txfunctions'

import { CiSearch } from "react-icons/ci";
import { HiOutlineInboxArrowDown } from "react-icons/hi2";
import {  PiNavigationArrow  } from "react-icons/pi";
import { BsChevronRight } from "react-icons/bs";
import { stylesActivity} from '@src/pages/balance/components/style/activity';
import { ICON_SIZE} from '@src/constants/icons';



const chipColor = {
  [RecordStatus.FAIL]: "bg-red-600 ",
  [RecordStatus.SUCCESS]: "bg-green-600 text-[#06371D]",
  [RecordStatus.PENDING]: "bg-yellow-600 text-[#573800]",
};
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


  const getLink = (chain: Chain, hash: string) => {
    const chainType = chain?.type
    if (chainType === "wasm") {
      return `${chain?.explorer}/extrinsic/${hash}`;
    } else {
      return `${selectedChain?.explorer}/tx/${hash}`;
    }
  };

  const getContactName = (address: string) => {
    const contact = contacts.find((c) => c.address === address);
    const ownAccount = ownAccounts.find((c) => c.address === address);
    return contact || ownAccount
      ? contact?.name || ownAccount?.name
      : address.slice(0, 6) + "..." + address.slice(-4);
  };

  const getValue = (data: RecordData) => {
    if (!data || !data.value) return "$0.0";
    return data.symbol ? `${data.value} ${data.symbol}` : `$${data.value}`;
  };

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
          <div className={` ${stylesActivity.flexItemsCenter}${stylesActivity.countainerEmptyActivity}`}>
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

          }) => (
            <Button
              variant="contained-litlle-gray"
              key={hash}
              classname={stylesActivity.TxButton}
              onClick={() => navigate(ACTIVITY_DETAIL, {state: {
                                                                  hash: hash,
                                                                  status: status,
                                                                  reference: reference,
                                                                  address: address,
                                                                  network: network,
                                                                  recipientNetwork: recipientNetwork,
                                                                  data: data,
                                                                  type: type,
              }})}
              
            >
              <div className={`${stylesActivity.flexItemsCenter}${stylesActivity.countainerButton}`}>
                <a
                  className={stylesActivity.explorer}
                  href={getLink(selectedChain as Chain, hash)}
                  target="_blank"
                  rel="noreferrer"
                >
                  { selectedAccount?.value?.address !== address ? ( 
                    <div className={`${stylesActivity.flexItemsCenter}${stylesActivity.circleIcon}`}>
                      <PiNavigationArrow  size={ICON_SIZE}  className={stylesActivity.sendIcon}/>
                    </div>) : ( 
                    <div className={stylesActivity.circleIcon}>
                      <HiOutlineInboxArrowDown  size={ICON_SIZE}  />
                    </div>)}
                </a>
                <div className={`${stylesActivity.gridData}`}>
                  { selectedAccount?.value?.address !== address ? ( 
                     <p className={stylesActivity.textTxType}>Send</p>
                     ) : ( 
                      <p className={stylesActivity.textTxType}>Receive</p>)}
                    <p className={stylesActivity.textAddress}>{getContactName(address)}</p>
                  </div>
                </div>
              <Status status={status} />
              <div className={stylesActivity.flexItemsCenter}>
                <div className={`${stylesActivity.gridData}${stylesActivity.countainerAmounts}`}>
                  <p className={stylesActivity.textAmount}>
                    {getValue(data)}
                  </p>
                  <p className={stylesActivity.textFee}>
                    {estimatedFee(data)}
                  </p>
                </div>
              <BsChevronRight  />
              </div>
            </Button>
          )
        )}
      </div>
    </>
  );
};

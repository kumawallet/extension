import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@src/hooks";
import Extension from "@src/Extension";
import { Loading } from "@src/components/common";
import { RecordData, RecordStatus } from "@src/storage/entities/activity/types";
import { BsArrowUpRight } from "react-icons/bs";
import Contact from "@src/storage/entities/registry/Contact";
import { formatDate } from "@src/utils/utils";
import {
  useNetworkContext,
  useTxContext,
  useAccountContext,
} from "@src/providers";
import Chains from "@src/storage/entities/Chains";
import { AssetIcon } from "@src/components/common/AssetIcon";
import { FaChevronRight } from "react-icons/fa";

const chipColor = {
  [RecordStatus.FAIL]: "bg-red-600",
  [RecordStatus.SUCCESS]: "bg-green-600",
  [RecordStatus.PENDING]: "bg-yellow-600",
};

export const Activity = () => {
  const { t } = useTranslation("activity");

  const {
    state: { type },
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
  const [networks, setNetworks] = useState({} as Chains);
  const [contacts, setContacts] = useState([] as Contact[]);
  const [ownAccounts, setOwnAccounts] = useState([] as Contact[]);
  const { showErrorToast } = useToast();

  useEffect(() => {
    if (selectedAccount) {
      getContacts();
    }
    getNetworks();
  }, [selectedAccount.key]);

  const getNetworks = async () => {
    try {
      setIsLoading(true);
      const networks = await Extension.getAllChains();
      setNetworks(networks);
    } catch (error) {
      setNetworks({} as Chains);
      showErrorToast(tCommon(error as string));
    } finally {
      setIsLoading(false);
    }
  };

  const getContacts = async () => {
    try {
      setIsLoading(true);
      const { contacts, ownAccounts } = await Extension.getRegistryAddresses();
      setContacts(contacts);
      setOwnAccounts(ownAccounts);
    } catch (error) {
      setContacts([]);
      showErrorToast(tCommon(error as string));
    } finally {
      setIsLoading(false);
    }
  };

  const getLink = (network: string, hash: string) => {
    const { explorer } =
      networks
        .getAll()
        .find((chain) => chain.name.toLowerCase() === network.toLowerCase()) ||
      {};
    const { evm, wasm } = explorer || {};
    if (type.toLowerCase() === "wasm") {
      return `${wasm?.url}extrinsic/${hash}`;
    } else {
      return `${evm?.url}tx/${hash}`;
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

  const getStatusColor = (status: RecordStatus) => {
    switch (status) {
      case RecordStatus.PENDING:
        return "goldenrod";
      case RecordStatus.SUCCESS:
        return "#469999";
      case RecordStatus.FAIL:
        return "red";
      default:
        return "white";
    }
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
      <input
        id="search"
        placeholder={t("search") || "Search"}
        className=" border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
        onChange={(e) => {
          setSearch(e.target.value);
        }}
      />

      <div className="flex flex-col my-5 overflow-y-auto h-full">
        {activity.length === 0 && (
          <div className="flex justify-center items-center mt-5">
            <p className="text-lg font-medium">{t("empty")}</p>
          </div>
        )}
        {filteredRecords.map(
          ({ address, status, lastUpdated, data, network, hash }) => (
            <div
              key={hash}
              className="mb-5 mr-1 bg-[#343A40] flex justify-between rounded-lg py-2 px-2 text-white cursor-pointer items-center gap-3 hover:bg-gray-400 hover:bg-opacity-30 transition overflow-auto"
            >
              <div className="flex items-center justify-between gap-3">
                <a
                  className="text-custom-green-bg hover:bg-custom-green-bg hover:bg-opacity-30 rounded-full p-1"
                  href={getLink(network, hash)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <BsArrowUpRight size={23} color={getStatusColor(status)} />
                </a>
                <div className="overflow-hidden text-ellipsis px-1">
                  <p className="text-xs">{getContactName(address)}</p>
                  <p className="text-xs">{`${formatDate(
                    lastUpdated as number
                  )} - `}</p>
                  {/* <p>
                    
                    <a
                      className="text-custom-green-bg hover:text-white text-sm"
                      href={getLink(network, hash)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {tCommon("view_in_scanner")}
                    </a>
                  </p> */}
                  <p
                    className={`text-[10px] flex justify-center items-center m-1 font-medium py-1 px-2  rounded-full text-indigo-100  w-fit ${
                      chipColor[status as RecordStatus]
                    }`}
                  >
                    {status}
                  </p>
                </div>
              </div>
              <div className="flex flex-col text-lg px-1">
                <p className="text-sm whitespace-nowrap mb-1 text-center">
                  {getValue(data)}
                </p>
                <div className="flex justify-evenly items-center gap-1">
                  <AssetIcon
                    asset={data.fromAssetId || data.asset}
                    width={20}
                  />
                  <FaChevronRight size={16} />

                  <AssetIcon asset={data.toAssetId || data.asset} width={20} />
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
};

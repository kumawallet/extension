import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@src/hooks";
import Extension from "@src/Extension";
import { Loading } from "@src/components/common";
import { RecordData, RecordStatus } from "@src/storage/entities/activity/types";
import { BsArrowUpRight } from "react-icons/bs";
import Contact from "@src/storage/entities/registry/Contact";
import { formatDate } from "@src/utils/utils";
import { CHAINS } from "@src/constants/chains";
import { useAccountContext } from "@src/providers/accountProvider/AccountProvider";
import { useNetworkContext, useTxContext } from "@src/providers";

const chpiColor = {
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
  const [contacts, setContacts] = useState([] as Contact[]);
  const { showErrorToast } = useToast();

  useEffect(() => {
    if (selectedAccount) {
      getContacts();
    }
  }, [selectedAccount.key]);

  const getContacts = async () => {
    try {
      setIsLoading(true);
      const contacts = await Extension.getContacts();
      setContacts(contacts);
    } catch (error) {
      setContacts([]);
      showErrorToast(tCommon(error as string));
    } finally {
      setIsLoading(false);
    }
  };

  const getLink = (network: string, hash: string) => {
    const { explorers } =
      CHAINS.flatMap((chainType) => chainType.chains).find(
        (chain) => chain.name.toLowerCase() === network.toLowerCase()
      ) || {};
    const { url } = explorers?.[0] || {};
    if (type.toLowerCase() === "wasm") {
      return `${url}extrinsic/${hash}`;
    } else {
      return `${url}tx/${hash}`;
    }
  };

  const getContactName = (address: string) => {
    const contact = contacts.find((c) => c.address === address);
    return contact
      ? contact.name
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
              className="mb-5 mr-1 bg-[#343A40] flex justify-between rounded-lg py-1 px-2 text-white cursor-pointer items-center gap-3 hover:bg-gray-400 hover:bg-opacity-30 transition overflow-auto"
            >
              <div className="flex items-center justify-between gap-3">
                <BsArrowUpRight size={24} color={getStatusColor(status)} />
                <div className="overflow-hidden text-ellipsis px-1">
                  <p className="text-sm">{getContactName(address)}</p>
                  <p>
                    {`${formatDate(lastUpdated as number)} - `}
                    <a
                      className="text-custom-green-bg hover:text-white text-sm"
                      href={getLink(network, hash)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {tCommon("view_in_scanner")}
                    </a>
                  </p>
                  <p
                    className={`text-[10px] flex justify-center items-center m-1 font-medium py-1 px-2  rounded-full text-indigo-100  w-fit ${
                      chpiColor[status as RecordStatus]
                    }`}
                  >
                    {status}
                  </p>
                </div>
              </div>
              <div className="text-lg px-1">
                <p className="text-sm whitespace-nowrap mb-1">
                  {getValue(data)}
                </p>
                <div className="flex justify-evenly">
                  <div className="w-5 h-5 rounded-full bg-gray-400" />
                  <div className="w-5 h-5 rounded-full bg-gray-400" />
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
};

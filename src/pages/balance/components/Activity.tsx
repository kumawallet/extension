import { ICON_SIZE } from "@src/constants/icons";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@src/hooks";
import Extension from "@src/Extension";
import { Loading } from "@src/components/common";
import Record from "@src/storage/entities/activity/Record";
import {
  RecordData,
  RecordStatus,
  RecordType,
} from "@src/storage/entities/activity/types";
import {
  BsFillArrowUpRightCircleFill,
  BsFillFileEarmarkFill,
} from "react-icons/bs";
import Contact from "@src/storage/entities/registry/Contact";
import { formatDate } from "@src/utils/utils";

export const Activity = () => {
  const { t } = useTranslation("activity");
  const { t: tCommon } = useTranslation("common");
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("" as string);
  const [records, setRecords] = useState([] as Record[]);
  const [contacts, setContacts] = useState([] as Contact[]);
  const { showErrorToast } = useToast();

  useEffect(() => {
    getActivity();
    getContacts();
  }, []);

  const getActivity = async () => {
    try {
      setIsLoading(true);
      const records = await Extension.getActivity();
      setRecords(records);
    } catch (error) {
      setRecords([]);
      showErrorToast(tCommon(error as string));
    } finally {
      setIsLoading(false);
    }
  };

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

  const getTypeIcon = (type: string, status: RecordStatus) => {
    switch (type) {
      case RecordType.TRANSFER:
        return (
          <BsFillArrowUpRightCircleFill
            size={ICON_SIZE}
            color={getStatusColor(status)}
          />
        );
      case RecordType.CALL:
        return (
          <BsFillFileEarmarkFill
            size={ICON_SIZE}
            color={getStatusColor(status)}
          />
        );
      default:
        return null;
    }
  };

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

      <div className="flex flex-col mt-5">
        {records.length === 0 && (
          <div className="flex justify-center items-center mt-5">
            <p className="text-lg font-medium">{t("empty")}</p>
          </div>
        )}
        {records.length > 0 &&
          records
            .filter(({ hash, reference, address }) => {
              return (
                hash.toLowerCase().includes(search.toLowerCase()) ||
                reference.toLowerCase().includes(search.toLowerCase()) ||
                address.toLowerCase().includes(search.toLowerCase())
              );
            })
            .sort((a, b) => b.lastUpdated - a.lastUpdated)
            .map(({ address, status, lastUpdated, type, data }, index) => (
              <div
                key={index}
                className="flex justify-between items-start hover:bg-custom-green-bg hover:bg-opacity-40 rounded-xl px-3 py-3 cursor-pointer"
              >
                <div>{getTypeIcon(type, status)}</div>
                <div className="overflow-hidden text-ellipsis">
                  <p className="text-lg font-medium">
                    {getContactName(address)}
                  </p>
                  <p>{formatDate(lastUpdated)}</p>
                </div>
                <div className="text-lg">{getValue(data)}</div>
              </div>
            ))}
      </div>
    </>
  );
};

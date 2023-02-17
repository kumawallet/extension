import { ICON_SIZE } from "@src/constants/icons";
import { PageWrapper } from "@src/components/common/PageWrapper";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@src/hooks";
import Extension from "@src/Extension";
import { Loading } from "@src/components/common";
import Record from "@src/storage/entities/activity/Record";
import { RecordStatus, RecordType } from "@src/storage/entities/activity/types";
import {
  BsFillArrowUpRightCircleFill,
  BsFillCheckCircleFill,
  BsFillClockFill,
  BsFillExclamationCircleFill,
  BsFillFileEarmarkFill,
} from "react-icons/bs";

/*
await chrome.storage.local.set({
  Activity$1: {
    data: {
      ethereum: {
        "0xsomehashfjkdsalfjkdsafdsafds": {
          hash: "0xsomehashfjkdsalfjkdsafdsafds",
          type: "transfer",
          reference: "pizza hut",
          status: "pending",
          timestamp: 1676658472135,
          lastUpdated: 1676658472135,
        },
        "0xsfdsafomehashfjkdsalfjkdsafdsafds": {
          hash: "0xsfdsafomehashfjkdsalfjkdsafdsafds",
          type: "call",
          reference: "pase de messi",
          status: "pending",
          timestamp: 1676658472135,
          lastUpdated: 1576658472135,
        },
        "0xsomfdsafehashfjkdsalfjkdsafdsafds": {
          hash: "0xsomfdsafehashfjkdsalfjkdsafdsafds",
          type: "transfer",
          reference: "nintendo switch",
          status: "success",
          timestamp: 1676658472135,
          lastUpdated: 1676658472135,
        },
        "0xsomedddhashfjkdsalfjkdsafdsafds": {
          hash: "0xsomedddhashfjkdsalfjkdsafdsafds",
          type: "transfer",
          reference: "me compre una coca",
          status: "fail",
          timestamp: 1676658472135,
          lastUpdated: 1676658400000,
        },
        "0xaaaaajkdsalfjkdsafdsafds": {
          hash: "0xaaaaajkdsalfjkdsafdsafds",
          type: "call",
          reference: "quien sabe que es esto",
          status: "pending",
          timestamp: 1676658472135,
          lastUpdated: 1676658470000,
        },
      },
    },
  },
});
*/

export const Activity = () => {
  const { t } = useTranslation("activity");
  const { t: tCommon } = useTranslation("common");
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("" as string);
  const [records, setRecords] = useState([] as Record[]);
  const { showErrorToast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    getActivity();
  }, []);

  const getActivity = async () => {
    try {
      const records = await Extension.getActivity();
      setRecords(records);
      console.log("records", records);
    } catch (error) {
      setRecords([]);
      showErrorToast(tCommon(error as string));
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: number) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const seconds = d.getSeconds();
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  if (isLoading) {
    return <Loading />;
  }
  return (
    <PageWrapper>
      <input
        id="search"
        placeholder={t("search") || "Search"}
        className=" border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
        onChange={(e) => {
          setSearch(e.target.value);
        }}
      />

      <div className="flex flex-col gap-1 mt-5">
        {records.length === 0 && (
          <div className="flex justify-center items-center mt-5">
            <p className="text-lg font-medium">
              {tCommon("no_activities_found")}
            </p>
          </div>
        )}
        {records.length > 0 &&
          records
            .filter(({ hash, reference }) => {
              return (
                hash.toLowerCase().includes(search.toLowerCase()) ||
                reference.toLowerCase().includes(search.toLowerCase())
              );
            })
            .sort((a, b) => b.lastUpdated - a.lastUpdated)
            .map(({ hash, reference, status, lastUpdated, type }, index) => (
              <div
                key={index}
                className="flex justify-between items-center hover:bg-custom-green-bg hover:bg-opacity-40 rounded-xl px-3 py-3 cursor-pointer"
              >
                {type === RecordType.TRANSFER ? (
                  <BsFillArrowUpRightCircleFill size={ICON_SIZE} />
                ) : (
                  <BsFillFileEarmarkFill size={ICON_SIZE} />
                )}
                <div className="overflow-hidden text-ellipsis">
                  <p className="text-lg font-medium">{reference}</p>
                  <p>{formatDate(lastUpdated)}</p>
                </div>
                {status === RecordStatus.PENDING ? (
                  <BsFillClockFill size={ICON_SIZE} />
                ) : status === RecordStatus.FAIL ? (
                  <BsFillExclamationCircleFill size={ICON_SIZE} />
                ) : (
                  <BsFillCheckCircleFill size={ICON_SIZE} />
                )}
              </div>
            ))}
      </div>
    </PageWrapper>
  );
};

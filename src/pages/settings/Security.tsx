import { ICON_SIZE } from "@src/constants/icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FiChevronDown, FiChevronLeft, FiChevronUp } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { PageWrapper } from "../../components/common/PageWrapper";
import { useToast } from "@src/hooks";
import Extension from "@src/Extension";
import { Loading } from "@src/components/common";
import { BsTrash } from "react-icons/bs";
import { RESTORE_PASSWORD } from "@src/routes/paths";

export const Security = () => {
  const { t } = useTranslation("security");
  const { t: tCommon } = useTranslation("common");
  const [isLoading, setIsLoading] = useState(true);
  const [sites, setSites] = useState([] as string[]);
  const [showSites, setShowSites] = useState(false);
  const [search, setSearch] = useState("" as string);
  const { showErrorToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    getSites();
  }, []);

  const toggleShowSites = () => {
    setShowSites(!showSites);
  };

  const getSites = async () => {
    try {
      const sites = await Extension.getTrustedSites();
      setSites(sites);
    } catch (error) {
      setSites([]);
      showErrorToast(tCommon(error as string));
    } finally {
      setIsLoading(false);
    }
  };

  const removeSite = async (site: string) => {
    try {
      await Extension.removeTrustedSite(site);
      getSites();
    } catch (error) {
      showErrorToast(tCommon(error as string));
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <PageWrapper>
      <div className="flex items-center gap-3 mb-10">
        <FiChevronLeft
          className="cursor-pointer"
          size={ICON_SIZE}
          onClick={() => navigate(-1)}
        />
        <p className="font-medium text-2xl">{t("title")}</p>
      </div>
      <div className="flex flex-col mt-5 gap-2">
        <div className="flex justify-between items-center">
          <p className="text-lg font-medium mb-5">{t("trusted_sites")}</p>
          <div className="p-2">
            {showSites ? (
              <FiChevronUp
                className="cursor-pointer"
                size={ICON_SIZE}
                onClick={toggleShowSites}
              />
            ) : (
              <FiChevronDown
                className="cursor-pointer"
                size={ICON_SIZE}
                onClick={toggleShowSites}
              />
            )}
          </div>
        </div>
        {showSites && (
          <>
            <input
              id="search"
              placeholder={t("search") || "Search"}
              className=" border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
            {sites
              .filter((site) =>
                site.toLowerCase().includes(search.toLowerCase())
              )
              .map((site, index) => (
                <div
                  className="flex justify-between items-center hover:bg-custom-green-bg hover:bg-opacity-40 rounded-xl px-3 py-3 cursor-pointer gap-2"
                  key={index}
                >
                  <p className="text-custom-green-bg px-2 break-all w-[75%]">
                    {site}
                  </p>
                  <div className="w-[20%] flex justify-end">
                    <BsTrash
                      className="text-lg hover:text-custom-red-bg"
                      onClick={() => removeSite(site)}
                    />
                  </div>
                </div>
              ))}
            {sites.length === 0 && (
              <div className="flex justify-center items-center px-4 py-2">
                <p className="text-sm text-gray-400">{t("no_trusted_sites")}</p>
              </div>
            )}
          </>
        )}
        <div className="flex justify-between items-center">
          <p className="text-lg font-medium mb-5">{t("credentials")}</p>
          <div className="p-2">
            <button
              type="button"
              className="inline-flex justify-between items-center cursor-pointer rounded-md border border-transparent hover:bg-gray-400 hover:bg-opacity-30 px-4 py-2 text-sm font-medium"
              onClick={() => navigate(RESTORE_PASSWORD)}
            >
              {t("restore_password")}
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

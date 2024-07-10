import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { HeaderBack } from "@src/components/common/HeaderBack";
import { Button, PageWrapper } from "@src/components/common";
import { Footer } from "@src/pages/balance/components";
import { getHash } from "@src/utils/transactions-utils";
import { useNetworkContext } from "@src/providers";

export const NFTDetail = () => {
  const { t } = useTranslation("activity_details");
  const navigate = useNavigate();
  const {
    state: { chains },
  } = useNetworkContext();

  const location = useLocation();
  const data = location.state;
  const network = chains.map((_chains) => _chains.chains).flat();
  const networkName = network.find((_network) => _network.id === data.network);

  //   const { Icon, copyToClipboard } = useCopyToClipboard(hash);
  const details: { [key: string]: string } = {
    TokenId: data.tokenId,
    Name: data.name,
    Description: data.description,
    Network: networkName?.name || data.network,
    Owner: getHash(data.owner),
    "Contract address": getHash(data.contractAddress),
  };

  return (
    <PageWrapper contentClassName="mt-1/2 ">
      <HeaderBack title={t("title")} navigate={navigate} />
      <div className=" w-full flex flex-col gap-7 pb-[3rem]">
        <div className="w-full h-[15rem] flex justify-center items-center">
          <img
            src={
              data.image === "/" || !data.image ? "/icon-128.png" : data.image
            }
            alt="image"
            className={`${
              data.image === "/" || !data.image
                ? "md:h-[6rem] h-[5rem] "
                : "h-full w-full"
            } object-cover`}
          />
        </div>
        <div className="flex flex-col w-full gap-7">
          {Object.keys(details).map((key: string) => (
            <div key={key} className="flex flex-col w-full gap-y-7">
              <span className="text-sm font-medium w-full">{key}</span>
              <span className="text-sm  border-[1.2px] w-full rounded-lg p-4 border-[#636669]">
                {details[key]}
              </span>
            </div>
          ))}
        </div>
        <Button
          classname="w-full"
          onClick={() => navigate("/send-nft", { state: data })}
        >
          Sent
        </Button>
      </div>
      <Footer />
    </PageWrapper>
  );
};

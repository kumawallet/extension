import { useLocation, useNavigate } from "react-router-dom";
import { HeaderBack } from "@src/components/common/HeaderBack";
import { Button, PageWrapper } from "@src/components/common";
import { Footer } from "@src/pages/balance/components";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { validateRecipientAddress } from "@src/utils/transfer";
import { Recipient } from "@src/pages/send/components";
import { object, string } from "yup";
import { useEffect, useState } from "react";
import { useNetworkContext } from "@src/providers";
import { messageAPI } from "@src/messageAPI/api";
import { Chain } from "@src/types";
import { useToast } from "@src/hooks";

interface _data {
  tokenId: string;
  name?: string;
  description?: string;
  image?: string;
  attributes?: any;
  external_url?: string;
  animation_url?: string;
  audio_url?: string;
  owner: string;
  network: string;
  contractAddress: string;
}
export const SendNFT = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data: _data = location.state;
  const {
    state: { chains },
  } = useNetworkContext();
  const { showErrorToast } = useToast();
  const [isValidated, setIsValidated] = useState(false);

  const schema = object({
    recipientAddress: string().test(
      "recipientAddress",
      "invalid_address",
      (value) => {
        if (value?.trim() === "") return false;
        if (!value) return false;
        const validated = validateRecipientAddress(value, "evm");
        if (value.trim().length > 0) setIsValidated(true);
        return validated;
      }
    ),
  });

  const methods = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
  });
  const { watch, handleSubmit, setValue } = methods;

  const recipientAddress = watch("recipientAddress");
  const network = chains.map((_chains) => _chains.chains).flat();
  const networkName = network.find((_network) => _network.id === data.network);
  useEffect(() => {
    setValue("network", data.network || "");
  }, [recipientAddress]);

  const onClick = async () => {
    try {
      if (networkName) {
        await messageAPI.updateTxNFT({
          tx: {
            name: data.name || "",
            contractAddress: data.contractAddress,
            destinationAddress: recipientAddress,
            network: networkName as Chain,
            tokenId: data.tokenId,
            owner: data.owner,
            senderAddress: data.owner,
          },
        });
        navigate("/confirm-tx-nft", {
          state: {
            ...data,
            recipientAddress: recipientAddress,
          },
        });
      } else {
        showErrorToast("no found network");
      }
    } catch (error) {
      console.log("Error", error);
      showErrorToast("Updated Error");
    }
  };

  return (
    <PageWrapper contentClassName="mt-1/2 ">
      <HeaderBack title={"title"} navigate={navigate} />
      <div className=" w-full flex flex-col gap-7 pb-[3rem]">
        <FormProvider {...methods}>
          <div>
            <div className=" !h-[14rem] w-full flex items-center justify-center">
              <img
                src={
                  !data.image || (data.image && data.image === "/")
                    ? "/icon-128.png"
                    : data.image
                }
                alt="image"
                className={`${
                  data.image === "/" || !data.image
                    ? "md:h-[3rem] h-[2rem]"
                    : "h-full"
                } object-cover`}
              />
            </div>
            <Recipient containerClassname="my-4" />
            {networkName && (
              <div className="flex flex-col w-full gap-y-1">
                <span className="text-xs font-medium w-full">Network</span>
                <span className="text-sm  border-[1.2px] w-full rounded-lg p-4 border-[#636669]">
                  {networkName.name}
                </span>
              </div>
            )}
          </div>
          <div className="w-full flex justify-between gap-5">
            <Button classname="w-full">Cancel</Button>
            <Button
              classname="w-full"
              onClick={handleSubmit(onClick)}
              isDisabled={!isValidated}
            >
              Sent
            </Button>
          </div>
        </FormProvider>
      </div>
      <Footer />
    </PageWrapper>
  );
};

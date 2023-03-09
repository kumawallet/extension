import { FC, useEffect } from "react";
import { LoadingButton, PageWrapper } from "@src/components/common";
import { useAccountContext, useNetworkContext } from "@src/providers";
import { useTranslation } from "react-i18next";
import Extension from "@src/Extension";
import { ethers } from "ethers";
import { Keyring } from "@polkadot/keyring";
import { u8aToHex } from "@polkadot/util";
import { parseIncomingQuery } from "@src/utils/utils";

interface SignMessageProps {
  query: string;
}

export const SignMessage: FC<SignMessageProps> = ({ query }) => {
  const { t } = useTranslation("sign_message");

  const {
    state: { api, type },
  } = useNetworkContext();
  const {
    state: { selectedAccount },
  } = useAccountContext();

  const { params, ...metadata } = parseIncomingQuery(query);

  // console.log({
  //   params,
  //   metadata,
  // });

  useEffect(() => {
    chrome.runtime.connect({ name: "sign_message" });
  }, []);

  const sign = async () => {
    try {
      let signedMessage = "";
      if (type.toLowerCase() === "wasm") {
        const mnemonic = await Extension.showSeed();
        const keyring = new Keyring({ type: "sr25519" });

        const signer = keyring.addFromMnemonic(mnemonic as string);
        const _message = await signer.sign(params?.message);
        signedMessage = u8aToHex(_message);

        console.log("sign wasm:");
        console.log(signedMessage);
      }

      if (type.toLowerCase() === "evm") {
        const pk = await Extension.showPrivateKey();

        const signer = new ethers.Wallet(
          pk as string,
          api as ethers.providers.JsonRpcProvider
        );

        signedMessage = await signer.signMessage(params?.message);
        console.log("sign evm:");
        console.log(signedMessage);
      }

      const { id } = await chrome.windows.getCurrent();

      await chrome.runtime.sendMessage({
        from: "popup",
        origin: metadata.origin,
        method: `${metadata.method}_response`,
        fromWindowId: id,
        toTabId: metadata.tabId,
        response: {
          message: signedMessage,
        },
      });
    } catch (error) {
      console.log(error);
    }
  };

  const onClose = async () => {
    const { id } = await chrome.windows.getCurrent();

    await chrome.runtime.sendMessage({
      from: "popup",
      origin: metadata.origin,
      method: `${metadata.method}_response`,
      fromWindowId: id,
      toTabId: metadata.tabId,
      response: null,
    });
  };

  return (
    <PageWrapper contentClassName="h-full">
      <div className="flex flex-col mx-auto h-full py-3">
        <div className="flex-1">
          <div className="flex gap-3 items-center mb-7">
            <p className="text-xl">{t("title")}</p>
          </div>
          <div>
            <p>account:</p>
            <p>{selectedAccount?.value?.address || ""}</p>
          </div>
          <div>
            <p>Message:</p>
            <p>{params?.message || ""}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <LoadingButton onClick={onClose}>{t("cancel")}</LoadingButton>
          <LoadingButton onClick={sign}>{t("Sign")}</LoadingButton>
        </div>
      </div>
    </PageWrapper>
  );
};

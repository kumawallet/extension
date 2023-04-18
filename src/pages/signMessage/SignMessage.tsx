import { FC } from "react";
import { LoadingButton, PageWrapper } from "@src/components/common";
import { useAccountContext, useNetworkContext } from "@src/providers";
import { useTranslation } from "react-i18next";
import Extension from "@src/Extension";
import { ethers } from "ethers";
import { Keyring } from "@polkadot/keyring";
import { u8aToHex } from "@polkadot/util";
import { getWebAPI } from "@src/utils/env";
import { useToast } from "@src/hooks";

const WebAPI = getWebAPI();

interface SignMessageProps {
  params?: {
    message: string;
  };
  onClose?: () => void;
  metadata?: Record<string, string>;
}

export const SignMessage: FC<SignMessageProps> = ({
  params,
  metadata,
  onClose,
}) => {
  const { message } = params as { message: string };

  const { t } = useTranslation("sign_message");

  const {
    state: { api, type },
  } = useNetworkContext();
  const {
    state: { selectedAccount },
  } = useAccountContext();

  const { showErrorToast } = useToast();

  const sign = async () => {
    try {
      let signedMessage = "";
      if (type.toLowerCase() === "wasm") {
        const mnemonic = await Extension.showSeed();
        const keyring = new Keyring({ type: "sr25519" });

        const signer = keyring.addFromMnemonic(mnemonic as string);
        const _message = await signer.sign(message);
        signedMessage = u8aToHex(_message);
      }

      if (type.toLowerCase() === "evm") {
        const pk = await Extension.showPrivateKey();

        const signer = new ethers.Wallet(
          pk as string,
          api as ethers.providers.JsonRpcProvider
        );

        signedMessage = await signer.signMessage(message);
      }

      const { id } = await WebAPI.windows.getCurrent();

      await WebAPI.runtime.sendMessage({
        from: "popup",
        origin: metadata?.origin,
        method: `${metadata?.method}_response`,
        fromWindowId: id,
        toTabId: metadata?.tabId,
        response: {
          message: signedMessage,
        },
      });
    } catch (error) {
      showErrorToast(error);
    }
  };

  return (
    <PageWrapper contentClassName="h-full">
      <div className="flex flex-col mx-auto h-full py-3">
        <div className="flex-1">
          <div className="flex gap-3 items-center mb-7">
            <p className="text-xl">{t("title")}</p>
          </div>
          <div className="mb-4">
            <label htmlFor="account" className="block text-sm font-medium mb-1">
              {t("account")}:
            </label>
            <input
              id="account"
              className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-8 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
              readOnly
              aria-disabled
              value={selectedAccount?.value?.address || ""}
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">
              {t("message")}:
            </label>
            <textarea
              id="message"
              className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-8 bg-gray-700 border-gray-600 placeholder-gray-400 text-white resize-none"
              readOnly
              aria-disabled
              value={message || ""}
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <LoadingButton onClick={onClose}>{t("cancel")}</LoadingButton>
          <LoadingButton onClick={sign}>{t("sign")}</LoadingButton>
        </div>
      </div>
    </PageWrapper>
  );
};

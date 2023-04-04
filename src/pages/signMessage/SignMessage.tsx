import { FC, useEffect, useState } from "react";
import {
  ConfirmTrustedSite,
  LoadingButton,
  PageWrapper,
} from "@src/components/common";
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
  const [trustedSites, setTrustedSites] = useState<string[]>([]);

  const {
    state: { api, type },
  } = useNetworkContext();
  const {
    state: { selectedAccount },
  } = useAccountContext();

  const { params, ...metadata } = parseIncomingQuery(query);
  const { message, origin } = params as any;

  const getTrustedSites = async () => {
    const sites = await Extension.getTrustedSites();
    setTrustedSites(sites);
  };

  const isTrustedSite = () => {
    return trustedSites.includes(origin);
  };

  useEffect(() => {
    chrome.runtime.connect({ name: "sign_message" });
    getTrustedSites();
  }, []);

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

  const saveTrustedSite = async () => {
    const trustedSites = await Extension.getTrustedSites();
    if (trustedSites && !trustedSites.includes(origin)) {
      await Extension.addTrustedSite(origin);
      setTrustedSites([...trustedSites, origin]);
    }
  };

  if (!isTrustedSite()) {
    return (
      <ConfirmTrustedSite
        confirm={saveTrustedSite}
        cancel={onClose}
        origin={origin}
      />
    );
  }

  return (
    <PageWrapper contentClassName="h-full">
      <div className="flex flex-col mx-auto h-full py-3">
        <div className="flex-1">
          <div className="flex gap-3 items-center mb-7">
            <p className="text-xl">{t("title")}</p>
          </div>
          <div>
            <p>Account:</p>
            <p>{selectedAccount?.value?.address || ""}</p>
          </div>
          <div>
            <p>Message:</p>
            <p>{message || ""}</p>
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

import { FC } from "react";
import { LoadingButton, PageWrapper } from "@src/components/common";
import { useAccountContext, useNetworkContext } from "@src/providers";
import { useTranslation } from "react-i18next";
import Extension from "@src/Extension";
import { ethers } from "ethers";
import { ApiPromise } from "@polkadot/api";
import { Keyring } from "@polkadot/keyring";
import { u8aToHex } from "@polkadot/util";

interface SignMessageProps {
  message: string;
}

export const SignMessage: FC<SignMessageProps> = ({ message }) => {
  const { t } = useTranslation("sign_message");

  const {
    state: { api, type },
  } = useNetworkContext();
  const {
    state: { selectedAccount },
  } = useAccountContext();

  const sign = async () => {
    try {
      let signedMessage = "";
      if (type.toLowerCase() === "wasm") {
        const mnemonic = await Extension.showSeed();
        const keyring = new Keyring({ type: "sr25519" });

        const signer = keyring.addFromMnemonic(mnemonic as string);
        const _message = await signer.sign(message);
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

        signedMessage = await signer.signMessage(message);
        console.log("sign evm:");
        console.log(signedMessage);
      }

      const { id } = await chrome.windows.getCurrent();

      await chrome.runtime.sendMessage({
        message: signedMessage,
        from: "signed_tab",
        id,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <PageWrapper>
      <div className="mx-auto">
        <div className="flex gap-3 items-center mb-7">
          <p className="text-xl">{t("title")}</p>
        </div>
        <div>
          <p>account:</p>
          <p>{selectedAccount?.value?.address || ""}</p>
        </div>
        <div>
          <p>Message:</p>
          <p>{message}</p>
        </div>
        <div className="flex gap-2 justify-end">
          <LoadingButton>{t("cancel")}</LoadingButton>
          <LoadingButton onClick={sign}>{t("Sign")}</LoadingButton>
        </div>
      </div>
    </PageWrapper>
  );
};

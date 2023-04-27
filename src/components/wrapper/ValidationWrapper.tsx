import Extension from "@src/Extension";
import { useLoading } from "@src/hooks";
import { SignIn } from "@src/pages";
import { useAccountContext, useNetworkContext } from "@src/providers";
import {
  FC,
  PropsWithChildren,
  cloneElement,
  useEffect,
  useState,
} from "react";
import { ConfirmTrustedSite } from "../common";
import { parseIncomingQuery } from "@src/utils/utils";
import { getWebAPI } from "@src/utils/env";

const WebAPI = getWebAPI();

interface ValidationWrapperProps extends PropsWithChildren {
  query: string;
}

export const ValidationWrapper: FC<ValidationWrapperProps> = ({
  query,
  children,
}) => {
  const { params, ...metadata } = parseIncomingQuery(query);
  const { origin } = params as any;

  const [trustedSites, setTrustedSites] = useState<string[]>([]);
  const [isSessionActive, setIsSessionActive] = useState(false);

  const {
    state: { api },
  } = useNetworkContext();
  const {
    state: { selectedAccount },
  } = useAccountContext();

  const { isLoading, starLoading, endLoading } = useLoading();

  const getTrustedSites = async () => {
    const sites = await Extension.getTrustedSites();
    setTrustedSites(sites);
  };

  const isTrustedSite = () => {
    return trustedSites.includes(origin);
  };

  const saveTrustedSite = async () => {
    const trustedSites = await Extension.getTrustedSites();
    if (trustedSites && !trustedSites.includes(origin)) {
      await Extension.addTrustedSite(origin);
      setTrustedSites([...trustedSites, origin]);
    }
  };

  const onClose = async () => {
    const { id } = await WebAPI.windows.getCurrent();

    await WebAPI.runtime.sendMessage({
      from: "popup",
      origin: metadata.origin,
      method: `${metadata.method}_response`,
      fromWindowId: id,
      toTabId: metadata.tabId,
      response: null,
    });
  };

  useEffect(() => {
    (async () => {
      starLoading();

      if (selectedAccount && selectedAccount) {
        const isSessionActive = await Extension.isSessionActive();
        setIsSessionActive(isSessionActive);

        await getTrustedSites();

        endLoading();
      }
    })();
  }, [api, selectedAccount]);

  if (isLoading) {
    return null;
  }

  if (!isSessionActive) {
    return <SignIn />;
  }

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
    <>
      {cloneElement(children as any, {
        params,
        metadata,
        onClose,
      })}
    </>
  );
};

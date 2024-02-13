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
import { messageAPI } from "@src/messageAPI/api";

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

  const { isLoading, starLoading, endLoading } = useLoading(true);

  const getTrustedSites = async () => {
    const sites = await messageAPI.getTrustedSites();
    setTrustedSites(sites);
  };

  const isTrustedSite = () => {
    return trustedSites.includes(origin);
  };

  const saveTrustedSite = async () => {
    const trustedSites = await messageAPI.getTrustedSites();
    if (trustedSites && !trustedSites.includes(origin)) {
      await messageAPI.addTrustedSite({ site: origin });
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

  const load = async () => {
    starLoading();
    const isSessionActive = await messageAPI.isSessionActive();
    setIsSessionActive(isSessionActive);

    await getTrustedSites();

    endLoading();
  };

  useEffect(() => {
    (async () => {
      if (selectedAccount?.value?.address && api) {
        load();
      }
    })();
  }, [api, selectedAccount]);

  if (isLoading) {
    return null;
  }

  if (!isSessionActive) {
    return <SignIn afterSignIn={load} />;
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

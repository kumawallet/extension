import { FC, useEffect, useState } from "react";
import { useNetworkContext } from "@src/providers";
import Extension from "@src/Extension";
import { SettingKey, SettingType } from "@src/storage/entities/settings/types";
import { Chain } from "@src/storage/entities/Chains";

interface NetworkIconProps {
  networkName: string;
  width: number;
  chains: Chain[];
}

export const NetworkIcon: FC<NetworkIconProps> = ({
  networkName,
  width,
  chains,
}) => {
  const network = chains?.find((chain) => chain.name === networkName) as Chain;

  if (!networkName || !network) return null;

  return (
    <img
      src={`/images/${network?.logo}.png`}
      width={width}
      className="object-cover rounded-full"
    />
  );
};

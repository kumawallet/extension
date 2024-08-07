import { Chain } from "@src/types";
import { FC } from "react";


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
      src={network?.logo}
      width={width}
      className="object-cover rounded-full"
    />
  );
};

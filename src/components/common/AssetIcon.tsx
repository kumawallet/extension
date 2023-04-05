import { FC } from "react";
import { useNetworkContext } from "@src/providers";
import { RiCopperCoinLine } from "react-icons/ri";
import { IAsset } from "@src/types";

interface AssetIconProps {
  asset: IAsset | null;
  width: number;
}

export const AssetIcon: FC<AssetIconProps> = ({ asset, width }) => {
  const {
    state: { selectedChain },
  } = useNetworkContext();

  if (!asset) return null;

  return (
    <>
      {asset.id === "-1" ? (
        <img
          src={`/images/${selectedChain.logo}.png`}
          width={width}
          className="object-cover rounded-full"
        />
      ) : (
        <RiCopperCoinLine size={width} color={asset.color || "#fff"} />
      )}
    </>
  );
};

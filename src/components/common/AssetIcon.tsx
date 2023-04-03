import { FC } from "react";
import { useNetworkContext } from "@src/providers";
import { Asset } from "@src/providers/assetProvider/types";
import { RiCopperCoinLine } from "react-icons/ri";

interface AssetIconProps {
  asset: Asset | null;
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

import { FC } from "react";
import { useNetworkContext } from "@src/providers";
import { IAsset } from "@src/types";
import { ASSETS_ICONS } from "@src/constants/assets-icons";

interface AssetIconProps {
  asset: IAsset | null;
  width: number;
}

export const AssetIcon: FC<AssetIconProps> = ({ asset, width }) => {
  const {
    state: { selectedChain },
  } = useNetworkContext();

  if (!asset || !selectedChain) return null;

  const assetSymbol = asset.symbol?.toUpperCase() || "";

  const icon = ASSETS_ICONS[assetSymbol] || null
  return (
    <>
      {icon ? (
        <img
          src={icon}
          width={width}
          className="object-cover rounded-full"
        />
      ) : (
        <div style={{
          width: width,
          height: width,
          borderRadius: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "gray",
        }}>
          {asset.symbol?.charAt(0).toUpperCase()}
        </div>
      )}
    </>
  );
};

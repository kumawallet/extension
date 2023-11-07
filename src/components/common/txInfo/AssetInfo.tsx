import { FC } from "react";
import { RiCopperCoinLine } from "react-icons/ri";

interface AssetInfoProps {
  asset: {
    symbol: string;
    image: string | null;
  };
  amount: string
  dataTestId: string;
}

export const AssetInfo: FC<AssetInfoProps> = ({ asset, amount, dataTestId }) => {

  return (
    <div className="flex flex-col items-center" data-testid={dataTestId}>
      <div className="flex gap-2 items-center">
        {
          asset.image ? (
            <>
              <img
                src={asset.image}
                width={30}
                className="object-cover rounded-full"
              />
              <p className="font-inter uppercase">{asset?.symbol}</p>
            </>
          ) : (
            <RiCopperCoinLine size={30} color={asset?.color || "#fff"} />
          )
        }
      </div>
      <p className="font-inter">
        <span className=" font-bold text-[27px] mr-2">{amount}</span>
        <span className="uppercase">{asset?.symbol}</span>
      </p>
    </div>
  );
};

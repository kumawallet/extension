import { FC } from "react";
import { RiCopperCoinLine } from "react-icons/ri";

interface AssetInfoProps {
  asset: {
    symbol: string;
    image: string | null;
  };
  amount: string;
  dataTestId: string;
  isAproximate?: boolean;
  className?: string;
}

export const AssetInfo: FC<AssetInfoProps> = ({
  asset,
  amount,
  dataTestId,
  isAproximate,
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center ${className}`} data-testid={dataTestId}>
      <div className="flex gap-2 items-center">
        {asset.image ? (
          <>
            <img
              src={asset.image}
              width={30}
              className="object-cover rounded-full"
            />
            {/* <p className="font-inter uppercase">{asset?.symbol}</p> */}
          </>
        ) : (
          <>
            {/* 
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore */}
            <RiCopperCoinLine size={30} color={asset?.color || "#fff"} />
          </>
        )}
      </div>
      <p className="font-inter font-bold md:text-[27px] mt-2">
        {isAproximate && "≅"} {amount}
        <span className="uppercase text-xs md:text-base">{asset?.symbol}</span>
      </p>
    </div>
  );
};

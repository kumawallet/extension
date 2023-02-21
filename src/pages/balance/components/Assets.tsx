import { BsArrowUpRight } from "react-icons/bs";
import { Asset } from "../Balance";
import { formatAmountWithDecimals } from "@src/utils/assets";
import { Loading } from "@src/components/common";

export const Assets = ({
  assets = [],
  isLoading = false,
}: {
  assets: Asset[];
  isLoading: boolean;
}) => {
  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      {assets.map((asset, index) => (
        <div
          key={index.toString()}
          className="bg-[#343A40] px-8 py-4 rounded-xl flex gap-2 items-center justify-between"
        >
          <div className="flex gap-2 items-center">
            <div className="w-6 h-6 bg-black rounded-full" />
            <div className="flex gap-1 text-xl">
              <p>{formatAmountWithDecimals(asset.amount, 6)}</p>
              <p>{asset.symbol}</p>
            </div>
          </div>

          <button className="bg-none outline-none rounded-full">
            <BsArrowUpRight
              size={23}
              className="hover:bg-custom-green-bg rounded-full"
            />
          </button>
        </div>
      ))}
    </>
  );
};

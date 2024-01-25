import { FC } from "react";
import { useCopyToClipboard } from "@src/hooks";
import { cropAccount } from "@src/utils/account-utils";

interface ChainInfoProps {
  chain: {
    name: string;
    image: string;
  };
  address: string;
  dataTestId: string;
  className?: string;
}

export const ChainInfo: FC<ChainInfoProps> = ({ chain, address, dataTestId, className }) => {
  const { Icon, copyToClipboard } = useCopyToClipboard(address);

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`} data-testid={dataTestId}>
      <div className="flex gap-2 items-center">
        <img
          src={chain.image}
          width={29}
          height={29}
          className="object-cover rounded-full"
        />
        <p>{chain.name}</p>
      </div>
      <button className={`flex items-center ${chain.name ? "gap-2" : "gap-1"}`} onClick={copyToClipboard}>
        <p className="text-[#FFC300] text-[10px] sm:text-xs">{cropAccount(address || "")}</p>
        <Icon
          messagePosition="right"
          iconProps={{
            color: "#FFC300",
          }}
        />
      </button>
    </div>
  );
};

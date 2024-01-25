import { FC } from "react";
import { TxInfo } from "@src/components/common";
import { useFormContext } from "react-hook-form";
import { useAccountContext } from "@src/providers";

interface ConfirmTxProps {
  fee: {
    gasLimit: string;
    estimatedFee: string;
    estimatedTotal: string;
  }
  onConfirm: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export const ConfirmTx: FC<ConfirmTxProps> = ({ onConfirm, onBack, isLoading, fee }) => {
  const {
    state: { selectedAccount },
  } = useAccountContext();

  const { getValues, watch } = useFormContext();

  const destinationAccount = getValues("destinationAccount");
  const originAccount = getValues("from");
  const destinationChain = getValues("to");
  const asset = watch("asset");
  const amount = getValues("amount");

  const originChainName = originAccount.name;



  return (
    <TxInfo
      addressFrom={selectedAccount.value.address}
      addressTo={destinationAccount}
      amountFrom={amount}
      amountTo={amount}
      assetFrom={{
        symbol: asset.symbol,
        image: asset.id === "-1" ? `/images/${originAccount.logo}.png` : null
      }}
      assetTo={{
        symbol: asset.symbol,
        image: asset.id === "-1" ? `/images/${originAccount.logo}.png` : null
      }}
      chainFrom={{
        name: originChainName,
        image: `/images/${originAccount.logo}.png`,

      }}
      chainTo={{
        name: destinationChain.name,
        image: `/images/${destinationChain.logo}.png`,
      }}
      onConfirm={onConfirm}
      isLoading={isLoading}
      onBack={onBack}
      fee={{
        gasLimit: fee.gasLimit.toString(),
        estimatedFee: fee.estimatedFee.toString(),
        estimatedTotal: fee.estimatedTotal.toString(),
      }}
    />
  );
};

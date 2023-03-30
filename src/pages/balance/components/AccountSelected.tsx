import { useAccountContext } from "@src/providers";
import { cropAccount } from "@src/utils/account-utils";
import { useCopyToClipboard } from "@src/hooks/common/useCopyToClipboard";

export const AccountSelected = () => {
  const {
    state: { selectedAccount },
  } = useAccountContext();

  const account = cropAccount(selectedAccount?.value?.address);

  const { Icon, copyToClipboard } = useCopyToClipboard(account || "");

  return (
    <>
      <button
        onClick={copyToClipboard}
        className="flex items-center gap-1"
        data-testid="account-button"
      >
        <Icon />
        <p className="text-custom-green-bg">{account}</p>
      </button>
    </>
  );
};

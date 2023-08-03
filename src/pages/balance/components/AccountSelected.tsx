import { useAccountContext, useThemeContext } from "@src/providers";
import { cropAccount } from "@src/utils/account-utils";
import { useCopyToClipboard } from "@src/hooks/common/useCopyToClipboard";

export const AccountSelected = () => {
  const {
    state: { selectedAccount },
  } = useAccountContext();

  const { color } = useThemeContext();

  const account = cropAccount(selectedAccount?.value?.address);

  const { Icon, copyToClipboard } = useCopyToClipboard(
    selectedAccount?.value?.address || ""
  );

  return (
    <>
      <button
        onClick={copyToClipboard}
        className="flex items-center gap-1"
        data-testid="account-button"
      >
        <Icon />
        <p
          className={`text-${color}-primary`}
          style={{
            color,
          }}
        >
          {account}
        </p>
      </button>
    </>
  );
};

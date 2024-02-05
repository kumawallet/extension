import { useAccountContext, useThemeContext } from "@src/providers";
import { cropAccount } from "@src/utils/account-utils";
import { useCopyToClipboard } from "@src/hooks/common/useCopyToClipboard";

export const AccountSelected = () => {
  const {
    state: { selectedAccount },
  } = useAccountContext();

  const { color } = useThemeContext();

  const address = selectedAccount?.value?.address || "";

  const account = cropAccount(address, 8);

  const { Icon, copyToClipboard } = useCopyToClipboard(address);

  return (
    <>
      <button
        onClick={copyToClipboard}
        className={`flex items-center gap-1 w-fit bg-${color}-primary bg-opacity-[0.25] hover:bg-opacity-15 rounded-full px-4 py-[0.1rem] mx-auto`}
        data-testid="account-button"
      >
        <Icon
          iconProps={{
            className: `text-${color}-primary fill-${color}-primary`,
          }}
        />
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

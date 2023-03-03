import { useAccountContext } from "@src/providers";
import { cropAccount } from "@src/utils/account-utils";
import { useState } from "react";
import { FiCopy } from "react-icons/fi";
import { useClick, useFloating, useInteractions } from "@floating-ui/react";

export const AccountSelected = () => {
  const {
    state: { selectedAccount },
  } = useAccountContext();

  const [isOpen, setIsOpen] = useState(false);

  const { x, y, strategy, refs, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
  });

  const click = useClick(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([click]);

  const account = cropAccount(selectedAccount?.value?.address);

  const copyAccount = async () => {
    setIsOpen(true);
    await navigator.clipboard.writeText(selectedAccount?.value?.address);
    setTimeout(() => {
      setIsOpen(false);
    }, 1000);
  };

  return (
    <>
      <button
        ref={refs.setReference}
        {...getReferenceProps()}
        className="flex items-center gap-1"
        onClick={copyAccount}
        data-testid="account-button"
      >
        <FiCopy />
        <p className="text-custom-green-bg">{account}</p>
      </button>
      {isOpen && (
        <div
          ref={refs.setFloating}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            zIndex: 10,
          }}
          {...getFloatingProps()}
          className="border border-[#343A40] rounded-xl p-2 bg-black bg-opacity-70"
        >
          Copied
        </div>
      )}
    </>
  );
};

import { FC, InputHTMLAttributes, LegacyRef } from "react";
import { useTranslation } from "react-i18next";
import { PiEyeClosedLight, PiEyeLight } from "react-icons/pi";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  placeholder: string;
  error?: string;
  isHidden: boolean;
  onToggleVisibility?: () => void;
  showIcon?: boolean;
  innerRef: LegacyRef<HTMLInputElement>
}

const ICON_SIZE = 20;

export const PasswordInput: FC<PasswordInputProps> = ({
  error,
  isHidden,
  placeholder,
  onToggleVisibility,
  showIcon = false,
  innerRef,
  ...other
}) => {
  const { t } = useTranslation("account_form")

  return (
    <div className="relative w-full">
      <input
        ref={innerRef}
        type={isHidden ? "password" : "text"}
        className={`w-full ${showIcon ? "pl-4 pr-12" : "px-4"} py-6 border border-[#636669] rounded-xl bg-transparent text-white focus:outline-none text-xl placeholder:font-normal placeholder:text-gray-200 focus:ring-white`}
        placeholder={placeholder}
        {...other}
      />
      {
        showIcon && (
          <button
            tabIndex={-1}
            className="absolute top-1/2 right-6 -translate-y-1/2"
            onClick={onToggleVisibility}
          >
            {isHidden ? <PiEyeLight size={ICON_SIZE} /> : <PiEyeClosedLight size={ICON_SIZE} />}
          </button>
        )
      }

      {error && (
        <div className="mt-1 text-xs text-red-500">
          {t(error)}
        </div>
      )}
    </div>
  )
}

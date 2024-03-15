import { useState } from "react"
import { useTranslation } from "react-i18next"
import { PasswordInput } from "./PasswordInput"
import { useFormContext } from "react-hook-form"
import { CreateWalletFormValues } from "@src/pages/createWallet/validations"
import { ImportWalletFormValues } from "@src/pages/importWallet/validations"
import { RiKey2Fill } from "react-icons/ri";



export const CreatePasswordStep = () => {
  const { t } = useTranslation("account_form")
  const { register, formState: { errors }, getValues, setValue } = useFormContext<CreateWalletFormValues | ImportWalletFormValues>()

  const [showPassword, setShowPassword] = useState(false)

  const { ref: refPassword, ...registerPassword } = register("password")
  const { ref: refConfirmPassword, ...registerConfirmPassword } = register("confirmPassword")

  return (
    <div className="flex flex-col gap-5 mt-6 md:mt-10">
      <PasswordInput
        isHidden={!showPassword}
        placeholder={t('enter_password')}
        showIcon
        onToggleVisibility={() => setShowPassword(!showPassword)}
        innerRef={refPassword}
        leftIcon={<RiKey2Fill size={20} />}
        {...registerPassword}
      />
      <PasswordInput
        isHidden={!showPassword}
        placeholder={t('re_enter_password')}
        innerRef={refConfirmPassword}
        error={errors.confirmPassword?.message as string || ""}
        {...registerConfirmPassword}
      />

      <p className="text-gray-300">{t("password_requirements")}</p>


      <div className="flex items-center gap-2">
        <input
          id="checked-checkbox"
          type="checkbox"
          value=""
          checked={getValues('agreeWithTerms')}
          onChange={() => setValue('agreeWithTerms', !getValues('agreeWithTerms'))}
          className="w-4 h-4 bg-transparent border border-gray-300 rounded-sm checked:bg-[#12B28C] checked:border-[#12B28C]" />
        <label htmlFor="checked-checkbox" className="text-base text-gray-300">
          {t("i_agree")}
          <a href="#" className="text-blue-500">{" "}{t("terms_of_service")}</a>
        </label>
      </div>
    </div>
  )
}

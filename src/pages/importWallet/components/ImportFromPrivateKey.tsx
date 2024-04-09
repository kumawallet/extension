import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { ImportWalletFormValues } from "../validations"
import { useState } from "react"
import { PasswordInput } from "@src/components/accountForm/PasswordInput"

export const ImportFromPrivateKey = () => {
  const { t } = useTranslation("account_form")
  const { formState: { errors }, register } = useFormContext<ImportWalletFormValues>()

  const [showPrivateKey, setShowPrivateKey] = useState(false)

  const { ref, ...registerPrivateKey } = register("privateKeyOrSeed")

  return (
    <>
      <div className="relative w-full mt-4 md:mt-12  bg-[#1C1C27]">
        <PasswordInput
          data-testid="privateKey"
          isHidden={!showPrivateKey}
          placeholder={t('private_key_placeholder')}
          showIcon
          onToggleVisibility={() => setShowPrivateKey(!showPrivateKey)}
          innerRef={ref}
          error={errors.privateKeyOrSeed?.message as string || ""}
          {...registerPrivateKey}
          className="border-0 bg-[#1C1C27] h-4 w-full px-4 py-6 hover:border-0 text-white"
        />
      </div>
      <p className="text-white opacity-80 mb-10 mt-4 text-xs font-light md:tracking-wider">{t("import_account_warning")}</p>
    </>
  )
}
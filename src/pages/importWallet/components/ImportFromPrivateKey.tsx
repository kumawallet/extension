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
      <div className="relative w-full mt-4 md:mt-12">
        <PasswordInput
          isHidden={!showPrivateKey}
          placeholder={t('private_key_placeholder')}
          showIcon
          onToggleVisibility={() => setShowPrivateKey(!showPrivateKey)}
          innerRef={ref}
          error={errors.privateKeyOrSeed?.message as string || ""}
          {...registerPrivateKey}
        />
      </div>
      <p className="text-gray-300 mt-4 md:mt-10 md:text-sm md:tracking-wider">{t("import_account_warning")}</p>
    </>
  )
}
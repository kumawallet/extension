import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { ImportWalletFormValues } from "../validations"
import { useState } from "react"
import { PasswordInput } from "@src/components/accountForm/PasswordInput"
import { SelectAccountType } from "@src/components/accountForm"
import { ASSETS_ICONS } from "@src/constants/assets-icons"
import { AccountType } from "@src/accounts/types"

export const ImportFromPrivateKey = () => {
  const { t } = useTranslation("account_form")
  const { formState: { errors }, register, setValue } = useFormContext<ImportWalletFormValues>()

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
      <p className="text-white opacity-80 mb-10 mt-4 md:mt-10 md:text-sm md:tracking-wider">{t("import_account_warning")}</p>
      <SelectAccountType
        containerClassname="mt-2"
        type="import"
        options={[
          {
            label: "Ethereum",
            value: AccountType.EVM,
            logo: ASSETS_ICONS['ETH']
          },
          {
            label: "Open Libra",
            value: AccountType.OL,
            logo: ASSETS_ICONS['OL']

          }
        ]}
        onChangeOptions={(values) => {
          setValue("accountTypesToImport", values)
        }}
      />
    </>
  )
}
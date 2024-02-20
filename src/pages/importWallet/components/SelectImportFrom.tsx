import { Button } from "@src/components/common"
import { useAccountContext } from "@src/providers"
import { FC, useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

interface SelectImportFromProps {
  onContinue: () => void
}

export const SelectImportFrom: FC<SelectImportFromProps> = ({ onContinue }) => {
  const { t } = useTranslation("account_form")

  const { state: { selectedAccount } } = useAccountContext()
  const { handleSubmit, setValue, } = useFormContext()

  const [typeToImport, setTypeToImport] = useState<null | 'wasm' | 'evm'>(null)

  const onSelected = (type: 'seed' | 'privateKey') => {
    setValue('type', type)
    handleSubmit(onContinue)()
  }

  useEffect(() => {

    if (selectedAccount?.type.toLowerCase().includes("evm")) {
      setTypeToImport('evm')
    } else if (selectedAccount?.type.toLowerCase().includes("wasm")) {
      setTypeToImport('wasm')
    }

  }, [selectedAccount])

  return (
    <>
      <div className="flex flex-col gap-7 mt-10 md:mt-20 mb-8">
        <Button classname="w-full py-6 text-start text-base md:text-2xl" isDisabled={typeToImport === "evm"} variant="contained-gray" onClick={() => onSelected('seed')}>{t("import_from_seed_phrase")}</Button>
        <Button classname="w-full py-6 text-start text-base md:text-2xl" isDisabled={typeToImport === "wasm"} variant="contained-gray" onClick={() => onSelected('privateKey')}>{t('import_from_private_key')}</Button>
      </div>
      <p className="text-gray-300 md:text-sm">{t("import_account_warning")}</p>
    </>
  )
}

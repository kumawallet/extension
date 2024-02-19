import { Button } from "@src/components/common"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

interface SelectImportFromProps {
  onContinue: () => void
}

export const SelectImportFrom: FC<SelectImportFromProps> = ({ onContinue }) => {
  const { t } = useTranslation("account_form")

  const { handleSubmit, setValue, } = useFormContext()

  const onSelected = (type: 'seed' | 'privateKey') => {
    setValue('type', type)
    handleSubmit(onContinue)()
  }

  return (
    <>
      <div className="flex flex-col gap-7 mt-10 md:mt-20 mb-8">
        <Button classname="w-full py-6 text-start text-base md:text-2xl" variant="contained-gray" onClick={() => onSelected('seed')}>{t("import_from_seed_phrase")}</Button>
        <Button classname="w-full py-6 text-start text-base md:text-2xl" variant="contained-gray" onClick={() => onSelected('privateKey')}>{t('import_from_private_key')}</Button>
      </div>
      <p className="text-gray-300 md:text-sm">{t("import_account_warning")}</p>
    </>
  )
}

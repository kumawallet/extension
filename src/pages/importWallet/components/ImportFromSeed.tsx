import { useState } from "react"
import { SeedGrid } from "@src/components/accountForm"
import { useFormContext } from "react-hook-form"
import { ImportWalletFormValues } from "../validations"
import { PiEyeLight } from "react-icons/pi";
import { useTranslation } from "react-i18next";

const WordOption = ({
  text,
  isActive,
  onClick
}: {
  text: string;
  isActive: boolean
  onClick: () => void
}) => {
  return (
    <button className={`rounded-3xl text-center w-1/2 py-2 md:py-3 font-medium md:text-xl ${isActive ? `bg-linear text-white` : "text-[#B0B0CE]"}`} onClick={onClick}>
      {text}
    </button>
  )
}

export const ImportFromSeed = () => {
  const { t } = useTranslation("account_form")
  const { setValue, watch, formState: { errors }, getValues } = useFormContext<ImportWalletFormValues>()

  const [seed, setSeed] = useState<string[]>(() => {
    const seed = getValues("privateKeyOrSeed")
    return seed ? seed.split(" ") : []
  })
  const [showWords, setShowWords] = useState(false)

  const onChangeSeed = (words: string[]) => {
    setSeed(words)
    setValue("privateKeyOrSeed", words.join(" "))
  }

  const seedLength = watch('seedLength')

  return (
    <>
      <div className="flex bg-[#24243B] rounded-3xl w-full mt-6 mb-7">
        <WordOption
          text={t("12_words")}
          isActive={seedLength === 12}
          onClick={() => setValue("seedLength", 12)}
        />
        <WordOption
          text={t("24_words")}
          isActive={seedLength === 24}
          onClick={() => setValue("seedLength", 24)}
        />
      </div>

      <SeedGrid
        gridTotal={seedLength}
        words={seed}
        isEditable
        onChangeWords={onChangeSeed}
        showWords={showWords}
      />
      <button className="flex gap-2 items-center  mt-2 md:mt-4 font-poppins font-medium" onClick={() => setShowWords(!showWords)}>
        <PiEyeLight size={18} />
        {t("show_recovery_phrase")}
      </button>
      {errors.privateKeyOrSeed?.message && <p className="text-red-500 text-xs">{t(errors.privateKeyOrSeed?.message)}</p>}
    </>
  )
}

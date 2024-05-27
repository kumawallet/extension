import { useState } from "react"
import { SeedGrid, SelectAccountType } from "@src/components/accountForm"
import { useFormContext } from "react-hook-form"
import { ImportWalletFormValues } from "../validations"
import { PiEyeLight } from "react-icons/pi";
import { useTranslation } from "react-i18next";
import { AccountType } from "@src/accounts/types";
import { ASSETS_ICONS } from "@src/constants/assets-icons";

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
    <button className={`rounded-2xl text-center w-1/2 py-3 font-medium md:text-xl ${isActive ? `bg-linear text-white` : "text-[#B0B0CE]"}`} onClick={onClick}>
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
      <button className="flex gap-2 items-center  mt-2 md:mt-4 font-poppins text-white opacity-80 font-normal" onClick={() => setShowWords(!showWords)}>
        <PiEyeLight size={18} />
        <p className="text-[0.65rem]">
          {t("show_recovery_phrase")}
        </p>
      </button>
      {errors.privateKeyOrSeed?.message && <p className="text-red-500 text-xs">{t(errors.privateKeyOrSeed?.message)}</p>}
      <SelectAccountType
        containerClassname="mt-2"
        type="import"
        options={[
          {
            label: "Polkadot",
            value: AccountType.WASM,
            logo: ASSETS_ICONS['DOT']
          },
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

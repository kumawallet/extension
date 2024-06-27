import { FC } from "react"
import { useTranslation } from "react-i18next"
import { AccountFormInsideWrapper } from "./AccountFormInsideWrapper";
import { RecoveryPhrase } from "@src/components/accountForm/RecoveryPhrase";
import { FormProvider, useForm } from "react-hook-form";
import { mnemonicGenerate } from "@polkadot/util-crypto";
import { Button } from "@src/components/common";
import { useAccountContext } from "@src/providers";
import { useLoading } from "@src/hooks";
import Account from "@src/storage/entities/Account";
import { SelectAccountToDerive } from "./SelectAccountToDerive";

interface CreateWalletFromInsideProps {
  onBack: () => void
  onFinish: () => void
  onClose: () => void
}

interface CreateWalletFromInsideForm {
  seed: string
  account: Account | null
}

export const CreateWalletFromInside: FC<CreateWalletFromInsideProps> = ({
  onBack,
  onFinish,
  onClose
}) => {
  const { t } = useTranslation("account_form")

  const { createAccount, deriveAccount } = useAccountContext()

  const { isLoading, starLoading, endLoading } = useLoading()

  const methods = useForm<CreateWalletFromInsideForm>({
    defaultValues: {
      seed: mnemonicGenerate(12),
      account: null
    }
  })

  const { handleSubmit, setValue, watch } = methods

  const onCreateFromSeed = async (data: CreateWalletFromInsideForm) => {
    starLoading()

    const result = await createAccount({
      name: "",
      seed: data.seed,
      isSignUp: false
    })

    endLoading()

    if (result) {
      onFinish()
    }
  }

  const onDerivate = async (data: CreateWalletFromInsideForm) => {
    starLoading()

    const result = await deriveAccount({
      name: "",
      accountType: data.account!.type,
      address: data.account!.value!.address as string
    })

    if (result) {
      onFinish()
    }

    endLoading()
  }

  const account = watch("account")

  return (
    <FormProvider {...methods}>
      <AccountFormInsideWrapper
        onBack={onBack}
        onClose={onClose}
        step1Title={t("create_new_account")}
        option1Title={t("recovery_phrase_title")}
        option1Description={t("confirm_recovery_phrase_description")}
        option2Title={t("accounts")}
        option2Description={t("derive_description")}
        option1Text={t("create_with_new_seed_phrase")}
        option2Text={t("derive_from_existing_account")}
        Option1Component={
          <>
            <RecoveryPhrase />
            <Button data-testid="create-button" variant="contained-black" isLoading={isLoading} classname="w-full py-3 text-base mt-5" onClick={handleSubmit(onCreateFromSeed)}>{t("create_wallet")}</Button>
          </>
        }
        Option2Component={
          <>
            <SelectAccountToDerive
              onSelect={(account) => setValue("account", account)}
            />
            <Button variant="contained-black" isLoading={isLoading} isDisabled={!account} classname="w-full py-3 text-base mt-5" onClick={handleSubmit(onDerivate)}>{t("create_wallet")}</Button>
          </>
        }
      />
    </FormProvider>
  )
}

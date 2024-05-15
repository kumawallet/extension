import { useEffect, useMemo } from "react";
import { useCreateWallet } from "../createWallet/hooks/useCreateWallet";
import { Congrats, CreatePasswordStep, AccountFormWrapper } from "@src/components/accountForm";
import { Button } from "@src/components/common";
import { ImportFromPrivateKey, ImportFromSeed, SelectImportFrom } from "./components";
import { useAccountFormTexts } from "@src/hooks/common/useAccountFormTexts";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FormProvider, useForm } from "react-hook-form";
import { ImportWalletFormValues, validationSteps } from "./validations";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAccountContext, useNetworkContext } from "@src/providers";
import { useLoading } from "@src/hooks";
import { AccountType } from "@src/accounts/types";
import { BALANCE } from "@src/routes/paths";

export const ImportWallet = () => {
  const navigate = useNavigate()
  const { t } = useTranslation("account_form")
  const { importAccount, getAllAccounts } = useAccountContext()
  const { isLoading, starLoading, endLoading } = useLoading()
  const { step, prevStep, nextStep, goToWelcome, setStep } = useCreateWallet();
  const { texts, setTexts } = useAccountFormTexts()
  const { refreshNetworks } = useNetworkContext()


  const methods = useForm<ImportWalletFormValues>({
    defaultValues: {
      type: "",
      seedLength: 12,
      privateKeyOrSeed: "",
      password: "",
      confirmPassword: "",
      agreeWithTerms: false
    },
    resolver: yupResolver(validationSteps[step - 1]),
    reValidateMode: "onSubmit"
  })

  const { handleSubmit, getValues, watch, clearErrors } = methods


  const type = getValues('type')
  const form = watch()

  const onBack = () => {
    if (step === 1) {
      return goToWelcome();
    }
    prevStep();

  }

  const onContinue = async (data: ImportWalletFormValues) => {
    if (step === 4) {
      return navigate(BALANCE)
    }


    if (step === 3) {
      starLoading()

      const result = await importAccount({
        name: "Account",
        privateKeyOrSeed: data.privateKeyOrSeed,
        isSignUp: true,
        password: data.password,
        accountType: data.type === 'seed' ? AccountType.WASM : AccountType.EVM
      })


      endLoading()

      if (result) {
        setStep(4)
        refreshNetworks()
        getAllAccounts()
        nextStep();
      }

      return
    }
    clearErrors()
    nextStep();
  }


  useEffect(() => {
    const type = getValues('type')

    switch (step) {
      case 1:
        setTexts({
          title: t("import_account_title"),
          description: t("import_account_description"),
          button: t("continue")
        })
        break;
      case 2: {

        if (type === 'seed') {
          setTexts({
            title: t("import_from_recovery_phrase_title"),
            description: t("import_from_recovery_phrase_description"),
            button: t("import")
          })
        } else {
          setTexts({
            title: t("import_from_private_key_title"),
            description: t("import_from_private_key_description"),
            button: t("import_account")
          })
        }

        return
      }
      case 3:
        setTexts({
          title: t("create_password_title"),
          description: t("create_password_description"),
          button: t("continue")
        })
        break;
      case 4:
        setTexts({
          title: "",
          description: "",
          button: t("continue")
        })
        break;
    }

  }, [step])


  const buttonIsDisabled = useMemo(() => {
    if (step === 2) {
      return !form.privateKeyOrSeed.trim()
    }

    if (step === 3) {
      return !form.password.trim() || !form.confirmPassword.trim() || !form.agreeWithTerms
    }

    return false
  }, [form, step])


  return (
    <AccountFormWrapper
      showBackButton={step < 4}
      footer={
        step > 1 ? (<Button data-testid="footer-button" isDisabled={buttonIsDisabled} isLoading={isLoading} classname="w-full py-6 text-2xl" onClick={handleSubmit(onContinue)}>{texts.button}</Button>
        ) : null
      }
      title={texts.title}
      description={texts.description}
      onBack={isLoading ? undefined : onBack}
      centerInnerTitle={step === 4}
    >
      <FormProvider {...methods}>
        {step === 1 ? (
          <SelectImportFrom
            onContinue={onContinue}
          />
        ) : step === 2 ? (
          <>
            {
              type === 'seed' ? (
                <ImportFromSeed />
              ) : (
                <ImportFromPrivateKey />
              )
            }
          </>
        ) : step === 3 ? (
          <CreatePasswordStep />
        ) : (
          <Congrats />
        )}
      </FormProvider>
    </AccountFormWrapper>
  )
}

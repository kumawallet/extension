import { useCreateWallet } from "./hooks/useCreateWallet";
import {
  Congrats,
  CreatePasswordStep,
  AccountFormWrapper,
} from "@src/components/accountForm";
import {
  ConfirmRecoveryPhrase,
  RecoveryPhrase,
} from "./components";
import { useEffect, useMemo } from "react";
import { Button } from "@src/components/common";
import { useTranslation } from "react-i18next";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup"
import { mnemonicGenerate } from "@polkadot/util-crypto";
import { useNavigate } from "react-router-dom";
import { useAccountContext } from "@src/providers";
import { BALANCE } from "@src/routes/paths";
import { CreateWalletFormValues, validationSteps } from "./validations";
import { useLoading } from "@src/hooks";
import { useAccountFormTexts } from "@src/hooks/common/useAccountFormTexts";
import { messageAPI } from "@src/messageAPI/api";


export const CreateWallet = () => {
  const navigate = useNavigate()
  const { t } = useTranslation("account_form")
  const { isLoading, starLoading, endLoading } = useLoading()
  const { step, prevStep, nextStep, goToWelcome } = useCreateWallet();
  const { createAccount } = useAccountContext()
  const { texts, setTexts, } = useAccountFormTexts()

  const methods = useForm<CreateWalletFormValues>({
    defaultValues: {
      password: "",
      confirmPassword: "",
      seed: mnemonicGenerate(12),
      confirmSeed: "",
      agreeWithTerms: false
    },
    resolver: yupResolver(validationSteps[step - 1])
  })

  const { handleSubmit, watch } = methods


  useEffect(() => {
    switch (step) {
      case 1:
        setTexts({
          title: t("create_password_title"),
          description: t("create_password_description"),
          button: t("continue")
        })
        break;
      case 2:
        setTexts({
          title: t("recovery_phrase_title"),
          description: t("recovery_phrase_description"),
          button: t("create_wallet")
        })
        break;
      case 3:
        setTexts({
          title: t("confirm_recovery_phrase_title"),
          description: t("confirm_recovery_phrase_description"),
          button: t("finish")
        })
        break;
      case 4:
        setTexts({
          title: "",
          description: "",
          button: t("exit")
        })
        break;
    }

  }, [step])

  const onBack = () => {
    if (step === 1) {
      return goToWelcome();
    }
    prevStep();

  }

  const onContinue = async (data: CreateWalletFormValues) => {
    if (step === 4) {
      return navigate(BALANCE)
    }

    if (step === 3) {
      starLoading()

      const isSignUp = await messageAPI.alreadySignedUp()


      const result = await createAccount({
        name: "Account 1",
        seed: data.seed,
        password: data.password,
        isSignUp: !isSignUp,
      })
      endLoading()

      if (result) {
        nextStep();
      }
      return
    }
    nextStep();
  }

  const form = watch()

  const buttonIsDisabled = useMemo(() => {
    if (step === 1) {
      return !form.password.trim() || !form.confirmPassword.trim() || !form.agreeWithTerms
    }

    if (step === 3) {
      return form.confirmSeed.length !== form.seed.length
    }

    return false
  }, [form, step])

  return (
    <AccountFormWrapper
      showBackButton={step < 4}
      title={texts.title}
      description={texts.description}
      footer={
        <Button classname="w-full py-6 text-2xl" isDisabled={buttonIsDisabled} isLoading={isLoading} onClick={handleSubmit(onContinue)}>{texts.button}</Button>
      }
      onBack={isLoading ? undefined : onBack}
      centerInnerTitle={step === 4}
    >
      <FormProvider {...methods}>
        {step === 1 ? (
          <CreatePasswordStep />
        ) : step === 2 ? (
          <RecoveryPhrase />
        ) : step === 3 ? (
          <ConfirmRecoveryPhrase />
        ) : (
          <Congrats />
        )}
      </FormProvider>
    </AccountFormWrapper>
  );
};

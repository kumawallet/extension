import { FC, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AccountFormInsideWrapper } from "./AccountFormInsideWrapper";
import { FormProvider, useForm } from "react-hook-form";
import {
  ImportFromPrivateKey,
  ImportFromSeed,
} from "@src/pages/importWallet/components";
import { Button } from "@src/components/common";
import { useLoading } from "@src/hooks";
import { useAccountContext } from "@src/providers";
import { AccountType } from "@src/accounts/types";

interface ImportWalletFromInsideProps {
  onBack: () => void;
  onFinish: () => void;
  onClose: () => void;
}

export const ImportWalletFromInside: FC<ImportWalletFromInsideProps> = ({
  onBack,
  onFinish,
  onClose
}) => {
  const { t } = useTranslation("account_form");

  const { isLoading, starLoading, endLoading } = useLoading()
  const { importAccount } = useAccountContext()

  const methods = useForm({
    defaultValues: {
      type: "",
      seedLength: 12,
      privateKeyOrSeed: "",
    },
    reValidateMode: "onSubmit",
  });

  const { handleSubmit, watch, setValue } = methods;

  const onImportAccount = async (data: any) => {
    starLoading()

    const result = await importAccount({
      name: "Account",
      privateKeyOrSeed: data.privateKeyOrSeed,
      isSignUp: false,
      password: data.password,
      accountType: data.type === 'seed' ? AccountType.WASM : AccountType.EVM
    })

    endLoading()
    if (result) {
      onFinish()
    }
  };

  const form = watch();

  const buttonIsDisabled = useMemo(() => {
    return !form.privateKeyOrSeed.trim();
  }, [form]);

  const _onBack = () => {
    setValue("privateKeyOrSeed", "");
    onBack();
  }

  return (
    <FormProvider {...methods}>
      <AccountFormInsideWrapper
        onClose={onClose}
        onBack={_onBack}
        onSelecteOption={(option) => setValue("type", option === 1 ? "seed" : "private")}
        step1Title={t("import_account_title")}
        option1Title={t("import_from_seed_phrase")}
        option2Title={t("import_from_private_key")}
        option1Description={t("import_from_recovery_phrase_description")}
        option2Description={t("import_from_private_key_description")}
        option1Text={t("import_from_seed_phrase")}
        option2Text={t("import_from_private_key")}
        Option1Component={
          <>
            <ImportFromSeed />
            <Button
              classname="w-full py-3 md:py-5 text-base md:text-xl mt-2"
              onClick={handleSubmit(onImportAccount)}
              isDisabled={buttonIsDisabled}
              isLoading={isLoading}
            >
              {t("import")}
            </Button>
          </>
        }
        Option2Component={
          <>
            <ImportFromPrivateKey />
            <Button
              classname="w-full py-3 md:py-5 text-base md:text-xl mt-2"
              onClick={handleSubmit(onImportAccount)}
              isDisabled={buttonIsDisabled}
              isLoading={isLoading}
            >
              {t("import")}
            </Button>
          </>
        }
      />
    </FormProvider>
  );
};


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
  onClose,
}) => {
  const { t } = useTranslation("account_form");

  const { isLoading, starLoading, endLoading } = useLoading();
  const { importAccount } = useAccountContext();

  const methods = useForm({
    defaultValues: {
      type: "",
      seedLength: 12,
      privateKeyOrSeed: "",
    },
    reValidateMode: "onSubmit",
  });

  const { handleSubmit, watch, setValue } = methods;

  const onImportAccount = async (data: {
    type: string;
    seedLength: number;
    privateKeyOrSeed: string;
  }) => {
    starLoading();

    const result = await importAccount({
      name: "",
      privateKeyOrSeed: data.privateKeyOrSeed,
      isSignUp: false,
      password: null,
      accountType: data.type === "seed" ? AccountType.WASM : AccountType.EVM,
    });

    endLoading();
    if (result) {
      onFinish();
    }
  };

  const form = watch();

  const buttonIsDisabled = useMemo(() => {
    return !form.privateKeyOrSeed.trim();
  }, [form]);

  const _onBack = () => {
    setValue("privateKeyOrSeed", "");
    onBack();
  };

  return (
    <FormProvider {...methods}>
      <AccountFormInsideWrapper
        onClose={onClose}
        onBack={_onBack}
        onSelecteOption={(option) =>
          setValue("type", option === 1 ? "seed" : "private")
        }
        step1Title={t("import_account_title")}
        option1Title={t("import_from_seed_phrase")}
        option2Title={t("import_from_private_key")}
        option1TitleContent={t("import_from_recovery_phrase_title")}
        option2TitleContent={t("import_from_private_key_title")}
        option1Description={t("import_from_recovery_phrase_description")}
        option2Description={t("import_from_private_key_description")}
        option1Text={t("import_from_seed_phrase")}
        option2Text={t("import_from_private_key")}
        Option1Component={
          <>
            <ImportFromSeed />
            <Button
              data-testid="import-seed-button"
              classname="w-full py-3 text-base  mt-2"
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
              data-testid="import-pk-button"
              classname="w-full py-3 text-base  mt-2"
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

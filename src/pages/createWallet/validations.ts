import {
  emptyValidation,
  passwordValidationScheme,
} from "@src/components/accountForm/validations";
import { object, ref, string } from "yup";

const seedValidation = object({
  seed: string().required(),
  confirmSeed: string()
    .oneOf([ref("seed")], "invalid_seed")
    .required(),
});

export const validationSteps = [
  // step1
  passwordValidationScheme,
  // step2
  emptyValidation,
  // step3
  seedValidation,
  // step4
  emptyValidation,
];

export type CreateWalletFormValues = {
  password: string;
  confirmPassword: string;
  seed: string;
  confirmSeed: string;
  agreeWithTerms: boolean;
};

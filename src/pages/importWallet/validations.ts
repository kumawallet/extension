import { mnemonicValidate } from "@polkadot/util-crypto";
import {
  emptyValidation,
  passwordValidationScheme,
} from "@src/components/accountForm/validations";
import { Wallet } from "ethers";
import { array, object, string } from "yup";

const privateKeyOrSeedValidation = object({
  type: string().required(),
  seedLength: string(),
  privateKeyOrSeed: string().when(
    ["type", "seedLength"],
    ([type, seedLength], schema) => {
      if (type === "seed") {
        return schema.test("seed validation", "invalid_seed", (seed) => {
          const seedArray = seed?.split(" ") || [];
          if (seedArray.length !== Number(seedLength)) return false;

          return mnemonicValidate(seed || "");
        });
      }

      return schema.test(
        "private key validation",
        "invalid_private_key",
        (privateKey) => {
          try {
            new Wallet(privateKey || "");
            return true;
          } catch (e) {
            return false;
          }
        }
      );
    }
  ),
  accountTypesToImport: array().test("", "", (value) => {
    return value && value?.length > 0;
  }),
});

export const validationSteps = [
  // step1
  emptyValidation,
  // step2
  privateKeyOrSeedValidation,
  // step3
  passwordValidationScheme,
  // step4
  emptyValidation,
];

export type ImportWalletFormValues = {
  type: "seed" | "privateKey" | "";
  seedLength: 12 | 24;
  privateKeyOrSeed: string;
  password: string;
  confirmPassword: string;
  agreeWithTerms: boolean;
  accountTypesToImport: string[];
};

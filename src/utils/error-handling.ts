import * as Sentry from "@sentry/react";
import { Extras } from "@sentry/types/types/extra";

const IGNORED_ERRORS = [
  "account_already_exists",
  "invalid_credentials",
  "invalid_recovery_phrase",
  "rpc_error",
  "Incorrect password",
  "timeout",
  "code=NETWORK_ERROR",
  "already_signed_up",
  "Failed to fetch",
];

export const captureError = (
  error: unknown,
  extraInfo?: Extras | undefined
) => {
  if (IGNORED_ERRORS.some((str) => String(error).includes(str))) return;

  Sentry.captureException(error, { extra: extraInfo });
};

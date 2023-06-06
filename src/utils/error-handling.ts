import * as Sentry from "@sentry/react";
import { Extras } from "@sentry/types/types/extra";

export const captureError = (
  error: unknown,
  extraInfo?: Extras | undefined
) => {
  Sentry.captureException(error, { extra: extraInfo });
};

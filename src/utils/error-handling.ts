import * as Sentry from "@sentry/react";

export const captureError = (error: any, extraInfo?: any) => {
  Sentry.captureException(error, { extra: extraInfo });
};

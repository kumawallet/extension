

import i18next from "i18next";
import { FC, PropsWithChildren } from "react";
import { I18nextProvider } from "react-i18next";


export const I18nextProviderMock: FC<PropsWithChildren> = ({ children }) => {
  return (
    <I18nextProvider i18n={i18next}>
      {children}
    </I18nextProvider>
  );
};
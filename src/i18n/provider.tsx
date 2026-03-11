import { FC, PropsWithChildren } from "react";
import {
  preloadDefaultResource,
  ExternalLocaleProvider,
  LocaleCode,
} from "@orderly.network/i18n";
import { FastPlaceOrderLocales, TFastPlaceOrderLocales } from "./module";

preloadDefaultResource(FastPlaceOrderLocales);

const resources = (lang: LocaleCode) => {
  return import(`./locales/${lang}.json`).then(
    (res) => res.default as TFastPlaceOrderLocales
  );
};

export const FastPlaceOrderLocaleProvider: FC<PropsWithChildren> = (props) => {
  return (
    <ExternalLocaleProvider resources={resources}>
      {props.children}
    </ExternalLocaleProvider>
  );
};

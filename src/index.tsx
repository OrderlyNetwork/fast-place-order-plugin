import React from "react";
import { createInterceptor } from "@orderly.network/plugin-core";
import type { OrderlySDK } from "@orderly.network/plugin-core";
import { FastPlaceOrderWidget } from "./components/fastPlaceOrderWidget";
import { LocaleProvider } from "./i18n";

export { LocaleProvider as FastPlaceOrderLocaleProvider } from "./i18n";

export interface FastPlaceOrderPluginOptions {}

/**
 * Register the fast-place-order plugin.
 * Intercepts a target component and injects custom UI.
 */
export function registerFastPlaceOrderPlugin(
  options?: FastPlaceOrderPluginOptions
) {
  return (SDK: OrderlySDK) => {
    SDK.registerPlugin({
      id: "orderly-plugin-fast-place-order-db4d5bf6",
      name: "FastPlaceOrder",
      version: "0.1.0",
      orderlyVersion: ">=2.9.0",

      interceptors: [
        // TODO: Change the target path to the component you want to intercept.
        // Use the Inspector tool to discover available paths.
        createInterceptor(
          "TradingView.Desktop" as any,
          (Original, props, _api) => (
            <LocaleProvider>
              <Original {...props} />
              {/* @ts-ignore */}
              <FastPlaceOrderWidget symbol={props.symbol} />
            </LocaleProvider>
          )
        ),
      ],

      setup: (api) => {
        // Non-UI logic: event subscriptions, logging, etc.
      },
    });
  };
}

export default registerFastPlaceOrderPlugin;

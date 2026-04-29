import React, { useMemo } from "react";
import { createInterceptor } from "@orderly.network/plugin-core";
import type { OrderlySDK } from "@orderly.network/plugin-core";
import { FastPlaceOrderWidget } from "./components/fastPlaceOrderWidget";
import { useFastPlaceOrderVisibility } from "./components/fastPlaceOrderWidget/fastPlaceOrderWidget.script";
import { LocaleProvider } from "./i18n";



export interface FastPlaceOrderPluginOptions {
  /** Controls whether fullscreen entry auto-opens the fast order popup. */
  autoShowOnFullscreen?: boolean;
}

/**
 * Register the fast-place-order plugin.
 * Intercepts a target component and injects custom UI.
 */
export function registerFastPlaceOrderPlugin(options?: FastPlaceOrderPluginOptions) {
  /** Keep default behavior backward compatible for existing integrations. */
  const autoShowOnFullscreen = options?.autoShowOnFullscreen ?? true;

  return (SDK: OrderlySDK) => {
    SDK.registerPlugin({
      id: "orderly-plugin-fast-place-order-db4d5bf6",
      name: "FastPlaceOrder",
      version: "0.1.0",
      orderlyVersion: ">=3.0.1",

      interceptors: [
        // TODO: Change the target path to the component you want to intercept.
        // Use the Inspector tool to discover available paths.
        createInterceptor(
          "TradingView.Desktop" as any,
          (Original, props, _api) => (
            <LocaleProvider>
              <Original {...props} />
              {/* @ts-ignore */}
              <FastPlaceOrderWidget
                symbol={props.symbol}
                autoShowOnFullscreen={autoShowOnFullscreen}
              />
            </LocaleProvider>
          ),
        ),
        createInterceptor(
          'TradingView.DisplayControl.DesktopMenuList' as any,
          (Original, props) => {
            /** Keep menu toggle state in sync with persisted widget visibility. */
            const [isWidgetVisible, setIsWidgetVisible] =
              useFastPlaceOrderVisibility(false);

            // avoid duplicate insertion
            const nextItems = useMemo(() => {
              const menuItemId = "fastPlaceOrderPopupToggle";
              const customItem = {
                id: menuItemId,
                label: "Fast Place Order",
                checked: isWidgetVisible,
                onCheckedChange: (checked: boolean) => {
                  /** Persist user preference so the toggle survives page refresh. */
                  setIsWidgetVisible(checked);
                },
              };
              const itemsWithoutCustom = (props.items ?? []).filter(
                (item: { id?: string }) => item?.id !== menuItemId,
              );
              return [...itemsWithoutCustom, customItem];
            }, [isWidgetVisible, props.items, setIsWidgetVisible]);
            return <Original {...props} items={nextItems} />;
          },

        ),
      ],

      setup: (api) => {
        // Non-UI logic: event subscriptions, logging, etc.
      },
    });
  };
}

export default registerFastPlaceOrderPlugin;

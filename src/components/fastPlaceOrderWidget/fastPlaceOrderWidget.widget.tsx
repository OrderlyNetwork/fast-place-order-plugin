import React from "react";
import { FastPlaceOrder, type FastPlaceOrderProps } from "./fastPlaceOrderWidget.ui";
import { useFastPlaceOrderScript } from "./fastPlaceOrderWidget.script";

export type FastPlaceOrderWidgetProps = Pick<
  FastPlaceOrderProps,
  "className" | "style"
> & {
  symbol?: string;
  defaultQty?: number;
  autoShowOnFullscreen?: boolean;
  onOrderPlaced?: (params: {
    side: "buy" | "sell";
    qty: number;
    symbol?: string;
  }) => void;
};

export const FastPlaceOrderWidget: React.FC<FastPlaceOrderWidgetProps> = (
  props,
) => {
  const { className, style, ...scriptOptions } = props;
  const state = useFastPlaceOrderScript(scriptOptions);
  const shouldAutoShowInFullscreen = props.autoShowOnFullscreen ?? true;
  const shouldRender =
    state.isWidgetVisible ||
    (state.fullscreen && shouldAutoShowInFullscreen);

  /** Render when user manually opens, or fullscreen auto-show is enabled. */
  if (!shouldRender) {
    return null;
  }

  return (
    <FastPlaceOrder
      {...state}
      className={className}
      style={style}
    />
  );
};

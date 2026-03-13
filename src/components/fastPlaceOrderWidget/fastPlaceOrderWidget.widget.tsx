import React from "react";
import { FastPlaceOrder, type FastPlaceOrderProps } from "./fastPlaceOrderWidget.ui";
import { useFastPlaceOrderScript } from "./fastPlaceOrderWidget.script";

export type FastPlaceOrderWidgetProps = Pick<
  FastPlaceOrderProps,
  "className" | "style"
> & {
  symbol?: string;
  defaultQty?: number;
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

  if (!state.fullscreen) {
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

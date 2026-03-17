import type { TFastPlaceOrderLocales } from "../../../i18n/module";
import type { FastPlaceOrderMessage } from "../fastPlaceOrderWidget.script";

/** e.g. PERP_ETH_USDC -> ETH */
export function getSymbolBase(symbol: string): string {
  const parts = symbol.split("_");
  return parts.length >= 2 ? parts[1]! : symbol;
}

export function formatMessageText(
  message: FastPlaceOrderMessage,
  t: (key: keyof TFastPlaceOrderLocales) => string,
): string {
  if (message.type === "success") {
    return t("fastPlaceOrder.toastSuccess")
      .replace("{{side}}", message.side)
      .replace("{{qty}}", String(message.qty))
      .replace("{{symbol}}", message.symbol);
  }
  return t("fastPlaceOrder.toastError").replace("{{reason}}", message.reason);
}

export function formatMaxQtyConfirmContent(
  maxQty: string,
  base: string,
  t: (key: keyof TFastPlaceOrderLocales) => string,
): string {
  return t("fastPlaceOrder.maxQtyConfirmContent")
    .replace("{{maxQty}}", maxQty)
    .replace("{{base}}", base);
}

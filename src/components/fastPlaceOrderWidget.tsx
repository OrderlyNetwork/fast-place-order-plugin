import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { useOrderEntry, useLocalStorage } from "@orderly.network/hooks";
import { OrderType, OrderSide } from "@orderly.network/types";
import { Box, Button, Flex, Input, Text, cn } from "@orderly.network/ui";
import { TFastPlaceOrderLocales } from "../i18n/module";

const PERCENTS = [25, 50, 75, 100] as const;
const STORAGE_KEY_PREFIX = "orderly-quick-trade";

export interface FastPlaceOrderWidgetProps {
  className?: string;
  /** Initial side for display (optional) */
  defaultSide?: "buy" | "sell";
  /** Initial quantity; overridden by localStorage when symbol is set */
  defaultQty?: number;
  /** Trading symbol, e.g. "PERP_BTC_USDC". Required for order submission. */
  symbol?: string;
  /** Callback after order placed successfully */
  onOrderPlaced?: (params: {
    side: "buy" | "sell";
    qty: number;
    symbol?: string;
  }) => void;
}

export const FastPlaceOrderWidget: React.FC<FastPlaceOrderWidgetProps> = ({
  className,
  defaultQty,
  symbol: symbolProp = "PERP_BTC_USDC",
  onOrderPlaced,
}) => {
  const { t: tBase } = useTranslation();
  const t = tBase as (key: keyof TFastPlaceOrderLocales) => string;

  const storageKey = useMemo(
    () => (symbolProp ? `${STORAGE_KEY_PREFIX}:${symbolProp}` : null),
    [symbolProp]
  );
  const [storedQty, setStoredQty] = useLocalStorage<number>(
    storageKey ?? "orderly-quick-trade-default",
    0
  );

  const [qtyInput, setQtyInput] = useState("");
  const [selectedPercent, setSelectedPercent] = useState<
    25 | 50 | 75 | 100 | undefined
  >(undefined);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const symbol = symbolProp || "PERP_BTC_USDC";
  const {
    setValue,
    submit,
    maxQty,
    markPrice = 0,
    isMutating,
  } = useOrderEntry(symbol, {
    initialOrder: {
      order_type: OrderType.MARKET,
      side: OrderSide.BUY,
      order_quantity: 0,
    },
  });

  const qty = useMemo(() => {
    const n = parseFloat(qtyInput);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }, [qtyInput]);

  useEffect(() => {
    if (defaultQty != null && defaultQty > 0 && !storageKey) {
      setQtyInput(String(defaultQty));
      return;
    }
    if (storedQty > 0) {
      setQtyInput(String(storedQty));
    }
  }, [defaultQty, storedQty, storageKey]);

  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(clearMessage, 4000);
    return () => clearTimeout(id);
  }, [message, clearMessage]);

  const maxQtySafe = useMemo(() => (maxQty > 0 ? maxQty : 0), [maxQty]);
  const setQtyByPercent = useCallback(
    (p: 25 | 50 | 75 | 100) => {
      setSelectedPercent(p);
      const value = Math.floor(maxQtySafe * (p / 100));
      setQtyInput(String(value));
    },
    [maxQtySafe]
  );

  const placeMarketOrder = useCallback(
    async (side: "buy" | "sell") => {
      if (!(qty > 0)) return;
      setValue("order_quantity", qty);
      setValue("side", side === "buy" ? OrderSide.BUY : OrderSide.SELL);
      setValue("order_type", OrderType.MARKET);
      try {
        const result = await submit({ resetOnSuccess: false });
        if (result?.success) {
          setStoredQty(qty);
          setMessage({
            type: "success",
            text: t("fastPlaceOrder.toastSuccess")
              .replace("{{side}}", side)
              .replace("{{qty}}", String(qty))
              .replace("{{symbol}}", symbol),
          });
          onOrderPlaced?.({ side, qty, symbol });
        } else {
          setMessage({
            type: "error",
            text: t("fastPlaceOrder.toastError").replace(
              "{{reason}}",
              (result as any)?.message ?? "Unknown"
            ),
          });
        }
      } catch (e: any) {
        setMessage({
          type: "error",
          text: t("fastPlaceOrder.toastError").replace(
            "{{reason}}",
            e?.message ?? String(e)
          ),
        });
      }
    },
    [qty, symbol, setValue, submit, setStoredQty, t, onOrderPlaced]
  );

  const disabled = isMutating || !(qty > 0) || maxQtySafe <= 0;
  const markPriceStr =
    markPrice > 0 ? markPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }) : "—";

  return (
    <Box className={cn("oui-relative", className)}>
    <Flex
      className={cn(
        "oui-gap-3 oui-p-3 oui-rounded-lg oui-bg-base-8 oui-border oui-border-base-7 oui-min-w-[320px] oui-items-center"
      )}
    >
      {/* Left: Buy */}
      <Box className="oui-flex-1 oui-flex oui-flex-col oui-gap-1">
        <Button
          type="button"
          color="buy"
          onClick={() => placeMarketOrder("buy")}
          disabled={disabled}
          loading={isMutating}
          className="oui-w-full"
        >
          {t("fastPlaceOrder.buy")}
        </Button>
        <Text className="oui-text-xs oui-text-base-4">
          {t("fastPlaceOrder.mark")}: {markPriceStr}
        </Text>
      </Box>

      {/* Center: Qty + % */}
      <Box className="oui-flex-1 oui-flex oui-flex-col oui-gap-1.5">
        <Input
          type="number"
          min={0}
          step="any"
          placeholder={t("fastPlaceOrder.qty")}
          value={qtyInput}
          onChange={(e) => {
            setQtyInput(e.target.value);
            setSelectedPercent(undefined);
          }}
          className="oui-w-full"
        />
        <Flex gap={1} wrap="wrap">
          {PERCENTS.map((p) => (
            <Button
              key={p}
              type="button"
              variant="outlined"
              size="sm"
              className={cn(
                "oui-flex-1 oui-min-w-0",
                selectedPercent === p && "oui-bg-base-6"
              )}
              onClick={() => setQtyByPercent(p)}
            >
              {p}%
            </Button>
          ))}
        </Flex>
      </Box>

      {/* Right: Sell */}
      <Box className="oui-flex-1 oui-flex oui-flex-col oui-gap-1">
        <Button
          type="button"
          color="sell"
          onClick={() => placeMarketOrder("sell")}
          disabled={disabled}
          loading={isMutating}
          className="oui-w-full"
        >
          {t("fastPlaceOrder.sell")}
        </Button>
        <Text className="oui-text-xs oui-text-base-4">
          {t("fastPlaceOrder.mark")}: {markPriceStr}
        </Text>
      </Box>

    </Flex>
      {message && (
        <Box
          className={cn(
            "oui-absolute oui-bottom-full oui-left-0 oui-right-0 oui-mb-1 oui-rounded oui-px-2 oui-py-1 oui-text-xs",
            message.type === "success"
              ? "oui-bg-green-500/20 oui-text-green-4"
              : "oui-bg-red-500/20 oui-text-red-4"
          )}
        >
          {message.text}
        </Box>
      )}
    </Box>
  );
};

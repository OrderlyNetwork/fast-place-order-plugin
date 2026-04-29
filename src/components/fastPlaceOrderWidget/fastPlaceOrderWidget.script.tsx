import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useOrderEntry, useLocalStorage } from "@orderly.network/hooks";
import { OrderType, OrderSide } from "@orderly.network/types";
import { modal, toast } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import {
  clampPosition,
  getPositionStyle,
  loadFastPlaceOrderLayout,
  saveFastPlaceOrderLayout,
} from "./layoutUtils";
import { orderConfirmDialogId } from "./orderConfirmDialog";

export const TradingviewFullscreenKey = "orderly:tradingview-fullscreen";
export const FastPlaceOrderVisibleKey = "orderly:fast-place-order-visible";
const FastPlaceOrderDefaultVisible = false;

const DEFAULT_FIXED_POSITION = "bottom-right" as const;

const PERCENTS = [25, 50, 75, 100] as const;

export type PercentOption = (typeof PERCENTS)[number];

export type FastPlaceOrderMessage =
  | { type: "success"; side: "buy" | "sell"; qty: number; symbol: string }
  | { type: "error"; reason: string };

export interface UseFastPlaceOrderScriptOptions {
  symbol?: string;
  defaultQty?: number;
  autoShowOnFullscreen?: boolean;
  onOrderPlaced?: (params: {
    side: "buy" | "sell";
    qty: number;
    symbol?: string;
  }) => void;
}

/**
 * Shared visibility state hook used by menu and widget.
 * Ensures all plugin surfaces consume the same source of truth by reusing
 * the existing SDK `useLocalStorage` hook.
 */
export function useFastPlaceOrderVisibility(
  defaultVisible = FastPlaceOrderDefaultVisible,
) {
  const [isWidgetVisible, setIsWidgetVisible] = useLocalStorage<boolean>(
    FastPlaceOrderVisibleKey,
    defaultVisible,
  );

  return [isWidgetVisible, setIsWidgetVisible] as const;
}

type OrderEntryBridge = {
  setValue?: (key: string, value: unknown) => void;
  errorMsg?: string | null;
  metaState?: {
    errors?: unknown;
  };
  maxQtys?: {
    maxBuy: number;
    maxSell: number;
  };
  maxQty?: number;
};

function getErrorReason(error: unknown): string {
  if (typeof error === "string" && error.length > 0) {
    return error;
  }

  if (error && typeof error === "object") {
    const errorWithMessage = error as { message?: unknown };
    if (
      typeof errorWithMessage.message === "string" &&
      errorWithMessage.message.length > 0
    ) {
      return errorWithMessage.message;
    }

    const nestedError = Object.values(error as Record<string, unknown>).find(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof (item as { message?: unknown }).message === "string",
    ) as { message?: string } | undefined;

    if (nestedError?.message) {
      return nestedError.message;
    }
  }

  return "Unknown";
}

function getNestedErrorMsg(error: unknown): string | undefined {
  if (typeof error === "string" && error.length > 0) {
    return error;
  }

  if (!error || typeof error !== "object") {
    return undefined;
  }

  const errorRecord = error as Record<string, unknown>;

  for (const key of ["message", "errorMsg", "msg"]) {
    const value = errorRecord[key];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  for (const value of Object.values(errorRecord)) {
    const nested = getNestedErrorMsg(value);
    if (nested) {
      return nested;
    }
  }

  return undefined;
}

export const useFastPlaceOrderScript = (
  options: UseFastPlaceOrderScriptOptions = {},
) => {
  const {
    symbol: symbolProp = "PERP_ETH_USDC",
    defaultQty,
    autoShowOnFullscreen = true,
    onOrderPlaced,
  } = options;

  const [fullscreen] = useLocalStorage<boolean>(
    TradingviewFullscreenKey,
    false,
  );
  const [isWidgetVisible, setIsWidgetVisible] = useFastPlaceOrderVisibility(
    FastPlaceOrderDefaultVisible,
  );
  const previousFullscreenRef = useRef(fullscreen);

  const [needConfirm] = useLocalStorage("orderly_order_confirm", true);

  const [selectedPercent, setSelectedPercent] = useState<
    PercentOption | undefined
  >(undefined);
  const [message, setMessage] = useState<FastPlaceOrderMessage | null>(null);
  const [maxQtyConfirmOpen, setMaxQtyConfirmOpen] = useState(false);
  const [pendingMaxQtyOrder, setPendingMaxQtyOrder] = useState<{
    side: "buy" | "sell";
  } | null>(null);
  const [pixelPosition, setPixelPosition] = useState<{
    left: number;
    top: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const widgetRef = useRef<HTMLDivElement | null>(null);

  const symbol = symbolProp || "PERP_BTC_USDC";
  const orderEntry = useOrderEntry(symbol, {
    initialOrder: {
      order_type: OrderType.MARKET,
      side: OrderSide.BUY,
      order_quantity: 0,
    },
  });
  const {
    formattedOrder,
    setValues,
    helper,
    submit,
    markPrice = 0,
    isMutating,
    symbolInfo,
  } = orderEntry;
  const submitRef = useRef(submit);
  const helperRef = useRef(helper);
  const formattedOrderRef = useRef(formattedOrder);
  const currentErrorMsgRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    submitRef.current = submit;
  }, [submit]);
  useEffect(() => {
    helperRef.current = helper;
  }, [helper]);
  useEffect(() => {
    formattedOrderRef.current = formattedOrder;
  }, [formattedOrder]);
  const orderEntryBridge = orderEntry as typeof orderEntry & OrderEntryBridge;
  const maxQtys = orderEntryBridge.maxQtys;
  const fallbackMaxQty = orderEntryBridge.maxQty ?? 0;
  const qtyInput = useMemo(() => {
    const value = formattedOrder.order_quantity;
    if (value == null || value === "") {
      return "";
    }
    return String(value);
  }, [formattedOrder.order_quantity]);
  const currentErrorMsg = useMemo(
    () =>
      orderEntryBridge.errorMsg ??
      getNestedErrorMsg(orderEntryBridge.metaState?.errors),
    [orderEntryBridge.errorMsg, orderEntryBridge.metaState?.errors],
  );
  useEffect(() => {
    currentErrorMsgRef.current = currentErrorMsg ?? undefined;
  }, [currentErrorMsg]);
  const setOrderQuantity = useCallback(
    (value: string) => {
      if (orderEntryBridge.setValue) {
        orderEntryBridge.setValue("order_quantity", value);
        return;
      }

      setValues({
        order_quantity: value,
      });
    },
    [orderEntryBridge, setValues],
  );
  const setQtyInput = useCallback(
    (value: string) => {
      setSelectedPercent(undefined);
      setOrderQuantity(value);
    },
    [setOrderQuantity],
  );

  const qty = useMemo(() => {
    const n = parseFloat(qtyInput);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }, [qtyInput]);

  useEffect(() => {
    /** Auto-open only when entering fullscreen if the plugin option allows it. */
    const wasFullscreen = previousFullscreenRef.current;
    if (!wasFullscreen && fullscreen && autoShowOnFullscreen) {
      setIsWidgetVisible(true);
    }
    previousFullscreenRef.current = fullscreen;
  }, [autoShowOnFullscreen, fullscreen, setIsWidgetVisible]);

  useEffect(() => {
    if (defaultQty != null && defaultQty > 0) {
      setOrderQuantity(String(defaultQty));
    }
  }, [defaultQty, setOrderQuantity]);

  const clearMessage = useCallback(() => {
    setMessage(null);
  }, []);
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(clearMessage, 4000);
    return () => clearTimeout(id);
  }, [message, clearMessage]);

  useEffect(() => {
    const stored = loadFastPlaceOrderLayout();
    if (
      stored &&
      typeof stored.left === "number" &&
      typeof stored.top === "number"
    ) {
      setPixelPosition({ left: stored.left, top: stored.top });
    }
  }, []);

  useEffect(() => {
    if (pixelPosition == null) return;
    saveFastPlaceOrderLayout({
      left: pixelPosition.left,
      top: pixelPosition.top,
    });
  }, [pixelPosition]);

  const positionStyle = useMemo(
    () =>
      pixelPosition != null
        ? { left: pixelPosition.left, top: pixelPosition.top }
        : getPositionStyle(DEFAULT_FIXED_POSITION),
    [pixelPosition],
  );

  const onDragHandlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      if ((e.target as HTMLElement).closest("[data-no-drag]")) return;
      const widget = widgetRef.current;
      const target = e.currentTarget;
      if (!widget) return;
      e.preventDefault();
      target.setPointerCapture(e.pointerId);
      const rect = widget.getBoundingClientRect();
      const startX = e.clientX;
      const startY = e.clientY;
      const startLeft =
        pixelPosition != null ? pixelPosition.left : rect.left;
      const startTop = pixelPosition != null ? pixelPosition.top : rect.top;

      let lastClamped = { left: startLeft, top: startTop };

      const onPointerMove = (moveEvent: PointerEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        const next = clampPosition(
          startLeft + dx,
          startTop + dy,
          rect.width,
          rect.height,
        );
        lastClamped = next;
        widget.style.left = `${next.left}px`;
        widget.style.top = `${next.top}px`;
        widget.style.right = "";
        widget.style.bottom = "";
      };

      const exitDrag = (finalPosition: { left: number; top: number }) => {
        try {
          target.releasePointerCapture(e.pointerId);
        } catch {
          // ignore if already released
        }
        target.removeEventListener("pointermove", onPointerMove as EventListener);
        target.removeEventListener("pointerup", onPointerUp as EventListener);
        target.removeEventListener(
          "pointercancel",
          onPointerCancel as EventListener,
        );
        setIsDragging(false);
        setPixelPosition(finalPosition);
      };

      const onPointerUp = (upEvent: PointerEvent) => {
        if (upEvent.button !== 0) return;
        exitDrag(lastClamped);
      };

      const onPointerCancel = () => {
        exitDrag(lastClamped);
      };

      setIsDragging(true);
      target.addEventListener("pointermove", onPointerMove as EventListener);
      target.addEventListener("pointerup", onPointerUp as EventListener);
      target.addEventListener("pointercancel", onPointerCancel as EventListener);
    },
    [pixelPosition],
  );

  const maxQtyBuySafe = useMemo(
    () =>
      maxQtys?.maxBuy != null && maxQtys.maxBuy > 0
        ? maxQtys.maxBuy
        : fallbackMaxQty,
    [maxQtys?.maxBuy, fallbackMaxQty],
  );
  const maxQtySellSafe = useMemo(
    () =>
      maxQtys?.maxSell != null && maxQtys.maxSell > 0
        ? maxQtys.maxSell
        : fallbackMaxQty,
    [maxQtys?.maxSell, fallbackMaxQty],
  );
  const maxQtyForPercent = useMemo(
    () => Math.max(maxQtyBuySafe, maxQtySellSafe),
    [maxQtyBuySafe, maxQtySellSafe],
  );
  const formatMaxQty = useCallback(
    (value: number) => {
      if (value <= 0) return "0";
      return new Decimal(value)
        .todp(symbolInfo.base_dp ?? 0, Decimal.ROUND_DOWN)
        .toString();
    },
    [symbolInfo.base_dp],
  );
  const formattedMaxQtyBuy = useMemo(
    () => formatMaxQty(maxQtyBuySafe),
    [formatMaxQty, maxQtyBuySafe],
  );
  const formattedMaxQtySell = useMemo(
    () => formatMaxQty(maxQtySellSafe),
    [formatMaxQty, maxQtySellSafe],
  );
  const formattedQtyAtPercentBuy = useMemo(
    () =>
      selectedPercent != null
        ? formatMaxQty(
          new Decimal(maxQtyBuySafe).mul(selectedPercent).div(100).toNumber(),
        )
        : "",
    [formatMaxQty, maxQtyBuySafe, selectedPercent],
  );
  const formattedQtyAtPercentSell = useMemo(
    () =>
      selectedPercent != null
        ? formatMaxQty(
          new Decimal(maxQtySellSafe).mul(selectedPercent).div(100).toNumber(),
        )
        : "",
    [formatMaxQty, maxQtySellSafe, selectedPercent],
  );
  const baseAsset = useMemo(() => {
    if (symbolInfo.base) {
      return symbolInfo.base;
    }

    const parts = symbol.split("_");
    return parts[1] ?? symbol;
  }, [symbol, symbolInfo.base]);
  const baseDp = symbolInfo.base_dp ?? 0;
  const setQtyByPercent = useCallback(
    (p: PercentOption) => {
      setSelectedPercent(p);
      const value = new Decimal(maxQtyForPercent).mul(p).div(100);
      const rounded = value.todp(baseDp, Decimal.ROUND_DOWN);
      setOrderQuantity(rounded.toString());
    },
    [baseDp, maxQtyForPercent, setOrderQuantity],
  );

  const submitMarketOrder = useCallback(
    async (side: "buy" | "sell", nextQty: number) => {
      const expectedSide = side === "buy" ? OrderSide.BUY : OrderSide.SELL;
      // 先同步写入 useOrderEntry，确保 side / order_quantity / order_type 已设置
      setValues({
        order_quantity: String(nextQty),
        side: expectedSide,
        order_type: OrderType.MARKET,
      });

      return new Promise<void>((resolve) => {
        /**
         * Ensure we submit using the latest hook state.
         * `submit` in `useOrderEntry` captures render-time `formattedOrder`,
         * so we wait until side/qty/type are applied before invoking submit.
         */
        const waitUntilOrderStateApplied = async () => {
          for (let i = 0; i < 8; i++) {
            await new Promise<void>((frameResolve) => {
              requestAnimationFrame(() => frameResolve());
            });
            const currentOrder = formattedOrderRef.current;
            const currentQty = Number(currentOrder.order_quantity);
            const qtyMatches = Number.isFinite(currentQty) && currentQty === nextQty;
            if (
              currentOrder.side === expectedSide &&
              currentOrder.order_type === OrderType.MARKET &&
              qtyMatches
            ) {
              return;
            }
          }
        };

        // 延迟到下一事件循环再 validate/submit，确保 setValues 已生效
        const runAfterUpdate = () => {
          requestAnimationFrame(async () => {
            await waitUntilOrderStateApplied();
            const latestErrorMsg = currentErrorMsgRef.current;
            if (latestErrorMsg) {
              setMessage({ type: "error", reason: latestErrorMsg });
              toast.error(latestErrorMsg);
              resolve();
              return;
            }

            try {
              await helperRef.current.validate();
              if (needConfirm) {
                const latestFormattedOrder = formattedOrderRef.current;
                const order = {
                  ...latestFormattedOrder,
                  symbol,
                  side: expectedSide,
                  order_type: OrderType.MARKET,
                  order_quantity: String(nextQty),
                };

                try {
                  await modal.show(orderConfirmDialogId, {
                    order,
                    symbolInfo,
                  });
                } catch (error) {
                  if (error === "cancel") {
                    resolve();
                    return;
                  }
                  throw error;
                }
              }

              const result = await submitRef.current({ resetOnSuccess: false });
              if (result?.success) {
                setMessage({ type: "success", side, qty: nextQty, symbol });
                onOrderPlaced?.({ side, qty: nextQty, symbol });
                resolve();
                return;
              }

              const reason =
                (result as { message?: string })?.message ?? "Unknown";
              setMessage({ type: "error", reason });
              toast.error(reason);
            } catch (error: unknown) {
              const reason = getErrorReason(error);
              setMessage({ type: "error", reason });
              toast.error(reason);
            }

            resolve();
          });
        };
        setTimeout(runAfterUpdate, 0);
      });
    },
    [
      formattedOrder,
      needConfirm,
      onOrderPlaced,
      setValues,
      symbol,
      symbolInfo,
    ],
  );

  const onMaxQtyConfirmOpenChange = useCallback((open: boolean) => {
    setMaxQtyConfirmOpen(open);
    if (!open) {
      setPendingMaxQtyOrder(null);
    }
  }, []);

  const formattedMaxQtyForSide = useMemo(
    () =>
      pendingMaxQtyOrder?.side === "buy"
        ? formattedMaxQtyBuy
        : formattedMaxQtySell,
    [pendingMaxQtyOrder?.side, formattedMaxQtyBuy, formattedMaxQtySell],
  );
  const confirmMaxQtyOrder = useCallback(async () => {
    if (!pendingMaxQtyOrder) {
      return;
    }

    const clampedQty = Number(formattedMaxQtyForSide);
    onMaxQtyConfirmOpenChange(false);

    if (!(clampedQty > 0)) {
      return;
    }

    setSelectedPercent(undefined);
    setOrderQuantity(formattedMaxQtyForSide);
    await submitMarketOrder(pendingMaxQtyOrder.side, clampedQty);
  }, [
    formattedMaxQtyForSide,
    onMaxQtyConfirmOpenChange,
    pendingMaxQtyOrder,
    setOrderQuantity,
    submitMarketOrder,
  ]);

  const MIN_ORDER_QTY = 0.0001;

  const placeMarketOrder = useCallback(
    async (side: "buy" | "sell") => {
      const maxSafe = side === "buy" ? maxQtyBuySafe : maxQtySellSafe;
      const effectiveQty =
        selectedPercent != null
          ? new Decimal(maxSafe).mul(selectedPercent).div(100).todp(baseDp, Decimal.ROUND_DOWN).toNumber()
          : qty;

      if (!(effectiveQty > 0)) {
        toast.error("Insufficient balance for this side");
        return;
      }

      if (effectiveQty < MIN_ORDER_QTY) {
        const reason = `Quantity must be greater than ${MIN_ORDER_QTY}`;
        setMessage({ type: "error", reason });
        toast.error(reason);
        return;
      }

      if (effectiveQty > maxSafe) {
        setPendingMaxQtyOrder({ side });
        setMaxQtyConfirmOpen(true);
        return;
      }

      await submitMarketOrder(side, effectiveQty);
    },
    [baseDp, maxQtyBuySafe, maxQtySellSafe, qty, selectedPercent, submitMarketOrder],
  );

  const disabled =
    isMutating ||
    !(qty > 0) ||
    (maxQtyBuySafe <= 0 && maxQtySellSafe <= 0);

  return {
    fullscreen,
    isWidgetVisible,
    setIsWidgetVisible,
    symbol,
    symbolInfo,
    baseDp,
    qty,
    qtyInput,
    selectedPercent,
    maxQtyBuySafe,
    maxQtySellSafe,
    markPrice,
    isMutating,
    disabled,
    message,
    maxQtyConfirmOpen,
    formattedMaxQtyBuy,
    formattedMaxQtySell,
    formattedQtyAtPercentBuy,
    formattedQtyAtPercentSell,
    formattedMaxQtyForSide,
    baseAsset,
    setQtyInput,
    setSelectedPercent,
    setQtyByPercent,
    placeMarketOrder,
    onMaxQtyConfirmOpenChange,
    confirmMaxQtyOrder,
    percentOptions: PERCENTS,
    widgetRef,
    pixelPosition,
    isDragging,
    positionStyle,
    onDragHandlePointerDown,
  };
};

export type FastPlaceOrderState = ReturnType<typeof useFastPlaceOrderScript>;

import React, { FC } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Box, Flex, cn } from "@orderly.network/ui";
import type { TFastPlaceOrderLocales } from "../../i18n/module";
import type { FastPlaceOrderState } from "./fastPlaceOrderWidget.script";
import {
  DragHandle,
  SideButton,
  QtyInputBlock,
  PercentButtons,
  ToastMessage,
  MaxQtyConfirmDialog,
  getSymbolBase,
  formatMessageText,
  formatMaxQtyConfirmContent,
} from "./ui";

export type FastPlaceOrderProps = FastPlaceOrderState & {
  className?: string;
  style?: React.CSSProperties;
};

export const FastPlaceOrder: FC<FastPlaceOrderProps> = (props) => {
  const { t: tBase } = useTranslation();
  const t = tBase as (key: keyof TFastPlaceOrderLocales) => string;
  const {
    className,
    style,
    symbol,
    baseDp,
    qtyInput,
    selectedPercent,
    formattedMaxQtyBuy,
    formattedMaxQtySell,
    formattedQtyAtPercentBuy,
    formattedQtyAtPercentSell,
    isMutating,
    disabled,
    message,
    maxQtyConfirmOpen,
    formattedMaxQtyForSide,
    baseAsset,
    setQtyInput,
    setSelectedPercent,
    setQtyByPercent,
    placeMarketOrder,
    onMaxQtyConfirmOpenChange,
    confirmMaxQtyOrder,
    percentOptions,
    widgetRef,
    positionStyle,
    onDragHandlePointerDown,
    isDragging,
  } = props;

  const symbolBase = getSymbolBase(symbol);
  const maxQtyStrBuy = formattedMaxQtyBuy !== "0" ? formattedMaxQtyBuy : "—";
  const maxQtyStrSell = formattedMaxQtySell !== "0" ? formattedMaxQtySell : "—";
  const messageText = message ? formatMessageText(message, t) : null;
  const maxQtyConfirmContent = formatMaxQtyConfirmContent(
    formattedMaxQtyForSide,
    baseAsset,
    t,
  );

  return (
    <Flex
      ref={widgetRef}
      direction="column"
      position="fixed"
      className={cn("oui-fastPlaceOrder oui-shadow-lg", className)}
      style={{
        zIndex: 9999,
        ...positionStyle,
        ...style,
      }}
    >
      <Box className="oui-relative">
        <Box
          /** Compact card chrome matches the screenshot while keeping strong contrast in dark theme. */
          className={cn(
            "oui-fastPlaceOrder-container oui-flex oui-flex-col oui-gap-1 oui-rounded-md oui-p-1 oui-bg-base-8 oui-border oui-border-base-6 oui-shadow-sm",
          )}
        >
          <Flex
            direction="row"
            itemAlign="stretch"
            className="oui-fastPlaceOrder-top oui-w-full oui-gap-1 oui-items-stretch"
          >
            <DragHandle
              isDragging={isDragging}
              onPointerDown={onDragHandlePointerDown}
            />

            <SideButton
              variant="long"
              label={t("fastPlaceOrder.long")}
              maxQtyStr={maxQtyStrBuy}
              disabled={disabled || isMutating}
              onClick={() => placeMarketOrder("buy")}
            />

            <QtyInputBlock
              label={`${t("fastPlaceOrder.qty")} (${symbolBase})`}
              value={qtyInput}
              onChange={setQtyInput}
              selectedPercent={selectedPercent ?? null}
              onSwitchToInput={() => {
                setSelectedPercent(undefined);
                setQtyInput("");
              }}
              baseDp={baseDp}
            />

            <SideButton
              variant="short"
              label={t("fastPlaceOrder.short")}
              maxQtyStr={maxQtyStrSell}
              disabled={disabled || isMutating}
              onClick={() => placeMarketOrder("sell")}
            />

            <DragHandle
              isDragging={isDragging}
              onPointerDown={onDragHandlePointerDown}
            />
          </Flex>

          <PercentButtons
            options={percentOptions}
            selectedPercent={selectedPercent ?? null}
            onSelect={setQtyByPercent}
            qtyLabelLeft={formattedQtyAtPercentBuy}
            qtyLabelRight={formattedQtyAtPercentSell}
          />
        </Box>


        <MaxQtyConfirmDialog
          open={maxQtyConfirmOpen}
          title={t("fastPlaceOrder.maxQtyConfirmTitle")}
          content={maxQtyConfirmContent}
          placeOrderLabel={t("fastPlaceOrder.placeOrderNow")}
          cancelLabel={t("fastPlaceOrder.cancel")}
          onOpenChange={onMaxQtyConfirmOpenChange}
          onConfirm={confirmMaxQtyOrder}
        />
      </Box>
    </Flex>
  );
};

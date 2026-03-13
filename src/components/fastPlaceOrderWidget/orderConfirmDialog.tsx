import { FC } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { API, OrderSide, OrderType, OrderlyOrder } from "@orderly.network/types";
import {
  Badge,
  Button,
  Checkbox,
  Divider,
  Flex,
  Grid,
  Text,
  registerSimpleDialog,
} from "@orderly.network/ui";
import type { TFastPlaceOrderLocales } from "../../i18n/module";

export const orderConfirmDialogId = "orderConfirm";

type FastPlaceOrderConfirmDialogProps = {
  order: OrderlyOrder;
  symbolInfo: API.SymbolExt;
  onConfirm: () => void;
  onCancel: () => void;
};

const FastPlaceOrderConfirmDialog: FC<FastPlaceOrderConfirmDialogProps> = (
  props,
) => {
  const { order, symbolInfo, onConfirm, onCancel } = props;
  const { t: tBase } = useTranslation();
  const t = tBase as (key: keyof TFastPlaceOrderLocales) => string;
  const [_, setNeedConfirm] = useLocalStorage("orderly_order_confirm", true);

  return (
    <>
      <Flex justify="between" className="oui-fastPlaceOrder-orderConfirm-header">
        <Text.formatted
          rule="symbol"
          showIcon
          className="oui-fastPlaceOrder-orderConfirm-symbol"
        >
          {order.symbol}
        </Text.formatted>
        <Badge color={order.side === OrderSide.BUY ? "buy" : "sell"} size="sm">
          {order.side === OrderSide.BUY
            ? t("fastPlaceOrder.buy")
            : t("fastPlaceOrder.sell")}
        </Badge>
      </Flex>

      <Divider className="oui-my-4" />

      <div className="oui-fastPlaceOrder-orderConfirm-content oui-space-y-2">
        <Flex justify="between">
          <Text>{t("fastPlaceOrder.qty")}</Text>
          <Text.numeral
            rule="price"
            dp={symbolInfo.base_dp ?? 0}
            padding={false}
            className="oui-text-base-contrast"
          >
            {order.order_quantity}
          </Text.numeral>
        </Flex>

        <Flex justify="between">
          <Text>{t("fastPlaceOrder.mark")}</Text>
          <Text className="oui-text-base-contrast">
            {order.order_type === OrderType.MARKET
              ? t("fastPlaceOrder.marketPrice")
              : String(order.order_price ?? "")}
          </Text>
        </Flex>
      </div>

      <Flex
        gapX={1}
        pt={4}
        pb={5}
        className="oui-fastPlaceOrder-orderConfirm-disableConfirm"
      >
        <Checkbox
          id="fast-place-order-confirm"
          color="white"
          onCheckedChange={(checked) => {
            setNeedConfirm(!!!checked);
          }}
        />
        <label htmlFor="fast-place-order-confirm" className="oui-text-2xs">
          {t("fastPlaceOrder.disableOrderConfirm")}
        </label>
      </Flex>

      <Grid cols={2} gapX={3} className="oui-fastPlaceOrder-orderConfirm-actions">
        <Button color="secondary" size="md" onClick={() => onCancel()}>
          {t("fastPlaceOrder.cancel")}
        </Button>
        <Button size="md" onClick={() => onConfirm()}>
          {t("fastPlaceOrder.placeOrderNow")}
        </Button>
      </Grid>
    </>
  );
};

const Dialog = (
  props: Omit<FastPlaceOrderConfirmDialogProps, "onCancel" | "onConfirm"> & {
    close: () => void;
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  },
) => {
  const { close, resolve, reject, ...rest } = props;

  return (
    <FastPlaceOrderConfirmDialog
      {...rest}
      onCancel={() => {
        reject("cancel");
        close();
      }}
      onConfirm={() => {
        resolve();
        close();
      }}
    />
  );
};

const OrderConfirmDialogTitle: FC = () => {
  const { t: tBase } = useTranslation();
  const t = tBase as (key: keyof TFastPlaceOrderLocales) => string;
  return <>{t("fastPlaceOrder.orderConfirmTitle")}</>;
};

registerSimpleDialog(orderConfirmDialogId, Dialog, {
  size: "sm",
  title: () => <OrderConfirmDialogTitle />,
});

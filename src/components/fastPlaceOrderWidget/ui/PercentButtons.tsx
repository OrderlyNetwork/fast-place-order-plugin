import React, { FC } from "react";
import { Button, Flex, Text, cn } from "@orderly.network/ui";
import type { PercentOption } from "../fastPlaceOrderWidget.script";

export type PercentButtonsProps = {
  options: readonly PercentOption[];
  selectedPercent: PercentOption | null | undefined;
  onSelect: (p: PercentOption) => void;
  /** 选中百分比时左侧显示的数量文案（如该百分比下的买量） */
  qtyLabelLeft?: string;
  /** 选中百分比时右侧显示的数量文案（如该百分比下的卖量） */
  qtyLabelRight?: string;
};

export const PercentButtons: FC<PercentButtonsProps> = ({
  options,
  selectedPercent,
  onSelect,
  qtyLabelLeft = "",
  qtyLabelRight = "",
}) => (
  <Flex
    data-no-drag
    direction="row"
    itemAlign="center"
    justify="between"
    className="oui-fastPlaceOrder-bottom oui-w-full oui-gap-1 oui-h-6 oui-px-1"
  >
    <Flex justify="start" className="oui-w-16 oui-min-w-16 oui-shrink-0 oui-ml-2">
      {qtyLabelLeft ? (
        <Text className="oui-text-xs oui-leading-4 oui-text-base-contrast-54 oui-truncate">
          {qtyLabelLeft}
        </Text>
      ) : null}
    </Flex>
    {/** Keep percentage actions optically centered between optional qty labels on both sides. */}
    <Flex
      direction="row"
      itemAlign="center"
      justify="center"
      className="oui-gap-1.5 oui-shrink-0"
    >
      {options.map((p) => (
        <Button
          key={p}
          type="button"
          variant="outlined"
          size="xs"
          className={cn(
            "oui-fastPlaceOrder-percent-btn oui-min-w-0 oui-h-5 oui-px-1.5 oui-text-xs oui-leading-4 oui-text-base-contrast-36 oui-border-base-6 oui-rounded-sm hover:oui-bg-base-7/70",
            selectedPercent === p &&
            "oui-bg-base-6 oui-text-base-contrast-54 oui-border-base-5",
          )}
          onClick={() => onSelect(p)}
        >
          {p}%
        </Button>
      ))}
    </Flex>
    <Flex justify="end" className="oui-w-16 oui-min-w-16 oui-shrink-0">
      {qtyLabelRight ? (
        <Text className="oui-text-xs oui-leading-4 oui-text-base-contrast-54 oui-truncate oui-text-right oui-mr-2">
          {qtyLabelRight}
        </Text>
      ) : null}
    </Flex>
  </Flex>
);

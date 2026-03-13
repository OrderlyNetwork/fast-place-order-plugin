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
    className="oui-fastPlaceOrder-bottom oui-w-full oui-gap-1 oui-h-5"
  >
    <Flex justify="start" className="oui-w-20 oui-min-w-20 oui-shrink-0 oui-ml-4">
      {qtyLabelLeft ? (
        <Text className="oui-text-xs oui-text-base-4 oui-truncate">
          {qtyLabelLeft}
        </Text>
      ) : null}
    </Flex>
    <Flex direction="row" itemAlign="center" justify="center" className="oui-gap-1 oui-shrink-0">
      {options.map((p) => (
        <Button
          key={p}
          type="button"
          variant="outlined"
          size="xs"
          className={cn(
            "oui-fastPlaceOrder-percent-btn oui-min-w-0 oui-h-4 oui-px-1",
            selectedPercent === p && "oui-bg-base-6",
          )}
          onClick={() => onSelect(p)}
        >
          {p}%
        </Button>
      ))}
    </Flex>
    <Flex justify="end" className="oui-w-20 oui-min-w-20 oui-shrink-0">
      {qtyLabelRight ? (
        <Text className="oui-text-xs oui-text-base-4 oui-truncate oui-text-right oui-mr-4">
          {qtyLabelRight}
        </Text>
      ) : null}
    </Flex>
  </Flex>
);

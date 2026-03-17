import React, { FC, useRef, useEffect } from "react";
import { Box, Input, Text, cn, inputFormatter } from "@orderly.network/ui";
import type { PercentOption } from "../fastPlaceOrderWidget.script";

export type QtyInputBlockProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** 当前选中的百分比，非空时显示为百分比标签而非输入框 */
  selectedPercent?: PercentOption | null;
  /** 点击百分比标签时切回输入框 */
  onSwitchToInput?: () => void;
  /** 根据 symbol 的 base_dp 控制数量输入小数位，来自 symbolInfo.base_dp */
  baseDp?: number;
  inputClassName?: string;
};

export const QtyInputBlock: FC<QtyInputBlockProps> = ({
  label,
  value,
  onChange,
  selectedPercent,
  onSwitchToInput,
  baseDp = 0,
  inputClassName,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const prevSelectedPercent = useRef(selectedPercent);

  useEffect(() => {
    if (prevSelectedPercent.current != null && selectedPercent == null) {
      inputRef.current?.focus();
    }
    prevSelectedPercent.current = selectedPercent;
  }, [selectedPercent]);

  return (
  <Box
    data-no-drag
    className="oui-fastPlaceOrder-qty oui-flex oui-flex-[1.25] oui-basis-0 oui-flex-col oui-gap-0.5 oui-min-w-[96px]"
  >
    <Text className="oui-fastPlaceOrder-qty-label oui-text-xs oui-text-base-4 oui-truncate oui-text-center">
      {label}
    </Text>
    {selectedPercent != null ? (
      <Box
        role="button"
        tabIndex={0}
        className={cn(
          "oui-fastPlaceOrder-qty-input oui-fastPlaceOrder-qty-percent-label oui-w-full oui-px-1 oui-text-center oui-cursor-pointer oui-select-none",
          "focus:oui-outline-none",
          inputClassName,
        )}
        onClick={onSwitchToInput}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && onSwitchToInput) {
            e.preventDefault();
            onSwitchToInput();
          }
        }}
      >
        <Text className="oui-text-inherit">{selectedPercent}%</Text>
      </Box>
    ) : (
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "oui-fastPlaceOrder-qty-input oui-w-full oui-bg-transparent oui-outline-0 focus:oui-outline-none focus:oui-ring-0 focus:oui-border-transparent oui-border-none oui-px-1",
          inputClassName,
        )}
        placeholder="0"
        formatters={[inputFormatter.dpFormatter(baseDp)]}
      />
    )}
  </Box>
  );
};

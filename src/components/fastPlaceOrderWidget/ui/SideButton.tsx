import React, { FC } from "react";
import { Box, Text, cn } from "@orderly.network/ui";

export type SideButtonVariant = "long" | "short";

export type SideButtonProps = {
  variant: SideButtonVariant;
  label: string;
  maxQtyStr: string;
  disabled?: boolean;
  onClick: () => void;
  labelClassName?: string;
  maxQtyClassName?: string;
};

const variantStyles: Record<
  SideButtonVariant,
  { container: string; labelClass: string; maxQtyClass: string }
> = {
  /** Compact hover/active deltas keep the buy button vivid without overpowering nearby controls. */
  long: {
    container:
      "oui-fastPlaceOrder-long oui-bg-success-darken hover:oui-bg-success/90 active:oui-bg-success/80 oui-rounded-md",
    labelClass: "oui-fastPlaceOrder-long-label",
    maxQtyClass: "oui-fastPlaceOrder-long-maxQty",
  },
  /** Mirror the long button rhythm so both sides feel visually balanced. */
  short: {
    container:
      "oui-fastPlaceOrder-short oui-bg-danger-darken hover:oui-bg-danger/90 active:oui-bg-danger/80 oui-rounded-md",
    labelClass: "oui-fastPlaceOrder-short-label",
    maxQtyClass: "oui-fastPlaceOrder-short-maxQty",
  },
};

export const SideButton: FC<SideButtonProps> = ({
  variant,
  label,
  maxQtyStr,
  disabled,
  onClick,
  labelClassName,
  maxQtyClassName,
}) => {
  const styles = variantStyles[variant];
  return (
    <Box
      data-no-drag
      role="button"
      tabIndex={0}
      aria-label={label}
      className={cn(
        "oui-flex oui-flex-1 oui-basis-0 oui-flex-col oui-gap-0 oui-min-w-0 oui-h-12 oui-px-2 oui-py-2 oui-justify-center oui-items-center oui-cursor-pointer oui-select-none oui-text-white oui-rounded-sm oui-transition-colors",
        styles.container,
        disabled &&
        "oui-opacity-50 oui-cursor-not-allowed oui-pointer-events-none",
      )}
      onClick={() => !disabled && onClick()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <Text
        className={cn(
          "oui-text-sm oui-leading-4 oui-font-semibold",
          styles.labelClass,
          labelClassName,
        )}
      >
        {label}
      </Text>
      <Text
        className={cn(
          "oui-text-[13px] oui-leading-4 oui-text-white/90 oui-text-center oui-truncate oui-w-full oui-font-medium",
          styles.maxQtyClass,
          maxQtyClassName,
        )}
      >
        {maxQtyStr}
      </Text>
    </Box>
  );
};

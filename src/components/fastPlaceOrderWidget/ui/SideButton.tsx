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
  long: {
    container:
      "oui-fastPlaceOrder-long oui-bg-success hover:oui-bg-success/80 active:oui-bg-success/70",
    labelClass: "oui-fastPlaceOrder-long-label",
    maxQtyClass: "oui-fastPlaceOrder-long-maxQty",
  },
  short: {
    container:
      "oui-fastPlaceOrder-short oui-bg-danger hover:oui-bg-danger/80 active:oui-bg-danger/70",
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
        "oui-flex oui-flex-1 oui-basis-0 oui-flex-col oui-gap-0.5 oui-min-w-0 oui-p-2 oui-justify-center oui-items-center oui-cursor-pointer oui-select-none oui-text-white",
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
          "oui-text-sm oui-font-medium",
          styles.labelClass,
          labelClassName,
        )}
      >
        {label}
      </Text>
      <Text
        className={cn(
          "oui-text-xs oui-text-white/90 oui-text-center oui-truncate oui-w-full",
          styles.maxQtyClass,
          maxQtyClassName,
        )}
      >
        {maxQtyStr}
      </Text>
    </Box>
  );
};

import React, { FC } from "react";
import { Box, cn } from "@orderly.network/ui";

export type DragHandleProps = {
  isDragging?: boolean;
  onPointerDown?: (e: React.PointerEvent) => void;
};

export const DragHandle: FC<DragHandleProps> = ({
  isDragging,
  onPointerDown,
}) => (
  <Box
    aria-label="Drag to move"
    role="button"
    tabIndex={0}
    className={cn(
      /** A subtle grip style reduces noise while still advertising draggable affordance. */
      "oui-fastPlaceOrder-dragArea oui-flex oui-items-center oui-justify-center oui-shrink-0 oui-w-4 oui-text-[10px] oui-font-medium oui-text-base-contrast-54 oui-cursor-grab oui-select-none oui-rounded-sm oui-transition-colors hover:oui-bg-base-7/60",
      isDragging && "oui-cursor-grabbing oui-bg-base-7/70",
    )}
    style={{ touchAction: "none" as const }}
    onPointerDown={onPointerDown}
  >
    ⋮⋮
  </Box>
);

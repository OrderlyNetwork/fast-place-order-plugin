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
      "oui-fastPlaceOrder-dragArea oui-flex oui-items-center oui-justify-center oui-shrink-0 oui-w-3 oui-text-base-4 oui-cursor-grab oui-select-none",
      isDragging && "oui-cursor-grabbing",
    )}
    style={{ touchAction: "none" as const }}
    onPointerDown={onPointerDown}
  >
    ☰
  </Box>
);

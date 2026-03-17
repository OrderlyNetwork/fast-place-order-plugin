import React, { FC } from "react";
import { Box, cn } from "@orderly.network/ui";
import type { FastPlaceOrderMessage } from "../fastPlaceOrderWidget.script";

export type ToastMessageProps = {
  message: FastPlaceOrderMessage;
  text: string;
};

export const ToastMessage: FC<ToastMessageProps> = ({ message, text }) => (
  <Box
    className={cn(
      "oui-absolute oui-bottom-full oui-left-0 oui-right-0 oui-mb-1 oui-rounded oui-px-2 oui-py-1 oui-text-xs",
      message.type === "success"
        ? "oui-bg-green-500/20 oui-text-green-4"
        : "oui-bg-red-500/20 oui-text-red-4",
    )}
  >
    {text}
  </Box>
);

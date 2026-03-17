import React, { FC } from "react";
import { SimpleDialog } from "@orderly.network/ui";

export type MaxQtyConfirmDialogProps = {
  open: boolean;
  title: string;
  content: string;
  placeOrderLabel: string;
  cancelLabel: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
};

export const MaxQtyConfirmDialog: FC<MaxQtyConfirmDialogProps> = ({
  open,
  title,
  content,
  placeOrderLabel,
  cancelLabel,
  onOpenChange,
  onConfirm,
}) => (
  <SimpleDialog
    open={open}
    title={title}
    closable
    onOpenChange={onOpenChange}
    size="sm"
    classNames={{
      footer: "oui-fastPlaceOrder-maxQtyConfirm-footer",
      body: "oui-fastPlaceOrder-maxQtyConfirm-body",
    }}
    actions={{
      primary: {
        label: placeOrderLabel,
        className:
          "oui-primary-btn oui-text-sm oui-font-semibold oui-w-[100%] oui-h-8",
        onClick: () => {
          onConfirm();
          return Promise.resolve();
        },
      },
      secondary: {
        label: cancelLabel,
        className:
          "oui-secondary-btn oui-text-sm oui-font-semibold oui-w-[100%] oui-h-8",
        onClick: () => {
          onOpenChange(false);
          return Promise.resolve();
        },
      },
    }}
  >
    <div className="oui-fastPlaceOrder-maxQtyConfirm-content oui-text-2xs lg:oui-text-sm">
      {content}
    </div>
  </SimpleDialog>
);

import React from "react";

export interface FastPlaceOrderWidgetProps {
  className?: string;
}

export const FastPlaceOrderWidget: React.FC<FastPlaceOrderWidgetProps> = ({ className }) => {
  return (
    <div className={className}>
      {/* TODO: Implement your widget UI here */}
      <p>FastPlaceOrder Widget</p>
    </div>
  );
};

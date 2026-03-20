import type { Meta, StoryObj } from "@storybook/react";


import { registerFastPlaceOrderPlugin } from "../index";

import { TradingPage } from "@orderly.network/trading";
import { OrderlyPluginProvider } from '@orderly.network/ui'
import { useEffect, useState } from "react";
import { tradingPageConfig } from "./orderlyConfig";

import '@orderly.network/ui/dist/styles.css';

const meta = {
    title: "fast place order",
    component: TradingPage,
    parameters: {
        layout: "fullscreen",
    },
    args: {
        symbol: "PERP_BTC_USDC",
        tradingViewConfig: tradingPageConfig.tradingViewConfig,
        sharePnLConfig: tradingPageConfig.sharePnLConfig,
    },
    argTypes: {
        symbol: {
            control: "select",
            options: ["PERP_BTC_USDC", "PERP_ETH_USDC"],
        },
        src: {
            control: "text",
            description: "The source URL of the YouTube video",
        },
    },
} satisfies Meta<typeof TradingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: (arg) => {
        const [symbol, setSymbol] = useState("PERP_BTC_USDC");

        useEffect(() => {
            // updateSymbol(symbol);
        }, [symbol]);

        return <OrderlyPluginProvider plugins={[registerFastPlaceOrderPlugin({
            className: "my-fast-place-order", // optional
        })]}>
            <TradingPage
                {...arg}
                symbol={symbol}
                onSymbolChange={(symbol) => {
                    setSymbol(symbol.symbol);
                }}
            />
        </OrderlyPluginProvider>


    },
    args: {
    },
};
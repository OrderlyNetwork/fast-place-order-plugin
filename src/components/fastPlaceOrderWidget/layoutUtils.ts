export interface FastPlaceOrderStoredLayout {
  left?: number;
  top?: number;
}

const POSITION_OFFSET = 20;
const VIEWPORT_MARGIN = 20;

export const FAST_PLACE_ORDER_LAYOUT_KEY = "orderly.fast-place-order.layout.v1";

/** Clamp left/top so the widget stays within viewport with margin. */
export function clampPosition(
  left: number,
  top: number,
  width: number,
  height: number,
): { left: number; top: number } {
  if (typeof window === "undefined") {
    return { left, top };
  }
  const maxLeft = window.innerWidth - width - VIEWPORT_MARGIN;
  const maxTop = window.innerHeight - height - VIEWPORT_MARGIN;
  return {
    left: Math.max(VIEWPORT_MARGIN, Math.min(left, maxLeft)),
    top: Math.max(VIEWPORT_MARGIN, Math.min(top, maxTop)),
  };
}

export function getPositionStyle(position: "bottom-right" | "bottom-left" | "top-left" | "top-right"): {
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
} {
  switch (position) {
    case "top-left":
      return { top: POSITION_OFFSET, left: POSITION_OFFSET };
    case "top-right":
      return { top: POSITION_OFFSET, right: POSITION_OFFSET };
    case "bottom-left":
      return { bottom: POSITION_OFFSET, left: POSITION_OFFSET };
    case "bottom-right":
    default:
      return { bottom: POSITION_OFFSET, right: POSITION_OFFSET };
  }
}

export function loadFastPlaceOrderLayout(): FastPlaceOrderStoredLayout | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(FAST_PLACE_ORDER_LAYOUT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FastPlaceOrderStoredLayout;
  } catch {
    return null;
  }
}

export function saveFastPlaceOrderLayout(layout: FastPlaceOrderStoredLayout): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FAST_PLACE_ORDER_LAYOUT_KEY, JSON.stringify(layout));
  } catch {
    // localStorage may be unavailable in private mode
  }
}

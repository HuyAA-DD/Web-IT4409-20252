export const CART_CHANGED_EVENT = "cart-changed";

const unwrapCartPayload = (payload) => {
  if (payload?.data !== undefined) return payload.data;
  return payload;
};

export const getCartItemCount = (payload) => {
  const cart = unwrapCartPayload(payload);

  if (Number.isFinite(Number(cart?.totalItems))) {
    return Number(cart.totalItems);
  }

  const items = Array.isArray(cart?.items) ? cart.items : [];

  return items.reduce((sum, item) => sum + Number(item?.quantity || 0), 0);
};

export const notifyCartChanged = (payload) => {
  if (typeof window === "undefined") return;

  const detail =
    payload === undefined
      ? {}
      : {
          cartCount: getCartItemCount(payload),
        };

  window.dispatchEvent(
    new CustomEvent(CART_CHANGED_EVENT, {
      detail,
    })
  );
};

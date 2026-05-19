import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import cartApi from "../api/cartApi";
import CartItem from "../components/cart/CartItem";
import { formatCurrency } from "../utils/formatCurrency";

function normalizeCartItems(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.cartItems)) {
    return response.cartItems;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.items)) {
    return response.data.items;
  }

  if (Array.isArray(response?.data?.cartItems)) {
    return response.data.cartItems;
  }

  return [];
}

function getItemId(item) {
  return item.id || item.cartItemId || item.itemId;
}

function getItemPrice(item) {
  return item.price || item.product?.price || 0;
}

function CartPage() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const totalAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = Number(getItemPrice(item));
      const quantity = Number(item.quantity || 1);

      return sum + price * quantity;
    }, 0);
  }, [cartItems]);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await cartApi.getCart();
      const items = normalizeCartItems(response);

      setCartItems(items);
    } catch (error) {
      setErrorMessage(
        "Không tải được giỏ hàng. Hãy kiểm tra backend, token đăng nhập hoặc endpoint cart."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (item, nextQuantity) => {
    const itemId = getItemId(item);

    if (!itemId) {
      toast.error("Không tìm thấy id của sản phẩm trong giỏ hàng");
      return;
    }

    if (nextQuantity < 1) {
      return;
    }

    try {
      setUpdatingItemId(itemId);

      await cartApi.updateCartItem(itemId, {
        quantity: nextQuantity,
      });

      setCartItems((currentItems) =>
        currentItems.map((currentItem) => {
          if (getItemId(currentItem) === itemId) {
            return {
              ...currentItem,
              quantity: nextQuantity,
            };
          }

          return currentItem;
        })
      );

      toast.success("Đã cập nhật giỏ hàng");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Cập nhật số lượng thất bại";

      toast.error(message);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (item) => {
    const itemId = getItemId(item);

    if (!itemId) {
      toast.error("Không tìm thấy id của sản phẩm trong giỏ hàng");
      return;
    }

    const confirmed = window.confirm("Bạn có chắc muốn xóa sản phẩm này?");

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingItemId(itemId);

      await cartApi.removeCartItem(itemId);

      setCartItems((currentItems) =>
        currentItems.filter((currentItem) => getItemId(currentItem) !== itemId)
      );

      toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Xóa sản phẩm thất bại";

      toast.error(message);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleClearCart = async () => {
    if (cartItems.length === 0) {
      return;
    }

    const confirmed = window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?");

    if (!confirmed) {
      return;
    }

    try {
      await cartApi.clearCart();
      setCartItems([]);
      toast.success("Đã xóa toàn bộ giỏ hàng");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Xóa giỏ hàng thất bại";

      toast.error(message);
    }
  };

  const handleGoToCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Giỏ hàng đang trống");
      return;
    }

    navigate("/checkout");
  };

  if (isLoading) {
    return (
      <div className="container page">
        <div className="placeholder-box">Đang tải giỏ hàng...</div>
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Giỏ hàng</h1>
        <p>Kiểm tra sản phẩm trong giỏ hàng trước khi thanh toán.</p>
      </div>

      {errorMessage && (
        <div
          className="placeholder-box"
          style={{
            marginBottom: "24px",
            color: "#92400e",
            background: "#fffbeb",
            borderColor: "#fbbf24",
          }}
        >
          {errorMessage}
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="info-card">
          <h2>Giỏ hàng đang trống</h2>

          <p style={{ color: "#4b5563" }}>
            Hãy quay lại trang sản phẩm để thêm sản phẩm vào giỏ hàng.
          </p>

          <Link to="/products" className="btn btn-primary">
            Xem sản phẩm
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {cartItems.map((item) => {
              const itemId = getItemId(item);

              return (
                <CartItem
                  key={itemId}
                  item={item}
                  isUpdating={updatingItemId === itemId}
                  onDecrease={() =>
                    handleUpdateQuantity(item, Number(item.quantity || 1) - 1)
                  }
                  onIncrease={() =>
                    handleUpdateQuantity(item, Number(item.quantity || 1) + 1)
                  }
                  onRemove={() => handleRemoveItem(item)}
                />
              );
            })}
          </div>

          <aside className="cart-summary">
            <h2>Tóm tắt đơn hàng</h2>

            <div className="summary-row">
              <span>Số sản phẩm</span>
              <strong>{cartItems.length}</strong>
            </div>

            <div className="summary-row">
              <span>Tạm tính</span>
              <strong>{formatCurrency(totalAmount)}</strong>
            </div>

            <div className="summary-total">
              <span>Tổng tiền</span>
              <strong>{formatCurrency(totalAmount)}</strong>
            </div>

            <button
              type="button"
              className="btn btn-primary full-width"
              onClick={handleGoToCheckout}
            >
              Thanh toán
            </button>

            <button
              type="button"
              className="btn btn-outline full-width"
              onClick={handleClearCart}
              style={{ marginTop: "12px" }}
            >
              Xóa toàn bộ giỏ hàng
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}

export default CartPage;
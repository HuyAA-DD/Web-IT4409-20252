import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import cartApi from "../api/cartApi";
import couponApi from "../api/couponApi";
import orderApi from "../api/orderApi";
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

function normalizeApplyCouponResponse(response) {
  if (!response) {
    return null;
  }

  if (response.code || response.discountAmount || response.finalAmount) {
    return response;
  }

  if (
    response.data?.code ||
    response.data?.discountAmount ||
    response.data?.finalAmount
  ) {
    return response.data;
  }

  return null;
}

function getItemPrice(item) {
  return item.price || item.product?.price || 0;
}

function getItemName(item) {
  return item.productName || item.product?.name || "Sản phẩm không tên";
}

function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const couponFromUrl = searchParams.get("coupon");
  const couponFromStorage = localStorage.getItem("selectedCouponCode");
  const initialCouponCode = couponFromUrl || couponFromStorage || "";

  const [cartItems, setCartItems] = useState([]);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const [formData, setFormData] = useState({
    receiverName: "",
    receiverPhone: "",
    shippingAddress: "",
    couponCode: initialCouponCode,
  });

  const totalAmount = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const price = Number(getItemPrice(item));
      const quantity = Number(item.quantity || 1);

      return sum + price * quantity;
    }, 0);
  }, [cartItems]);

  const discountAmount = Number(appliedCoupon?.discountAmount || 0);
  const finalAmount = Number(appliedCoupon?.finalAmount ?? totalAmount);

  useEffect(() => {
    async function fetchCart() {
      try {
        setIsLoadingCart(true);
        setErrorMessage("");

        const response = await cartApi.getCart();
        const items = normalizeCartItems(response);

        setCartItems(items);
      } catch (error) {
        setErrorMessage(
          "Không tải được giỏ hàng. Hãy kiểm tra đăng nhập hoặc backend."
        );
      } finally {
        setIsLoadingCart(false);
      }
    }

    fetchCart();
  }, []);

  useEffect(() => {
    if (couponFromUrl || couponFromStorage) {
      setFormData((current) => ({
        ...current,
        couponCode: couponFromUrl || couponFromStorage,
      }));
    }
  }, [couponFromUrl, couponFromStorage]);

  useEffect(() => {
    setAppliedCoupon(null);
  }, [totalAmount]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (name === "couponCode") {
      setAppliedCoupon(null);
    }
  };

  const validateForm = () => {
    if (!formData.receiverName.trim()) {
      toast.error("Vui lòng nhập tên người nhận");
      return false;
    }

    if (!formData.receiverPhone.trim()) {
      toast.error("Vui lòng nhập số điện thoại người nhận");
      return false;
    }

    if (!formData.shippingAddress.trim()) {
      toast.error("Vui lòng nhập địa chỉ giao hàng");
      return false;
    }

    if (cartItems.length === 0) {
      toast.error("Giỏ hàng đang trống, không thể đặt hàng");
      return false;
    }

    return true;
  };

  const handleApplyCoupon = async () => {
    const code = formData.couponCode.trim().toUpperCase();

    if (!code) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Giỏ hàng đang trống, không thể áp dụng mã");
      return;
    }

    try {
      setIsApplyingCoupon(true);

      const response = await couponApi.applyCoupon({
        code,
        orderAmount: totalAmount,
      });

      const result = normalizeApplyCouponResponse(response);

      if (!result) {
        toast.error("Backend trả về dữ liệu coupon chưa đúng format");
        return;
      }

      setAppliedCoupon(result);

      setFormData((current) => ({
        ...current,
        couponCode: result.code || code,
      }));

      localStorage.setItem("selectedCouponCode", result.code || code);

      toast.success("Áp dụng mã giảm giá thành công");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Mã giảm giá không hợp lệ hoặc đã hết hạn";

      setAppliedCoupon(null);
      toast.error(message);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem("selectedCouponCode");

    setFormData((current) => ({
      ...current,
      couponCode: "",
    }));

    toast.info("Đã xóa mã giảm giá");
  };

  const handleSubmitOrder = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const couponCode = formData.couponCode.trim();

    if (couponCode && !appliedCoupon) {
      const confirmed = window.confirm(
        "Bạn đã nhập mã giảm giá nhưng chưa áp dụng. Bạn vẫn muốn đặt hàng không?"
      );

      if (!confirmed) {
        return;
      }
    }

    try {
      setIsSubmitting(true);

      await orderApi.createOrder({
        receiverName: formData.receiverName.trim(),
        receiverPhone: formData.receiverPhone.trim(),
        shippingAddress: formData.shippingAddress.trim(),
        couponCode: appliedCoupon?.code || couponCode || null,
      });

      localStorage.removeItem("selectedCouponCode");

      toast.success("Đặt hàng thành công");
      navigate("/orders");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Đặt hàng thất bại. Hãy kiểm tra giỏ hàng, tồn kho hoặc mã giảm giá.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingCart) {
    return (
      <div className="container page">
        <div className="placeholder-box">Đang tải thông tin thanh toán...</div>
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Thanh toán</h1>
        <p>Nhập thông tin nhận hàng và áp dụng mã giảm giá nếu có.</p>
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
            Bạn cần thêm sản phẩm vào giỏ hàng trước khi thanh toán.
          </p>

          <Link to="/products" className="btn btn-primary">
            Xem sản phẩm
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <form className="info-card form" onSubmit={handleSubmitOrder}>
            <h2 style={{ marginTop: 0 }}>Thông tin nhận hàng</h2>

            <input
              type="text"
              name="receiverName"
              placeholder="Tên người nhận"
              value={formData.receiverName}
              onChange={handleChange}
            />

            <input
              type="text"
              name="receiverPhone"
              placeholder="Số điện thoại người nhận"
              value={formData.receiverPhone}
              onChange={handleChange}
            />

            <input
              type="text"
              name="shippingAddress"
              placeholder="Địa chỉ giao hàng"
              value={formData.shippingAddress}
              onChange={handleChange}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                name="couponCode"
                placeholder="Mã giảm giá nếu có"
                value={formData.couponCode}
                onChange={handleChange}
                disabled={Boolean(appliedCoupon)}
              />

              {appliedCoupon ? (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleRemoveCoupon}
                >
                  Xóa mã
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon}
                >
                  {isApplyingCoupon ? "Đang áp dụng..." : "Áp dụng"}
                </button>
              )}
            </div>

            <Link to="/coupons" className="btn btn-outline full-width">
              Xem danh sách mã giảm giá
            </Link>

            {appliedCoupon && (
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "12px",
                  background: "#ecfdf5",
                  color: "#047857",
                  border: "1px solid #a7f3d0",
                  fontWeight: 700,
                }}
              >
                Đã áp dụng mã {appliedCoupon.code}. Giảm{" "}
                {formatCurrency(discountAmount)}.
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary full-width"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang đặt hàng..." : "Đặt hàng"}
            </button>

            <Link to="/cart" className="btn btn-outline full-width">
              Quay lại giỏ hàng
            </Link>
          </form>

          <aside className="cart-summary">
            <h2>Tóm tắt đơn hàng</h2>

            <div style={{ display: "grid", gap: "12px", marginBottom: "16px" }}>
              {cartItems.map((item) => {
                const price = Number(getItemPrice(item));
                const quantity = Number(item.quantity || 1);
                const subtotal = price * quantity;

                return (
                  <div
                    key={item.id || item.productId}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "12px",
                      borderBottom: "1px solid #e5e7eb",
                      paddingBottom: "10px",
                    }}
                  >
                    <div>
                      <strong>{getItemName(item)}</strong>
                      <p style={{ margin: "4px 0 0", color: "#6b7280" }}>
                        SL: {quantity}
                      </p>
                    </div>

                    <strong>{formatCurrency(subtotal)}</strong>
                  </div>
                );
              })}
            </div>

            <div className="summary-row">
              <span>Số sản phẩm</span>
              <strong>{cartItems.length}</strong>
            </div>

            <div className="summary-row">
              <span>Tạm tính</span>
              <strong>{formatCurrency(totalAmount)}</strong>
            </div>

            <div className="summary-row">
              <span>Giảm giá</span>
              <strong style={{ color: "#047857" }}>
                -{formatCurrency(discountAmount)}
              </strong>
            </div>

            <div className="summary-total">
              <span>Tổng thanh toán</span>
              <strong>{formatCurrency(finalAmount)}</strong>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default CheckoutPage;
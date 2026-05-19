import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import wishlistApi from "../api/wishlistApi";
import { formatCurrency } from "../utils/formatCurrency";

function normalizeWishlist(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.wishlist)) {
    return response.wishlist;
  }

  if (Array.isArray(response?.data?.wishlist)) {
    return response.data.wishlist;
  }

  return [];
}

function formatDateTime(value) {
  if (!value) return "Chưa cập nhật";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("vi-VN");
}

function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingProductId, setRemovingProductId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchWishlist = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const response = await wishlistApi.getWishlist();
      const items = normalizeWishlist(response);

      setWishlistItems(items);
    } catch (error) {
      setErrorMessage(
        "Không tải được danh sách yêu thích. Hãy kiểm tra đăng nhập hoặc backend."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    const confirmed = window.confirm("Bạn có chắc muốn xóa sản phẩm này khỏi yêu thích?");

    if (!confirmed) {
      return;
    }

    try {
      setRemovingProductId(productId);

      await wishlistApi.removeFromWishlist(productId);

      setWishlistItems((currentItems) =>
        currentItems.filter((item) => item.productId !== productId)
      );

      toast.success("Đã xóa khỏi danh sách yêu thích");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Xóa sản phẩm khỏi yêu thích thất bại";

      toast.error(message);
    } finally {
      setRemovingProductId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container page">
        <div className="placeholder-box">Đang tải danh sách yêu thích...</div>
      </div>
    );
  }

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Danh sách yêu thích</h1>
        <p>Các sản phẩm bạn đã lưu để xem lại hoặc mua sau.</p>
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

      {wishlistItems.length === 0 ? (
        <div className="info-card">
          <h2>Chưa có sản phẩm yêu thích</h2>

          <p style={{ color: "#4b5563" }}>
            Hãy quay lại trang sản phẩm và bấm “Yêu thích” để lưu sản phẩm.
          </p>

          <Link to="/products" className="btn btn-primary">
            Xem sản phẩm
          </Link>
        </div>
      ) : (
        <section className="section-grid">
          {wishlistItems.map((item) => (
            <article key={item.id || item.productId} className="info-card">
              <Link to={`/products/${item.productId}`}>
                <img
                  src={
                    item.imageUrl ||
                    "https://via.placeholder.com/400x300?text=No+Image"
                  }
                  alt={item.productName || "Product image"}
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover",
                    borderRadius: "14px",
                    marginBottom: "16px",
                    background: "#f3f4f6",
                  }}
                />
              </Link>

              <h2 style={{ margin: "0 0 8px" }}>
                <Link to={`/products/${item.productId}`}>
                  {item.productName || "Sản phẩm không tên"}
                </Link>
              </h2>

              <p
                style={{
                  color: "#2563eb",
                  fontWeight: 700,
                  fontSize: "18px",
                  marginTop: "12px",
                }}
              >
                {formatCurrency(item.price)}
              </p>

              <p style={{ color: "#4b5563" }}>Tồn kho: {item.stock ?? 0}</p>

              <p style={{ color: "#6b7280", fontSize: "14px" }}>
                Đã thêm: {formatDateTime(item.createdAt)}
              </p>

              <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                <Link
                  to={`/products/${item.productId}`}
                  className="btn btn-outline"
                >
                  Chi tiết
                </Link>

                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleRemove(item.productId)}
                  disabled={removingProductId === item.productId}
                >
                  {removingProductId === item.productId ? "Đang xóa..." : "Xóa"}
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export default WishlistPage;
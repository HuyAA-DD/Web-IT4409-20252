import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import wishlistApi from "../../api/wishlistApi";
import { formatCurrency } from "../../utils/formatCurrency";

function ProductCard({ product }) {
  const imageUrl =
    product.imageUrl ||
    product.thumbnail ||
    product.images?.[0]?.imageUrl ||
    product.productImages?.[0]?.imageUrl ||
    "https://via.placeholder.com/400x300?text=No+Image";

  const price =
    product.price ||
    product.minPrice ||
    product.variants?.[0]?.price ||
    product.productVariants?.[0]?.price ||
    0;

  const handleAddToWishlist = async () => {
    if (!product?.id) {
      toast.error("Không tìm thấy productId");
      return;
    }

    try {
      await wishlistApi.addToWishlist(product.id);
      toast.success("Đã thêm vào danh sách yêu thích");
    } catch (error) {
      const status = error.response?.status;

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Thêm vào yêu thích thất bại";

      if (status === 401 || status === 403) {
        toast.error("Bạn cần đăng nhập để thêm sản phẩm vào yêu thích");
      } else {
        toast.error(message);
      }
    }
  };

  return (
    <article className="info-card">
      <Link to={`/products/${product.id}`}>
        <img
          src={imageUrl}
          alt={product.name || "Product image"}
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
        <Link to={`/products/${product.id}`}>{product.name}</Link>
      </h2>

      <p style={{ color: "#6b7280", minHeight: "48px" }}>
        {product.description || "Chưa có mô tả sản phẩm."}
      </p>

      <p
        style={{
          color: "#2563eb",
          fontWeight: 700,
          fontSize: "18px",
          marginTop: "12px",
        }}
      >
        {formatCurrency(price)}
      </p>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginTop: "16px",
          flexWrap: "wrap",
        }}
      >
        <Link to={`/products/${product.id}`} className="btn btn-outline">
          Chi tiết
        </Link>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleAddToWishlist}
        >
          Yêu thích
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
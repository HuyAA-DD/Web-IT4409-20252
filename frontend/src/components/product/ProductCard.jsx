import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import wishlistApi from "../../api/wishlistApi";
import { formatCurrency } from "../../utils/formatCurrency";

function getProductImage(product) {
  return (
    product.imageUrl ||
    product.thumbnail ||
    product.images?.[0]?.imageUrl ||
    product.productImages?.[0]?.imageUrl ||
    "https://via.placeholder.com/400x300?text=No+Image"
  );
}

function getProductPrice(product) {
  return (
    product.price ||
    product.minPrice ||
    product.variants?.[0]?.price ||
    product.productVariants?.[0]?.price ||
    0
  );
}

function getProductStock(product) {
  return (
    product.stock ||
    product.totalStock ||
    product.variants?.[0]?.stock ||
    product.productVariants?.[0]?.stock ||
    0
  );
}

function ProductCard({ product }) {
  const imageUrl = getProductImage(product);
  const price = getProductPrice(product);
  const stock = getProductStock(product);

  const isActive = product.active !== false;
  const isOutOfStock = Number(stock) <= 0;

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
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-image-wrap">
        <img
          src={imageUrl}
          alt={product.name || "Product image"}
          className="product-card-image"
        />

        <span
          className={
            isActive && !isOutOfStock
              ? "product-card-badge success"
              : "product-card-badge warning"
          }
        >
          {isActive && !isOutOfStock ? "Đang bán" : "Tạm hết"}
        </span>
      </Link>

      <div className="product-card-body">
        <p className="product-card-category">
          {product.categoryName || product.category?.name || "Sản phẩm"}
        </p>

        <h2 className="product-card-title">
          <Link to={`/products/${product.id}`}>
            {product.name || "Sản phẩm không tên"}
          </Link>
        </h2>

        <p className="product-card-description">
          {product.description || "Sản phẩm chưa có mô tả."}
        </p>

        <div className="product-card-meta">
          <p className="product-card-price">{formatCurrency(price)}</p>

          <p className="product-card-stock">
            Tồn kho: <strong>{stock}</strong>
          </p>
        </div>

        <div className="product-card-actions">
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
      </div>
    </article>
  );
}

export default ProductCard;
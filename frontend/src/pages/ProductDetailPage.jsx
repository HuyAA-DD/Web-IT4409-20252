import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import cartApi from "../api/cartApi";
import productApi from "../api/productApi";
import { formatCurrency } from "../utils/formatCurrency";

const mockProduct = {
  id: 1,
  name: "Sản phẩm mẫu",
  description:
    "Đây là dữ liệu mẫu dùng để test giao diện ProductDetailPage khi backend chưa chạy hoặc API chưa đúng format.",
  price: 120000,
  stock: 20,
  active: true,
  status: "ACTIVE",
  imageUrl: "https://via.placeholder.com/600x400?text=Product+Detail",
  categoryName: "Danh mục mẫu",
  sellerName: "Người bán mẫu",
};

function normalizeProductResponse(response) {
  if (!response) {
    return null;
  }

  if (response.id || response.name) {
    return response;
  }

  if (response.data?.id || response.data?.name) {
    return response.data;
  }

  if (response.product?.id || response.product?.name) {
    return response.product;
  }

  if (response.data?.product?.id || response.data?.product?.name) {
    return response.data.product;
  }

  return null;
}

function getProductImage(product) {
  return (
    product.imageUrl ||
    product.thumbnail ||
    product.images?.[0]?.imageUrl ||
    product.productImages?.[0]?.imageUrl ||
    "https://via.placeholder.com/600x400?text=No+Image"
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

function ProductDetailPage() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchProductDetail() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await productApi.getProductById(id);
        const productData = normalizeProductResponse(response);

        if (productData) {
          setProduct(productData);
        } else {
          setProduct({
            ...mockProduct,
            id: Number(id),
          });

          setErrorMessage(
            "Backend trả về dữ liệu chưa đúng format. Đang hiển thị sản phẩm mẫu."
          );
        }
      } catch (error) {
        setProduct({
          ...mockProduct,
          id: Number(id),
        });

        setErrorMessage(
          "Chưa gọi được API chi tiết sản phẩm. Đang hiển thị dữ liệu mẫu."
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchProductDetail();
  }, [id]);

  const handleDecreaseQuantity = () => {
    setSelectedQuantity((current) => Math.max(1, current - 1));
  };

  const handleIncreaseQuantity = () => {
    const stock = getProductStock(product);

    setSelectedQuantity((current) => {
      if (stock > 0) {
        return Math.min(stock, current + 1);
      }

      return current + 1;
    });
  };

  const handleAddToCart = async () => {
    const productId = Number(product?.id);

    if (!productId || Number.isNaN(productId)) {
      toast.error("Không tìm thấy productId hợp lệ để thêm vào giỏ hàng");
      return;
    }

    if (selectedQuantity < 1) {
      toast.error("Số lượng phải lớn hơn hoặc bằng 1");
      return;
    }

    try {
      setIsAddingToCart(true);

      await cartApi.addToCart({
        productId: productId,
        quantity: selectedQuantity,
      });

      toast.success("Đã thêm sản phẩm vào giỏ hàng");
    } catch (error) {
      const status = error.response?.status;

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.errors?.productId ||
        error.response?.data?.errors?.quantity ||
        "Thêm vào giỏ hàng thất bại";

      if (status === 401 || status === 403) {
        toast.error("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng");
      } else {
        toast.error(message);
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container page">
        <div className="placeholder-box">Đang tải chi tiết sản phẩm...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container page">
        <div className="placeholder-box">Không tìm thấy sản phẩm.</div>

        <Link
          to="/products"
          className="btn btn-primary"
          style={{ marginTop: 16 }}
        >
          Quay lại danh sách sản phẩm
        </Link>
      </div>
    );
  }

  const imageUrl = getProductImage(product);
  const price = getProductPrice(product);
  const stock = getProductStock(product);

  return (
    <div className="container page">
      <Link to="/products" className="btn btn-outline">
        ← Quay lại danh sách
      </Link>

      {errorMessage && (
        <div
          className="placeholder-box"
          style={{
            marginTop: "24px",
            marginBottom: "24px",
            color: "#92400e",
            background: "#fffbeb",
            borderColor: "#fbbf24",
          }}
        >
          {errorMessage}
        </div>
      )}

      <section className="product-detail-card">
        <div>
          <img
            src={imageUrl}
            alt={product.name || "Product image"}
            className="product-detail-image"
          />
        </div>

        <div>
          <p className="product-category">
            {product.categoryName ||
              product.category?.name ||
              "Chưa có danh mục"}
          </p>

          <h1 className="product-detail-title">
            {product.name || "Không có tên sản phẩm"}
          </h1>

          <p className="product-detail-price">{formatCurrency(price)}</p>

          <p className="product-detail-description">
            {product.description || "Sản phẩm chưa có mô tả."}
          </p>

          <div className="product-meta">
            <div>
              <strong>ID sản phẩm:</strong> {product.id}
            </div>

            <div>
              <strong>Trạng thái:</strong>{" "}
              {product.active === false
                ? "Không hoạt động"
                : product.status || "Đang hoạt động"}
            </div>

            <div>
              <strong>Tồn kho:</strong> {stock}
            </div>

            <div>
              <strong>Người bán:</strong>{" "}
              {product.sellerName ||
                product.seller?.fullName ||
                product.seller?.email ||
                "Chưa cập nhật"}
            </div>
          </div>

          <div className="quantity-section">
            <p>Số lượng</p>

            <div className="quantity-control">
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleDecreaseQuantity}
                disabled={selectedQuantity <= 1}
              >
                -
              </button>

              <span>{selectedQuantity}</span>

              <button
                type="button"
                className="btn btn-outline"
                onClick={handleIncreaseQuantity}
                disabled={stock > 0 && selectedQuantity >= stock}
              >
                +
              </button>
            </div>
          </div>

          <div className="product-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? "Đang thêm..." : "Thêm vào giỏ hàng"}
            </button>

            <button type="button" className="btn btn-outline">
              Thêm vào yêu thích
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProductDetailPage;
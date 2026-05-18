import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import productApi from "../api/productApi";
import { formatCurrency } from "../utils/formatCurrency";

const mockProduct = {
  id: "mock-1",
  name: "Sản phẩm mẫu",
  description:
    "Đây là dữ liệu mẫu dùng để test giao diện ProductDetailPage khi backend chưa chạy hoặc API chưa đúng format.",
  price: 120000,
  stock: 20,
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
            id,
          });
          setErrorMessage(
            "Backend trả về dữ liệu chưa đúng format. Đang hiển thị sản phẩm mẫu."
          );
        }
      } catch (error) {
        setProduct({
          ...mockProduct,
          id,
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

        <Link to="/products" className="btn btn-primary" style={{ marginTop: 16 }}>
          Quay lại danh sách sản phẩm
        </Link>
      </div>
    );
  }

  const imageUrl = getProductImage(product);
  const price = getProductPrice(product);
  const stock = getProductStock(product);

  const handleDecreaseQuantity = () => {
    setSelectedQuantity((current) => Math.max(1, current - 1));
  };

  const handleIncreaseQuantity = () => {
    setSelectedQuantity((current) => {
      if (stock > 0) {
        return Math.min(stock, current + 1);
      }

      return current + 1;
    });
  };

  const handleAddToCart = () => {
    alert(
      `Tạm thời chưa code giỏ hàng. Sản phẩm: ${product.name}, số lượng: ${selectedQuantity}`
    );
  };

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

      <section
        className="info-card"
        style={{
          marginTop: "24px",
          display: "grid",
          gridTemplateColumns: "minmax(280px, 1fr) minmax(280px, 1fr)",
          gap: "32px",
          alignItems: "start",
        }}
      >
        <div>
          <img
            src={imageUrl}
            alt={product.name || "Product image"}
            style={{
              width: "100%",
              height: "420px",
              objectFit: "cover",
              borderRadius: "18px",
              background: "#f3f4f6",
            }}
          />
        </div>

        <div>
          <p
            style={{
              color: "#2563eb",
              fontWeight: 700,
              margin: "0 0 10px",
            }}
          >
            {product.categoryName ||
              product.category?.name ||
              "Chưa có danh mục"}
          </p>

          <h1
            style={{
              margin: "0 0 16px",
              fontSize: "36px",
              lineHeight: 1.2,
            }}
          >
            {product.name || "Không có tên sản phẩm"}
          </h1>

          <p
            style={{
              color: "#2563eb",
              fontWeight: 800,
              fontSize: "28px",
              margin: "0 0 20px",
            }}
          >
            {formatCurrency(price)}
          </p>

          <p
            style={{
              color: "#4b5563",
              lineHeight: 1.7,
              marginBottom: "24px",
            }}
          >
            {product.description || "Sản phẩm chưa có mô tả."}
          </p>

          <div
            style={{
              display: "grid",
              gap: "12px",
              marginBottom: "24px",
              color: "#374151",
            }}
          >
            <div>
              <strong>Trạng thái:</strong>{" "}
              {product.status || "Chưa cập nhật"}
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

          <div style={{ marginBottom: "24px" }}>
            <p style={{ fontWeight: 700, marginBottom: "10px" }}>Số lượng</p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <button
                type="button"
                className="btn btn-outline"
                onClick={handleDecreaseQuantity}
              >
                -
              </button>

              <span
                style={{
                  minWidth: "48px",
                  textAlign: "center",
                  fontWeight: 700,
                  fontSize: "18px",
                }}
              >
                {selectedQuantity}
              </span>

              <button
                type="button"
                className="btn btn-outline"
                onClick={handleIncreaseQuantity}
              >
                +
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAddToCart}
            >
              Thêm vào giỏ hàng
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
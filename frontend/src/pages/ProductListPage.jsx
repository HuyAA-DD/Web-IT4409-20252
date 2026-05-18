import { useEffect, useState } from "react";

import productApi from "../api/productApi";
import ProductCard from "../components/product/ProductCard";

const mockProducts = [
  {
    id: "mock-1",
    name: "Áo thun basic",
    description: "Sản phẩm mẫu dùng khi backend chưa chạy.",
    price: 120000,
    imageUrl: "https://via.placeholder.com/400x300?text=Product+1",
  },
  {
    id: "mock-2",
    name: "Giày sneaker",
    description: "Dữ liệu tạm để test giao diện ProductListPage.",
    price: 450000,
    imageUrl: "https://via.placeholder.com/400x300?text=Product+2",
  },
  {
    id: "mock-3",
    name: "Balo thời trang",
    description: "Sau này dữ liệu sẽ được lấy từ backend Spring Boot.",
    price: 320000,
    imageUrl: "https://via.placeholder.com/400x300?text=Product+3",
  },
];

function normalizeProductResponse(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  if (Array.isArray(response?.data?.content)) {
    return response.data.content;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  return [];
}

function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await productApi.getProducts();
        const productList = normalizeProductResponse(response);

        if (productList.length > 0) {
          setProducts(productList);
        } else {
          setProducts(mockProducts);
          setErrorMessage(
            "Backend trả về rỗng hoặc chưa đúng format, đang hiển thị dữ liệu mẫu."
          );
        }
      } catch (error) {
        setProducts(mockProducts);
        setErrorMessage(
          "Chưa gọi được API sản phẩm. Đang hiển thị dữ liệu mẫu để test giao diện."
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const name = product.name || "";
    return name.toLowerCase().includes(keyword.toLowerCase());
  });

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Danh sách sản phẩm</h1>
        <p>
          Trang này dùng để hiển thị sản phẩm từ backend. Nếu backend chưa chạy,
          hệ thống sẽ tạm hiển thị dữ liệu mẫu.
        </p>
      </div>

      <div
        className="info-card"
        style={{
          marginBottom: "24px",
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          style={{
            flex: "1",
            minWidth: "240px",
            padding: "12px 14px",
            borderRadius: "10px",
            border: "1px solid #d1d5db",
          }}
        />

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setKeyword("")}
        >
          Xóa tìm kiếm
        </button>
      </div>

      {isLoading && <div className="placeholder-box">Đang tải sản phẩm...</div>}

      {!isLoading && errorMessage && (
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

      {!isLoading && filteredProducts.length === 0 && (
        <div className="placeholder-box">Không tìm thấy sản phẩm phù hợp.</div>
      )}

      {!isLoading && filteredProducts.length > 0 && (
        <section className="section-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      )}
    </div>
  );
}

export default ProductListPage;
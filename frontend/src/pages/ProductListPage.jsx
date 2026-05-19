import { useEffect, useMemo, useState } from "react";

import productApi from "../api/productApi";
import ProductCard from "../components/product/ProductCard";

const mockProducts = [
  {
    id: "mock-1",
    name: "Áo thun basic",
    description: "Sản phẩm mẫu dùng khi backend chưa chạy.",
    price: 120000,
    stock: 20,
    active: true,
    imageUrl: "https://via.placeholder.com/400x300?text=Product+1",
  },
  {
    id: "mock-2",
    name: "Giày sneaker",
    description: "Dữ liệu tạm để test giao diện ProductListPage.",
    price: 450000,
    stock: 12,
    active: true,
    imageUrl: "https://via.placeholder.com/400x300?text=Product+2",
  },
  {
    id: "mock-3",
    name: "Balo thời trang",
    description: "Sau này dữ liệu sẽ được lấy từ backend Spring Boot.",
    price: 320000,
    stock: 5,
    active: true,
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

  const filteredProducts = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) {
      return products;
    }

    return products.filter((product) => {
      const name = product.name || "";
      const description = product.description || "";
      const categoryName = product.categoryName || product.category?.name || "";

      return (
        name.toLowerCase().includes(normalizedKeyword) ||
        description.toLowerCase().includes(normalizedKeyword) ||
        categoryName.toLowerCase().includes(normalizedKeyword)
      );
    });
  }, [products, keyword]);

  const activeCount = products.filter((product) => product.active !== false).length;
  const outOfStockCount = products.filter((product) => Number(product.stock || 0) <= 0)
    .length;

  return (
    <div className="container page product-list-page">
      <section className="product-list-hero">
        <div>
          <p className="home-badge">Product Catalog</p>

          <h1>Danh sách sản phẩm</h1>

          <p>
            Khám phá các sản phẩm hiện có trong hệ thống, tìm kiếm theo tên,
            mô tả hoặc danh mục sản phẩm.
          </p>
        </div>

        <div className="product-list-stats">
          <div>
            <strong>{products.length}</strong>
            <span>Tổng sản phẩm</span>
          </div>

          <div>
            <strong>{activeCount}</strong>
            <span>Đang bán</span>
          </div>

          <div>
            <strong>{outOfStockCount}</strong>
            <span>Hết hàng</span>
          </div>
        </div>
      </section>

      <section className="product-toolbar">
        <div className="product-search-box">
          <span>🔎</span>

          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        </div>

        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setKeyword("")}
          disabled={!keyword}
        >
          Xóa tìm kiếm
        </button>
      </section>

      {!isLoading && (
        <p className="product-result-text">
          Đang hiển thị <strong>{filteredProducts.length}</strong> /{" "}
          <strong>{products.length}</strong> sản phẩm
        </p>
      )}

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
        <div className="info-card">
          <h2>Không tìm thấy sản phẩm</h2>
          <p style={{ color: "#4b5563" }}>
            Thử nhập từ khóa khác hoặc xóa bộ lọc tìm kiếm hiện tại.
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setKeyword("")}
          >
            Xóa tìm kiếm
          </button>
        </div>
      )}

      {!isLoading && filteredProducts.length > 0 && (
        <section className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </section>
      )}
    </div>
  );
}

export default ProductListPage;
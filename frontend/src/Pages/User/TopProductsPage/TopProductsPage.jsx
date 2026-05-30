import React, { useEffect, useMemo, useState } from "react";
import { Button, Empty, Progress, Spin, Tag, message } from "antd";
import {
  EyeOutlined,
  FireFilled,
  ReloadOutlined,
  ShoppingCartOutlined,
  StarFilled,
  TrophyFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import api from "../../../Apis/apiConfig";
import API_ENDPOINTS from "../../../Apis/apiEndpoints";
import { getAuthUserId } from "../../../Utils/Auth";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value || 0));
};

const unwrapApiData = (payload) => {
  if (payload?.data !== undefined) return payload.data;
  return payload;
};

const createFallbackImage = (name = "Product") => {
  const text = String(name || "Product").slice(0, 18);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="420" height="420" viewBox="0 0 420 420">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#fb923c"/>
          <stop offset="100%" stop-color="#f97316"/>
        </linearGradient>
      </defs>
      <rect width="420" height="420" rx="36" fill="url(#g)"/>
      <circle cx="210" cy="170" r="70" fill="rgba(255,255,255,0.2)"/>
      <text x="210" y="280" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="white">${text}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const getProductImage = (product) => {
  if (Array.isArray(product?.imageUrls) && product.imageUrls.length > 0) {
    return product.imageUrls[0];
  }

  return createFallbackImage(product?.name);
};

const getBestVariant = (product) => {
  const variants = Array.isArray(product?.variants) ? product.variants : [];

  if (variants.length === 0) return null;

  const inStockVariant = variants.find((variant) => Number(variant.stock || 0) > 0);

  return inStockVariant || variants[0];
};

const getMinPrice = (product) => {
  const variants = Array.isArray(product?.variants) ? product.variants : [];

  if (variants.length === 0) return 0;

  const prices = variants
    .map((variant) => Number(variant.price || 0))
    .filter((price) => price > 0);

  if (prices.length === 0) return 0;

  return Math.min(...prices);
};

const getTotalStock = (product) => {
  const variants = Array.isArray(product?.variants) ? product.variants : [];

  return variants.reduce((sum, variant) => {
    return sum + Number(variant.stock || 0);
  }, 0);
};

const getRankStyle = (rank) => {
  switch (rank) {
    case 1:
      return {
        border: "border-yellow-400 dark:border-yellow-500",
        gradient:
          "from-yellow-400 to-orange-500 dark:from-yellow-500 dark:to-orange-600",
        glow:
          "shadow-[0_0_15px_rgba(250,204,21,0.4)] dark:shadow-[0_0_20px_rgba(234,88,12,0.3)]",
      };
    case 2:
      return {
        border: "border-gray-300 dark:border-slate-500",
        gradient:
          "from-gray-300 to-gray-500 dark:from-slate-500 dark:to-slate-700",
        glow: "shadow-lg dark:shadow-none",
      };
    case 3:
      return {
        border: "border-amber-600 dark:border-amber-700",
        gradient:
          "from-amber-500 to-amber-700 dark:from-amber-600 dark:to-amber-800",
        glow: "shadow-lg dark:shadow-none",
      };
    default:
      return {
        border: "border-gray-200 dark:border-slate-700",
        gradient: "bg-gray-500 dark:bg-slate-600",
        glow: "shadow-sm",
      };
  }
};

const getBadgeByRank = (rank) => {
  if (rank === 1) return "HOT NHẤT";
  if (rank === 2) return "BÁN CHẠY";
  if (rank === 3) return "XU HƯỚNG";
  if (rank <= 6) return "NỔI BẬT";
  return null;
};

const normalizeProduct = (product, index) => {
  const variant = getBestVariant(product);
  const price = getMinPrice(product);
  const totalStock = getTotalStock(product);
  const rank = index + 1;

  const soldPercent = Math.min(
    98,
    Math.max(35, 100 - Math.min(totalStock, 100))
  );

  return {
    id: product.id,
    rank,
    title: product.name || "Sản phẩm chưa có tên",
    description: product.description || "Sản phẩm đang được cập nhật mô tả.",
    categoryId: product.categoryId || "unknown",
    category: product.categoryName || "Chưa phân loại",
    sellerName: product.sellerName || "Shop",
    status: product.status,
    image: getProductImage(product),
    variantId: variant?.id || null,
    sku: variant?.sku || "N/A",
    stock: totalStock,
    price,
    originalPrice: price > 0 ? Math.round(price * 1.12) : 0,
    rating: 4.5 + (rank % 5) * 0.1,
    sold: Math.max(12, 140 - rank * 9),
    views: Math.max(200, 2500 - rank * 130),
    soldPercent,
    badge: getBadgeByRank(rank),
    createdAt: product.createdAt,
  };
};

const TopProductsPage = () => {
  const navigate = useNavigate();
  const userId = getAuthUserId();

  const [timeFilter, setTimeFilter] = useState("week");
  const [activeCategory, setActiveCategory] = useState("all");
  const [rawProducts, setRawProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingProductId, setAddingProductId] = useState(null);

  const productEndpoint = API_ENDPOINTS.products || API_ENDPOINTS.product;
  const cartEndpoint = API_ENDPOINTS.cart;

  const fetchProducts = async () => {
    setLoading(true);

    try {
      const response = await api.get(productEndpoint.list);
      const data = unwrapApiData(response);

      const products = Array.isArray(data) ? data : [];

      setRawProducts(products);
    } catch (error) {
      console.error("Failed to load top products:", error);
      message.error("Không thể tải danh sách sản phẩm nổi bật.");
      setRawProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = useMemo(() => {
    const map = new Map();

    rawProducts.forEach((product) => {
      if (!product?.categoryId && !product?.categoryName) return;

      const id = product.categoryId || product.categoryName;
      const name = product.categoryName || "Chưa phân loại";

      map.set(String(id), {
        id: String(id),
        name,
      });
    });

    return [
      {
        id: "all",
        name: "Tất cả ngành hàng",
      },
      ...Array.from(map.values()),
    ];
  }, [rawProducts]);

  const normalizedProducts = useMemo(() => {
    const activeProducts = rawProducts.filter((product) => {
      if (!product) return false;

      if (product.status && product.status !== "ACTIVE") {
        return false;
      }

      return true;
    });

    const filteredByCategory =
      activeCategory === "all"
        ? activeProducts
        : activeProducts.filter((product) => {
            const categoryId = String(product.categoryId || product.categoryName);
            return categoryId === String(activeCategory);
          });

    const sortedProducts = [...filteredByCategory].sort((a, b) => {
      const stockA = getTotalStock(a);
      const stockB = getTotalStock(b);
      const priceA = getMinPrice(a);
      const priceB = getMinPrice(b);

      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();

      if (timeFilter === "week") {
        return dateB - dateA || stockB - stockA || priceB - priceA;
      }

      return stockB - stockA || priceB - priceA || dateB - dateA;
    });

    return sortedProducts.slice(0, 12).map(normalizeProduct);
  }, [rawProducts, activeCategory, timeFilter]);

  const topFeatured = normalizedProducts.slice(0, 3);
  const listProducts = normalizedProducts.slice(3);

  const handleViewDetail = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleAddToCart = async (product) => {
    if (!userId) {
      message.warning("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      navigate("/auth/login-register");
      return;
    }

    if (!product?.variantId) {
      message.warning("Sản phẩm này chưa có biến thể để thêm vào giỏ hàng.");
      return;
    }

    if (Number(product.stock || 0) <= 0) {
      message.warning("Sản phẩm này hiện đã hết hàng.");
      return;
    }

    setAddingProductId(product.id);

    try {
      await api.post(cartEndpoint.items(userId), {
        productVariantId: product.variantId,
        quantity: 1,
      });

      message.success("Đã thêm sản phẩm vào giỏ hàng.");
    } catch (error) {
      console.error("Lỗi thêm sản phẩm vào giỏ hàng:", error);

      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Không thể thêm sản phẩm vào giỏ hàng.";

      message.error(backendMessage);
    } finally {
      setAddingProductId(null);
    }
  };

  const handleBuyNow = async (product) => {
    await handleAddToCart(product);

    if (userId && product?.variantId && Number(product.stock || 0) > 0) {
      navigate("/cart");
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 pb-10 pt-24 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 md:px-8 md:pt-28">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-8 text-white shadow-sm md:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <TrophyFilled className="text-3xl" />

                <h1 className="m-0 text-3xl font-black md:text-4xl">
                  Sản phẩm nổi bật
                </h1>
              </div>

              <p className="m-0 max-w-2xl text-sm text-white/90 md:text-base">
                Hiển thị sản phẩm thật từ database, sắp xếp theo độ nổi bật tạm
                thời dựa trên sản phẩm mới, tồn kho và giá bán.
              </p>
            </div>

            <Button
              icon={<ReloadOutlined />}
              loading={loading}
              onClick={fetchProducts}
              className="!h-11 !rounded-xl !border-white !bg-white/95 !font-bold !text-orange-600 hover:!bg-white"
            >
              Làm mới
            </Button>
          </div>
        </section>

        <section className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex w-fit rounded-2xl bg-gray-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setTimeFilter("week")}
              className={`rounded-xl px-6 py-2 text-sm font-bold transition-all ${
                timeFilter === "week"
                  ? "bg-white text-orange-600 shadow-sm dark:bg-slate-700 dark:text-orange-400"
                  : "text-gray-500 hover:text-orange-600 dark:text-gray-400"
              }`}
            >
              Theo tuần
            </button>

            <button
              type="button"
              onClick={() => setTimeFilter("month")}
              className={`rounded-xl px-6 py-2 text-sm font-bold transition-all ${
                timeFilter === "month"
                  ? "bg-white text-orange-600 shadow-sm dark:bg-slate-700 dark:text-orange-400"
                  : "text-gray-500 hover:text-orange-600 dark:text-gray-400"
              }`}
            >
              Theo tháng
            </button>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                  activeCategory === category.id
                    ? "bg-orange-600 text-white shadow-md"
                    : "border border-gray-200 bg-white text-gray-500 hover:border-orange-600 hover:text-orange-600 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-400 dark:hover:border-orange-500 dark:hover:text-orange-400"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="flex min-h-[420px] items-center justify-center rounded-3xl bg-white shadow-sm dark:bg-slate-900">
            <Spin size="large" tip="Đang tải sản phẩm nổi bật..." />
          </div>
        ) : normalizedProducts.length === 0 ? (
          <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm dark:bg-slate-900">
            <Empty description="Chưa có sản phẩm phù hợp." />

            <Button
              type="primary"
              className="mt-5 !rounded-xl !bg-orange-500 hover:!bg-orange-600"
              onClick={() => navigate("/supermarket")}
            >
              Quay lại siêu thị
            </Button>
          </div>
        ) : (
          <>
            <section className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {topFeatured.map((item) => {
                const style = getRankStyle(item.rank);

                return (
                  <article
                    key={item.id}
                    className={`relative overflow-hidden rounded-3xl border-2 bg-white p-5 transition hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900 ${style.border} ${style.glow}`}
                  >
                    <div
                      className={`absolute right-4 top-4 rounded-full bg-gradient-to-r px-4 py-2 text-xs font-black text-white ${style.gradient}`}
                    >
                      RANK {item.rank}
                    </div>

                    <div className="mb-5 mt-8 overflow-hidden rounded-3xl bg-orange-50 dark:bg-slate-800">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-64 w-full object-cover transition duration-300 hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.src = createFallbackImage(item.title);
                        }}
                      />
                    </div>

                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      {item.badge && (
                        <Tag color="orange" className="rounded-full px-3 py-1">
                          <FireFilled /> {item.badge}
                        </Tag>
                      )}

                      <Tag className="rounded-full px-3 py-1">
                        {item.category}
                      </Tag>
                    </div>

                    <h3 className="mb-2 line-clamp-2 text-xl font-black text-gray-900 dark:text-white">
                      {item.title}
                    </h3>

                    <p className="mb-4 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                      {item.description}
                    </p>

                    <div className="mb-3 flex items-end gap-2">
                      <span className="text-2xl font-black text-orange-600">
                        {formatCurrency(item.price)}
                      </span>

                      {item.originalPrice > item.price && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatCurrency(item.originalPrice)}
                        </span>
                      )}
                    </div>

                    <div className="mb-5 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>
                        <StarFilled className="mr-1 text-yellow-400" />
                        {item.rating.toFixed(1)}
                      </span>

                      <span>{item.sold} đã bán</span>

                      <span>Còn {item.stock}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetail(item.id)}
                        className="!h-11 !rounded-xl !font-bold"
                      >
                        Chi tiết
                      </Button>

                      <Button
                        type="primary"
                        icon={<ShoppingCartOutlined />}
                        loading={addingProductId === item.id}
                        onClick={() =>
                          item.rank === 1 ? handleBuyNow(item) : handleAddToCart(item)
                        }
                        className="!h-11 !rounded-xl !bg-orange-500 !font-bold hover:!bg-orange-600"
                      >
                        {item.rank === 1 ? "Mua ngay" : "Thêm"}
                      </Button>
                    </div>
                  </article>
                );
              })}
            </section>

            <section className="rounded-3xl bg-white p-5 shadow-sm dark:bg-slate-900 md:p-6">
              <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="m-0 text-2xl font-black text-gray-900 dark:text-white">
                    Danh sách sản phẩm thịnh hành
                  </h2>

                  <p className="m-0 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Các sản phẩm còn lại trong bảng xếp hạng hiện tại.
                  </p>
                </div>

                <Button
                  onClick={() => navigate("/supermarket")}
                  className="!rounded-xl !font-bold"
                >
                  Xem tất cả sản phẩm
                </Button>
              </div>

              {listProducts.length === 0 ? (
                <Empty description="Chưa có thêm sản phẩm trong danh sách." />
              ) : (
                <div className="space-y-4">
                  {listProducts.map((item) => (
                    <article
                      key={item.id}
                      className="grid grid-cols-1 gap-4 rounded-3xl border border-gray-100 bg-white p-4 transition hover:border-orange-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 md:grid-cols-[80px_120px_minmax(0,1fr)_260px]"
                    >
                      <div className="flex items-center justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-2xl font-black text-orange-600 dark:bg-slate-800">
                          {item.rank}
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-2xl bg-orange-50 dark:bg-slate-800">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-28 w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.src = createFallbackImage(item.title);
                          }}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <Tag color="orange">{item.category}</Tag>
                          <Tag>{item.sellerName}</Tag>
                          <Tag>SKU: {item.sku}</Tag>
                        </div>

                        <h3 className="mb-1 line-clamp-1 text-lg font-black text-gray-900 dark:text-white">
                          {item.title}
                        </h3>

                        <p className="mb-3 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                          {item.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>
                            <StarFilled className="mr-1 text-yellow-400" />
                            {item.rating.toFixed(1)}
                          </span>

                          <span>
                            <EyeOutlined className="mr-1" />
                            {item.views} lượt xem
                          </span>

                          <span>Còn {item.stock} sản phẩm</span>
                        </div>
                      </div>

                      <div className="flex flex-col justify-between gap-3">
                        <div>
                          <div className="mb-1 text-right text-xl font-black text-orange-600">
                            {formatCurrency(item.price)}
                          </div>

                          <Progress
                            percent={item.soldPercent}
                            showInfo={false}
                            strokeColor="#f97316"
                          />

                          <div className="mt-1 text-right text-xs font-bold text-orange-600">
                            {item.soldPercent}% ĐÃ BÁN
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetail(item.id)}
                            className="!rounded-xl !font-bold"
                          >
                            Xem
                          </Button>

                          <Button
                            type="primary"
                            icon={<ShoppingCartOutlined />}
                            loading={addingProductId === item.id}
                            onClick={() => handleAddToCart(item)}
                            className="!rounded-xl !bg-orange-500 !font-bold hover:!bg-orange-600"
                          >
                            Thêm
                          </Button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default TopProductsPage;
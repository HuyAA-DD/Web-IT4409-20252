import React, { useEffect, useMemo, useState } from "react";
import { Button, Empty, Spin, Tag, message, Carousel } from "antd";
import {
  EyeOutlined,
  FireFilled,
  ReloadOutlined,
  ShoppingCartOutlined,
  StarFilled,
  TrophyFilled,
  AppstoreOutlined,
  LayoutTwoTone
} from "@ant-design/icons";
import { useNavigate, useOutletContext } from "react-router-dom";

import api from "../../../Apis/apiConfig";
import API_ENDPOINTS from "../../../Apis/apiEndpoints";
import { getAuthUserId } from "../../../Utils/Auth";
import { notifyCartChanged } from "../../../Utils/CartEvents";

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

const getReviewSummary = (reviews = []) => {
  if (!Array.isArray(reviews) || reviews.length === 0) {
    return {
      averageRating: 0,
      reviewCount: 0,
    };
  }

  const totalRating = reviews.reduce((sum, review) => {
    return sum + Number(review?.rating || 0);
  }, 0);

  return {
    averageRating: Number((totalRating / reviews.length).toFixed(1)),
    reviewCount: reviews.length,
  };
};

const getRatingText = (product) => {
  if (Number(product?.reviewCount || 0) <= 0) {
    return "Chưa có đánh giá";
  }

  return `${Number(product?.rating || 0).toFixed(1)} (${product.reviewCount})`;
};

const getBadgeByRank = (rank) => {
  if (rank === 1) return "HOT NHẤT";
  if (rank === 2) return "BÁN CHẠY";
  if (rank === 3) return "XU HƯỚNG";
  if (rank <= 6) return "NỔI BẬT";
  return null;
};

const normalizeProduct = (product, index, reviewSummaries = {}, salesSummaries = {}) => {
  const variant = getBestVariant(product);
  const price = getMinPrice(product);
  const totalStock = getTotalStock(product);
  const rank = index + 1;
  const reviewSummary = reviewSummaries[product.id] || {
    averageRating: 0,
    reviewCount: 0,
  };
  const sold = Number(salesSummaries[product.id]?.totalSales || 0);

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
    rating: reviewSummary.averageRating,
    reviewCount: reviewSummary.reviewCount,
    sold,
    badge: getBadgeByRank(rank),
    createdAt: product.createdAt,
  };
};

const TopProductsPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useOutletContext();
  const userId = getAuthUserId();

  const [activeCategory, setActiveCategory] = useState("all");
  const [rawProducts, setRawProducts] = useState([]);
  const [reviewSummaries, setReviewSummaries] = useState({});
  const [salesSummaries, setSalesSummaries] = useState({});
  const [loading, setLoading] = useState(false);
  const [addingProductId, setAddingProductId] = useState(null);

  const productEndpoint = API_ENDPOINTS.products || API_ENDPOINTS.product;
  const reviewEndpoint = API_ENDPOINTS.reviews || API_ENDPOINTS.review;
  const cartEndpoint = API_ENDPOINTS.cart;

  const fetchSalesSummaries = async () => {
    if (!productEndpoint?.topProducts) return;

    try {
      const response = await api.get(productEndpoint.topProducts, {
        limit: 1000,
      });
      const topProducts = unwrapApiData(response);
      const summaries = Array.isArray(topProducts) ? topProducts : [];

      setSalesSummaries(
        Object.fromEntries(
          summaries
            .filter((product) => product?.productId)
            .map((product) => [
              product.productId,
              {
                totalSales: Number(product.totalSales || product.soldCount || 0),
                totalRevenue: Number(product.totalRevenue || 0),
              },
            ])
        )
      );
    } catch (error) {
      console.error("Failed to load product sales summaries:", error);
      setSalesSummaries({});
    }
  };

  const fetchReviewSummaries = async (productList) => {
    if (!reviewEndpoint?.byProduct) return;

    const productIds = productList
      .map((product) => product?.id)
      .filter(Boolean);

    if (productIds.length === 0) {
      setReviewSummaries({});
      return;
    }

    try {
      const entries = await Promise.all(
        productIds.map(async (productId) => {
          try {
            const response = await api.get(reviewEndpoint.byProduct(productId));
            const reviews = unwrapApiData(response);

            return [productId, getReviewSummary(reviews)];
          } catch (error) {
            console.error("Failed to load product reviews:", productId, error);
            return [
              productId,
              {
                averageRating: 0,
                reviewCount: 0,
              },
            ];
          }
        })
      );

      setReviewSummaries(Object.fromEntries(entries));
    } catch (error) {
      console.error("Failed to load product review summaries:", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);

    try {
      const response = await api.get(productEndpoint.list);
      const data = unwrapApiData(response);

      const products = Array.isArray(data) ? data : [];

      setRawProducts(products);
      await Promise.all([
        fetchReviewSummaries(products),
        fetchSalesSummaries(),
      ]);
    } catch (error) {
      console.error("Failed to load top products:", error);
      message.error("Không thể tải danh sách sản phẩm nổi bật.");
      setRawProducts([]);
      setReviewSummaries({});
      setSalesSummaries({});
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
      const salesA = Number(salesSummaries[a.id]?.totalSales || 0);
      const salesB = Number(salesSummaries[b.id]?.totalSales || 0);
      const ratingA = Number(reviewSummaries[a.id]?.averageRating || 0);
      const ratingB = Number(reviewSummaries[b.id]?.averageRating || 0);
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();

      return salesB - salesA || ratingB - ratingA || dateB - dateA;
    });

    return sortedProducts
      .slice(0, 15)
      .map((product, index) =>
        normalizeProduct(product, index, reviewSummaries, salesSummaries)
      );
  }, [rawProducts, activeCategory, reviewSummaries, salesSummaries]);

  const topFeatured = normalizedProducts.slice(0, 3);
  const listProducts = normalizedProducts.slice(3);

  const handleViewDetail = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleAddToCart = async (event, product) => {
    event.stopPropagation();
    
    if (!userId) {
      message.warning("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      navigate("/auth/login-register");
      return false;
    }

    if (!product?.variantId) {
      message.warning("Sản phẩm này chưa có biến thể để thêm vào giỏ hàng.");
      return false;
    }

    if (Number(product.stock || 0) <= 0) {
      message.warning("Sản phẩm này hiện đã hết hàng.");
      return false;
    }

    setAddingProductId(product.id);

    try {
      const response = await api.post(cartEndpoint.items(userId), {
        productVariantId: product.variantId,
        quantity: 1,
      });
      notifyCartChanged(response);

      message.success("Đã thêm sản phẩm vào giỏ hàng.");
      return true;
    } catch (error) {
      console.error("Lỗi thêm sản phẩm vào giỏ hàng:", error);

      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Không thể thêm sản phẩm vào giỏ hàng.";

      message.error(backendMessage);
      return false;
    } finally {
      setAddingProductId(null);
    }
  };

  const banners = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1920",
      badge: "Bảng Xếp Hạng",
      title: "Sản Phẩm Đỉnh Cao",
      subtitle: "Khám phá những mặt hàng được săn đón nhiều nhất tuần qua.",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1920",
      badge: "Xu Hướng",
      title: "Phong Cách Dẫn Đầu",
      subtitle: "Bộ sưu tập mang đậm cá tính và chất lượng không thể chối từ.",
    }
  ];

  return (
    <div className={`min-h-[calc(100vh-80px)] px-2 sm:px-4 py-8 md:px-8 bg-transparent`}>
      <div className="mx-auto w-full">
        
        {/* COMPONENT: BANNER ĐỘNG TRÀN VIỀN */}
        <section className={`relative overflow-hidden rounded-3xl mb-8 h-[200px] md:h-[300px] lg:h-[400px] group transition-all duration-300 ${
          isDarkMode ? 'shadow-[0_4px_30px_rgba(0,0,0,0.8)] border border-slate-700' : 'shadow-xl shadow-gray-200/50 border border-gray-100'
        }`}>
          <Carousel autoplay effect="fade" autoplaySpeed={4000} className="w-full h-full">
            {banners.map(banner => (
              <div key={banner.id} className="relative h-[200px] md:h-[300px] lg:h-[400px] w-full outline-none">
                <img
                  className="w-full h-full object-cover"
                  alt={banner.title}
                  src={banner.image}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent flex items-center p-8 md:p-12 lg:p-16">
                  <div className="max-w-2xl space-y-3 md:space-y-4 animate-fade-in-up">
                    <span className="bg-orange-500 text-white px-3 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-bold uppercase tracking-widest shadow-md">
                      {banner.badge}
                    </span>
                    <h1 className="text-white m-0 drop-shadow-lg text-3xl md:text-5xl lg:text-6xl font-black">
                      {banner.title}
                    </h1>
                    <p className="text-gray-200 text-sm md:text-lg italic drop-shadow-md">
                      {banner.subtitle}
                    </p>
                    <Button
                      icon={<ReloadOutlined />}
                      loading={loading}
                      onClick={fetchProducts}
                      className="!mt-4 !h-11 !rounded-full !border-white !bg-white/20 backdrop-blur-md !font-bold !text-white hover:!bg-white hover:!text-orange-600 transition-all"
                    >
                      Làm mới Bảng Xếp Hạng
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </section>

        {/* COMPONENT: BỘ LỌC DANH MỤC HORIZONTAL */}
        <section className="mb-8 flex flex-wrap items-center gap-3">
          <div className={`flex items-center gap-2 mr-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <LayoutTwoTone twoToneColor="#f97316" className="text-xl" />
            <span className="font-bold">Lọc theo:</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar flex-1">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`whitespace-nowrap rounded-full px-5 py-2 text-sm font-bold transition-all duration-300 ${
                  activeCategory === category.id
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/30"
                    : isDarkMode
                      ? "bg-slate-800 text-gray-300 border border-slate-700 hover:border-orange-500 hover:text-orange-400"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-orange-500 hover:text-orange-600 shadow-sm"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <div className={`flex min-h-[420px] items-center justify-center rounded-3xl shadow-sm ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <Spin size="large" tip="Đang tải bảng xếp hạng..." />
          </div>
        ) : normalizedProducts.length === 0 ? (
          <div className={`rounded-3xl px-6 py-16 text-center shadow-sm ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <Empty description={<span className={isDarkMode ? 'text-gray-400' : ''}>Chưa có sản phẩm phù hợp.</span>} />
            <Button
              type="primary"
              className="mt-5 !rounded-xl !bg-orange-500 hover:!bg-orange-600 border-0"
              onClick={() => navigate("/supermarket")}
            >
              Quay lại siêu thị
            </Button>
          </div>
        ) : (
          <>
            {/* TOP 3 SẢN PHẨM (VERTICAL PREMIUM CARDS) */}
            <section className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {topFeatured.map((item) => {
                const isOutOfStock = item.stock <= 0;

                // --- LOGIC HUY HIỆU VÀNG BẠC ĐỒNG ---
                const medalStyles = {
                  1: {
                    bg: "bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600",
                    border: "border-yellow-200",
                    shadow: "shadow-lg shadow-yellow-500/40",
                    iconColor: "text-white"
                  },
                  2: {
                    bg: "bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500",
                    border: "border-gray-200",
                    shadow: "shadow-lg shadow-gray-500/40",
                    iconColor: "text-white"
                  },
                  3: {
                    bg: "bg-gradient-to-br from-orange-400 via-orange-600 to-orange-700",
                    border: "border-orange-300",
                    shadow: "shadow-lg shadow-orange-600/40",
                    iconColor: "text-white"
                  }
                };
                const currentMedal = medalStyles[item.rank] || {
                  bg: "bg-black/60",
                  border: "border-white/20",
                  shadow: "shadow-sm",
                  iconColor: "text-gray-200"
                };
                
                return (
                  <article
                    key={item.id}
                    onClick={() => handleViewDetail(item.id)}
                    className={`relative overflow-hidden rounded-3xl p-5 transition-all duration-300 cursor-pointer group hover:-translate-y-1 ${
                      isDarkMode 
                        ? 'bg-slate-800 hover:border-orange-500 shadow-black/30 hover:shadow-2xl border border-slate-700' 
                        : 'bg-white hover:border-orange-300 shadow-lg shadow-gray-200/40 border border-gray-100'
                    }`}
                  >
                    {/* Rank Badge (Huy Chương Vàng/Bạc/Đồng) */}
                    <div className={`absolute top-8 right-8 z-10 px-4 py-1.5 rounded-full border flex items-center gap-1.5 ${currentMedal.bg} ${currentMedal.border} ${currentMedal.shadow}`}>
                      <TrophyFilled className={`text-sm ${currentMedal.iconColor}`} />
                      <span className="text-xs text-white font-black tracking-widest uppercase">
                        RANK {item.rank}
                      </span>
                    </div>

                    {/* Khung Ảnh */}
                    <div className="mb-5 mt-2 overflow-hidden rounded-2xl relative bg-gray-100 dark:bg-slate-900 border border-gray-200/50 dark:border-slate-700/50">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-[280px] w-full object-cover transition duration-700 ease-out group-hover:scale-110"
                        onError={(event) => { event.currentTarget.src = createFallbackImage(item.title); }}
                      />
                      
                      {/* Trạng thái Tồn kho */}
                      <div className="absolute top-4 left-4">
                        <span className={`backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm border ${
                          isDarkMode ? 'bg-black/50 border-gray-600 text-gray-200' : 'bg-white/85 border-white/50 text-gray-800'
                        }`}>
                          <span className={`w-2 h-2 rounded-full animate-pulse ${isOutOfStock ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                          {isOutOfStock ? "Hết hàng" : "Còn hàng"}
                        </span>
                      </div>

                      {/* Hover Overlay: Quick View */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button className={`px-6 py-2.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 ${
                          isDarkMode ? 'bg-slate-800 text-white hover:bg-orange-500' : 'bg-white text-gray-800 hover:bg-orange-500 hover:text-white'
                        }`}>
                          <EyeOutlined className="text-lg" /> Quick View
                        </button>
                      </div>
                    </div>

                    {/* Nội dung chi tiết */}
                    <div className="relative">
                      {/* FAB (Floating Action Button) Thêm giỏ hàng */}
                      <button
                        onClick={(event) => handleAddToCart(event, item)}
                        disabled={isOutOfStock}
                        className={`absolute -top-12 right-2 w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all group/btn ring-4 ${
                          isDarkMode 
                            ? 'bg-orange-500 text-white ring-slate-800 disabled:bg-gray-600 disabled:ring-slate-800' 
                            : 'bg-orange-500 text-white ring-white disabled:bg-gray-300 disabled:ring-white'
                        }`}
                      >
                        <ShoppingCartOutlined className="text-2xl group-hover/btn:rotate-12 transition-transform" />
                      </button>

                      <div className="mb-3 flex flex-wrap items-center gap-2 pr-16">
                        {item.badge && (
                          <span className="bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1">
                            <FireFilled /> {item.badge}
                          </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                          isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {item.category}
                        </span>
                      </div>

                      <h3 className={`mb-2 line-clamp-2 text-xl font-black leading-tight transition-colors group-hover:text-orange-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {item.title}
                      </h3>

                      <p className={`mb-4 line-clamp-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {item.description}
                      </p>

                      <div className="mb-4 flex items-end gap-3">
                        <span className="text-2xl font-black text-orange-500 tracking-tight">
                          {formatCurrency(item.price)}
                        </span>
                        {item.originalPrice > item.price && (
                          <span className="text-sm text-gray-400 line-through font-medium">
                            {formatCurrency(item.originalPrice)}
                          </span>
                        )}
                      </div>

                      <div className={`mb-2 flex items-center justify-between text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <div className="flex items-center gap-1">
                          <StarFilled className="text-amber-500 text-lg" />
                          <span>{getRatingText(item)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ShoppingCartOutlined className="text-lg" />
                          <span>{item.sold.toLocaleString("vi-VN")} đã bán</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar Ảo (Mô phỏng hàng Hot) */}
                    <div className={`absolute bottom-0 left-0 h-1.5 w-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                      <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600" style={{ width: `${80 - item.rank * 10}%` }}></div>
                    </div>
                  </article>
                );
              })}
            </section>

            {/* DANH SÁCH THỊNH HÀNH (HORIZONTAL PREMIUM CARDS) */}
            <section className="mb-10">
              <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className={`m-0 text-2xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Danh sách sản phẩm thịnh hành
                  </h2>
                  <p className={`m-0 mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Các sản phẩm còn lại trong bảng xếp hạng hiện tại.
                  </p>
                </div>

                <Button
                  type="primary"
                  onClick={() => navigate("/supermarket")}
                  className="!rounded-xl !font-bold !bg-orange-500 hover:!bg-orange-600 border-0"
                >
                  Xem tất cả sản phẩm
                </Button>
              </div>

              {listProducts.length === 0 ? (
                <Empty description={<span className={isDarkMode ? 'text-gray-400' : ''}>Chưa có thêm sản phẩm trong danh sách.</span>} />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-5">
                  {listProducts.map((item) => {
                    const isOutOfStock = item.stock <= 0;

                    return (
                      <article
                        key={item.id}
                        onClick={() => handleViewDetail(item.id)}
                        className={`flex flex-col sm:flex-row gap-5 p-4 md:p-5 rounded-3xl border transition-all duration-300 cursor-pointer hover:shadow-xl ${
                          isDarkMode 
                            ? 'bg-slate-800 border-slate-700 hover:border-orange-500 shadow-black/20' 
                            : 'bg-white border-gray-100 hover:border-orange-300 shadow-md shadow-gray-200/40'
                        }`}
                      >
                        {/* Cột Trái: Ô Rank & Hình Ảnh */}
                        <div className="flex gap-4 sm:flex-col items-center sm:w-40 flex-shrink-0">
                          <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center font-black text-2xl md:text-3xl ${
                            isDarkMode ? 'bg-orange-500/10 text-orange-500' : 'bg-orange-50 text-orange-600'
                          }`}>
                            {item.rank}
                          </div>
                          
                          <div className="w-24 h-24 sm:w-full sm:h-40 rounded-2xl overflow-hidden relative border border-gray-200/50 dark:border-slate-700/50 bg-gray-100 dark:bg-slate-900 group">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              onError={(event) => { event.currentTarget.src = createFallbackImage(item.title); }}
                            />
                          </div>
                        </div>

                        {/* Cột Phải: Nội dung */}
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                                isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600'
                              }`}>
                                {item.category}
                              </span>
                              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                                isDarkMode ? 'bg-slate-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {item.sellerName}
                              </span>
                            </div>

                            <div className="flex justify-between items-start gap-4 mb-2">
                              <h3 className={`text-lg md:text-xl font-bold line-clamp-2 leading-tight ${
                                isDarkMode ? 'text-white hover:text-orange-400' : 'text-gray-900 hover:text-orange-600'
                              } transition-colors`}>
                                {item.title}
                              </h3>
                              <span className="text-xl md:text-2xl font-black text-orange-500 whitespace-nowrap tracking-tight">
                                {formatCurrency(item.price)}
                              </span>
                            </div>

                            <p className={`text-sm line-clamp-2 mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {item.description}
                            </p>
                          </div>

                          {/* Dòng cuối: Rating, Số lượng bán & Actions */}
                          <div className="flex flex-wrap items-end justify-between gap-4 mt-auto">
                            <div className={`flex items-center gap-4 text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              <span className="flex items-center gap-1">
                                <StarFilled className="text-amber-500 text-lg" />
                                {getRatingText(item)}
                              </span>
                              <span>Đã bán {item.sold.toLocaleString("vi-VN")}</span>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                icon={<EyeOutlined />}
                                onClick={(e) => { e.stopPropagation(); handleViewDetail(item.id); }}
                                className={`!rounded-xl !font-bold ${
                                  isDarkMode ? '!bg-slate-700 !text-white !border-slate-600 hover:!border-orange-500 hover:!text-orange-400' : ''
                                }`}
                              >
                                Xem
                              </Button>

                              <Button
                                type="primary"
                                icon={<ShoppingCartOutlined />}
                                loading={addingProductId === item.id}
                                disabled={isOutOfStock}
                                onClick={(e) => handleAddToCart(e, item)}
                                className="!rounded-xl !bg-orange-500 !font-bold hover:!bg-orange-600 border-0 shadow-md"
                              >
                                Thêm
                              </Button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
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
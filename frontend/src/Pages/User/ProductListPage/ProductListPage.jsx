import React, { useMemo, useState, useEffect } from "react";
import {
  Button,
  Empty,
  Input,
  Select,
  Slider,
  Space,
  Tag,
  Tooltip,
  Typography,
  message,
  Spin,
  Carousel,
} from "antd";
import {
  FilterTwoTone,
  AppstoreTwoTone,
  LayoutTwoTone,
  ProjectTwoTone,
  DatabaseTwoTone,
  SearchOutlined,
  ShoppingCartOutlined,
  ReloadOutlined,
  ClearOutlined,
  EyeOutlined,
  StarFilled
} from "@ant-design/icons";
import { useNavigate, useOutletContext } from "react-router-dom";

import api from "../../../Apis/apiConfig";
import API_ENDPOINTS from "../../../Apis/apiEndpoints";
import { getAuthUser } from "../../../Utils/Auth";
import { notifyCartChanged } from "../../../Utils/CartEvents";

const { Title, Text } = Typography;

const DEFAULT_PRICE_RANGE = [0, 10000000];

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value || 0));
};

const unwrapApiData = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const getMainVariant = (product) => {
  return (
    product?.variants?.[0] || {
      id: null,
      price: 0,
      stock: 0,
      sku: "",
      attributes: {},
    }
  );
};

const getMainImage = (product) => {
  return (
    product?.imageUrls?.[0] ||
    "https://via.placeholder.com/400x400?text=Product"
  );
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

const normalizeSort = (sortType) => {
  switch (sortType) {
    case "PRICE_ASC":
      return {
        sortBy: "price",
        sortDir: "asc",
      };

    case "PRICE_DESC":
      return {
        sortBy: "price",
        sortDir: "desc",
      };

    case "NAME_ASC":
      return {
        sortBy: "name",
        sortDir: "asc",
      };

    case "DEFAULT":
    default:
      return {
        sortBy: "createdAt",
        sortDir: "desc",
      };
  }
};

const ProductListPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useOutletContext();
  const authUser = getAuthUser();
  const userId = authUser?.id;

  const productEndpoint = API_ENDPOINTS.products || API_ENDPOINTS.product;
  const categoryEndpoint = API_ENDPOINTS.categories || API_ENDPOINTS.category;
  const reviewEndpoint = API_ENDPOINTS.reviews || API_ENDPOINTS.review;

  const [products, setProducts] = useState([]);
  const [reviewSummaries, setReviewSummaries] = useState({});
  const [categories, setCategories] = useState([
    {
      id: "ALL",
      name: "Tất cả",
    },
  ]);

  const [keyword, setKeyword] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("ALL");
  const [sortType, setSortType] = useState("DEFAULT");
  const [priceRange, setPriceRange] = useState(DEFAULT_PRICE_RANGE);
  const [stockFilter, setStockFilter] = useState("ALL");

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const fetchCategories = async () => {
    setLoadingCategories(true);

    try {
      const response = await api.get(categoryEndpoint.list);
      const list = unwrapApiData(response);

      setCategories([
        {
          id: "ALL",
          name: "Tất cả",
        },
        ...list,
      ]);
    } catch (error) {
      console.error("Không tải được categories", error);
      message.error("Không thể tải danh mục sản phẩm.");
    } finally {
      setLoadingCategories(false);
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
            console.error("Không tải được đánh giá sản phẩm", productId, error);
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

      setReviewSummaries((prev) => ({
        ...prev,
        ...Object.fromEntries(entries),
      }));
    } catch (error) {
      console.error("Không tải được đánh giá sản phẩm", error);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);

    try {
      const { sortBy, sortDir } = normalizeSort(sortType);

      const params = {
        sortBy,
        sortDir,
      };

      if (keyword.trim()) {
        params.keyword = keyword.trim();
      }

      if (selectedCategoryId !== "ALL") {
        params.categoryId = selectedCategoryId;
      }

      if (priceRange?.[0] > 0) {
        params.minPrice = priceRange[0];
      }

      if (priceRange?.[1] < DEFAULT_PRICE_RANGE[1]) {
        params.maxPrice = priceRange[1];
      }

      const response = await api.get(productEndpoint.search, params);
      const list = unwrapApiData(response);

      setProducts(list);
      fetchReviewSummaries(list);
    } catch (error) {
      console.error("Lỗi khi tải danh sách sản phẩm", error);
      message.error("Không thể tải danh sách sản phẩm.");
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, selectedCategoryId, sortType, priceRange]);

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const mainVariant = getMainVariant(product);

      const status = product?.status;
      const isActive = !status || status === "ACTIVE";

      const matchStock =
        stockFilter === "ALL" ||
        (stockFilter === "IN_STOCK" && Number(mainVariant.stock || 0) > 0) ||
        (stockFilter === "OUT_OF_STOCK" &&
          Number(mainVariant.stock || 0) === 0);

      return isActive && matchStock;
    });

    return result;
  }, [products, stockFilter]);

  const handleAddToCart = async (event, product) => {
    event.stopPropagation();

    const mainVariant = getMainVariant(product);

    if (!userId) {
      message.warning("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      return;
    }

    if (!mainVariant?.id) {
      message.warning("Sản phẩm chưa có phiên bản để thêm vào giỏ hàng.");
      return;
    }

    if (Number(mainVariant.stock || 0) <= 0) {
      message.warning("Sản phẩm hiện đã hết hàng.");
      return;
    }

    try {
      const response = await api.post(API_ENDPOINTS.cart.items(userId), {
        productVariantId: mainVariant.id,
        quantity: 1,
      });
      notifyCartChanged(response);

      message.success("Đã thêm sản phẩm vào giỏ hàng.");
    } catch (error) {
      console.error("Lỗi thêm vào giỏ hàng", error);
      message.error("Không thể thêm sản phẩm vào giỏ hàng.");
    }
  };

  const resetFilters = () => {
    setKeyword("");
    setSelectedCategoryId("ALL");
    setSortType("DEFAULT");
    setPriceRange(DEFAULT_PRICE_RANGE);
    setStockFilter("ALL");
  };

  const banners = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1920",
      badge: "Siêu Thị Khuyến Mãi",
      title: "Thực Phẩm Tươi Sống",
      subtitle: "Giảm tới 30% cho các sản phẩm rau củ quả trong ngày.",
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=80&w=1920",
      badge: "Hàng Nhập Khẩu",
      title: "Chất Lượng Quốc Tế",
      subtitle: "Thực phẩm đóng gói nhập khẩu trực tiếp, đảm bảo vệ sinh an toàn.",
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=1920",
      badge: "Đồ Dùng Thú Cưng",
      title: "Siêu Sale Phụ Kiện",
      subtitle: "Tất cả những gì thú cưng của bạn cần đều có ở đây.",
    }
  ];

  const popupDarkClass = isDarkMode 
    ? "!bg-slate-800 [&_.ant-select-item]:!text-gray-200 [&_.ant-select-item-option-selected]:!bg-orange-500/20 [&_.ant-select-item-option-selected]:!text-orange-400 [&_.ant-select-item-option-active]:!bg-slate-700" 
    : "";

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
                    <Title level={1} className="!text-white !m-0 drop-shadow-lg !text-3xl md:!text-5xl lg:!text-6xl">
                      {banner.title}
                    </Title>
                    <p className="text-gray-200 text-sm md:text-lg italic drop-shadow-md">
                      {banner.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </section>

        {/* COMPONENT: BỘ LỌC ĐÃ ĐƯỢC CUSTOM BẰNG DIV THUẦN */}
        <div className={`mb-8 p-5 md:p-6 rounded-2xl border transition-all duration-300 ${
          isDarkMode ? '!bg-slate-800 !border-slate-700 shadow-xl' : 'bg-white border-white shadow-xl shadow-gray-200/50'
        }`}>
          <div className={`mb-5 flex items-center gap-2 border-b pb-3 ${isDarkMode ? 'border-slate-700' : 'border-gray-100'}`}>
            <FilterTwoTone twoToneColor="#f97316" className="text-xl" />
            <Title level={4} className={`!mb-0 ${isDarkMode ? '!text-white' : '!text-slate-800'}`}>
              Bộ lọc sản phẩm
            </Title>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 items-end">
            <div className="flex flex-col gap-1.5">
              <Text strong className={`flex items-center gap-2 ${isDarkMode ? '!text-gray-300' : '!text-gray-700'}`}>
                <SearchOutlined className="text-blue-500" /> Tìm kiếm
              </Text>
              <Input
                size="large"
                placeholder="Nhập tên sản phẩm..."
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                allowClear
                className={isDarkMode ? '!bg-slate-700 !border-slate-600 !text-white placeholder:!text-gray-400 hover:!border-orange-500 focus:!border-orange-500' : ''}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Text strong className={`flex items-center gap-2 ${isDarkMode ? '!text-gray-300' : '!text-gray-700'}`}>
                <AppstoreTwoTone twoToneColor="#10b981" /> Danh mục
              </Text>
              <Select
                size="large"
                value={selectedCategoryId}
                onChange={setSelectedCategoryId}
                loading={loadingCategories}
                popupClassName={popupDarkClass}
                options={categories.map(c => ({ value: c.id, label: c.name }))}
                className={`w-full ${isDarkMode ? '[&_.ant-select-selector]:!bg-slate-700 [&_.ant-select-selector]:!border-slate-600 [&_.ant-select-selection-item]:!text-white [&_.ant-select-arrow]:!text-gray-400 hover:[&_.ant-select-selector]:!border-orange-500' : ''}`}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Text strong className={`flex items-center gap-2 ${isDarkMode ? '!text-gray-300' : '!text-gray-700'}`}>
                <DatabaseTwoTone twoToneColor="#8b5cf6" /> Tồn kho
              </Text>
              <Select
                size="large"
                value={stockFilter}
                onChange={setStockFilter}
                popupClassName={popupDarkClass}
                options={[
                  { value: "ALL", label: "Tất cả" },
                  { value: "IN_STOCK", label: "Còn hàng" },
                  { value: "OUT_OF_STOCK", label: "Hết hàng" },
                ]}
                className={`w-full ${isDarkMode ? '[&_.ant-select-selector]:!bg-slate-700 [&_.ant-select-selector]:!border-slate-600 [&_.ant-select-selection-item]:!text-white [&_.ant-select-arrow]:!text-gray-400 hover:[&_.ant-select-selector]:!border-orange-500' : ''}`}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Text strong className={`flex items-center gap-2 ${isDarkMode ? '!text-gray-300' : '!text-gray-700'}`}>
                <ProjectTwoTone twoToneColor="#f43f5e" /> Sắp xếp theo
              </Text>
              <Select
                size="large"
                value={sortType}
                onChange={setSortType}
                popupClassName={popupDarkClass}
                options={[
                  { value: "DEFAULT", label: "Mới nhất" },
                  { value: "NAME_ASC", label: "Tên A-Z" },
                  { value: "PRICE_ASC", label: "Giá tăng dần" },
                  { value: "PRICE_DESC", label: "Giá giảm dần" },
                ]}
                className={`w-full ${isDarkMode ? '[&_.ant-select-selector]:!bg-slate-700 [&_.ant-select-selector]:!border-slate-600 [&_.ant-select-selection-item]:!text-white [&_.ant-select-arrow]:!text-gray-400 hover:[&_.ant-select-selector]:!border-orange-500' : ''}`}
              />
            </div>

            <div className="flex gap-2 h-10">
              <Button 
                type="primary" 
                icon={<ReloadOutlined />} 
                onClick={fetchProducts} 
                loading={loadingProducts}
                className="flex-1 !bg-orange-500 hover:!bg-orange-600 !h-full border-0 shadow-md"
              >
                Lọc
              </Button>
              <Tooltip title="Xóa bộ lọc">
                <Button 
                  icon={<ClearOutlined />} 
                  onClick={resetFilters} 
                  className={`!h-full transition-colors ${isDarkMode ? '!bg-slate-700 !text-gray-300 !border-slate-600 hover:!text-orange-400 hover:!border-orange-500' : ''}`}
                />
              </Tooltip>
            </div>
          </div>

          <div className={`mt-5 pt-4 border-t border-dashed ${isDarkMode ? 'border-slate-600' : 'border-gray-200'}`}>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <Text strong className={`whitespace-nowrap flex items-center gap-2 ${isDarkMode ? '!text-gray-300' : '!text-gray-700'}`}>
                <LayoutTwoTone twoToneColor="#0ea5e9" /> Khoảng giá:
              </Text>
              <div className="flex-1 px-2 md:px-4">
                <Slider
                  range
                  min={0}
                  max={DEFAULT_PRICE_RANGE[1]}
                  step={100000}
                  value={priceRange}
                  onChange={setPriceRange}
                  trackStyle={[{ backgroundColor: '#f97316' }]}
                  handleStyle={[{ borderColor: '#f97316' }, { borderColor: '#f97316' }]}
                />
              </div>
              <div className={`text-sm font-semibold whitespace-nowrap px-3 py-1.5 rounded-lg ${
                isDarkMode ? 'bg-slate-700 text-orange-400' : 'bg-orange-50 text-orange-600'
              }`}>
                {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}
              </div>
            </div>
          </div>
        </div>

        {/* KẾT QUẢ & LƯỚI SẢN PHẨM */}
        <div className="w-full">
          <div className={`mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between ${isDarkMode ? 'text-gray-100' : 'text-slate-800'}`}>
            <div>
              <Title level={3} className={`!mb-1 ${isDarkMode ? '!text-white' : '!text-black'}`}>
                Tìm thấy {filteredProducts.length} sản phẩm
              </Title>
              <Text type="secondary" className={isDarkMode ? '!text-gray-400' : ''}>
                Bấm vào sản phẩm để xem chi tiết và chọn phiên bản.
              </Text>
            </div>
          </div>

          {loadingProducts ? (
            <div className={`flex min-h-[360px] items-center justify-center rounded-3xl shadow-sm border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]'}`}>
              <Spin size="large" tip="Đang tải sản phẩm..." />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className={`rounded-3xl py-16 shadow-sm border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]'}`}>
              <Empty 
                description={<span className={isDarkMode ? 'text-gray-400' : ''}>Không tìm thấy sản phẩm phù hợp.</span>} 
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => {
                const mainVariant = getMainVariant(product);
                const isOutOfStock = Number(mainVariant.stock || 0) <= 0;
                const reviewSummary = reviewSummaries[product.id];
                const hasReviews = Number(reviewSummary?.reviewCount || 0) > 0;

                return (
                  /* HIGH-END PRODUCT CARD DESIGN WITH PREMIUM SHADOWS */
                  <div
                    key={product.id}
                    onClick={() => navigate(`/products/${product.id}`)}
                    className={`relative group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border ${
                      isDarkMode 
                        ? 'bg-slate-800 border-slate-700 hover:border-orange-500 shadow-black/30 hover:shadow-2xl' 
                        : 'bg-white border-gray-100 hover:border-orange-300 shadow-lg shadow-gray-200/40 hover:shadow-2xl hover:shadow-orange-500/20'
                    }`}
                  >
                    {/* Hình ảnh */}
                    <div className="aspect-square w-full relative overflow-hidden bg-gray-100 dark:bg-slate-900">
                      <img
                        src={getMainImage(product)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      
                      {/* Badge Glassmorphism */}
                      <div className="absolute top-4 left-4">
                        <span className={`backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm border ${
                          isDarkMode ? 'bg-black/50 border-gray-600 text-gray-200' : 'bg-white/85 border-white/50 text-gray-800'
                        }`}>
                          <span className={`w-2 h-2 rounded-full animate-pulse ${isOutOfStock ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                          {isOutOfStock ? "Hết hàng" : "Còn hàng"}
                        </span>
                      </div>

                      {/* Hover Overlay: Quick View */}
                      <div className="absolute inset-0 bg-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button className={`px-6 py-2.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 ${
                          isDarkMode ? 'bg-slate-800 text-white hover:bg-orange-500' : 'bg-white text-gray-800 hover:bg-orange-500 hover:text-white'
                        }`}>
                          <EyeOutlined className="text-lg" /> Xem chi tiết
                        </button>
                      </div>
                    </div>

                    {/* Nội dung chi tiết */}
                    <div className="p-6 relative">
                      {/* FAB (Floating Action Button) Thêm giỏ hàng */}
                      <button
                        onClick={(event) => handleAddToCart(event, product)}
                        disabled={isOutOfStock}
                        className={`absolute -top-7 right-5 w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all group/btn ring-4 ${
                          isDarkMode 
                            ? 'bg-orange-500 text-white ring-slate-800 disabled:bg-gray-600 disabled:ring-slate-800' 
                            : 'bg-orange-500 text-white ring-white disabled:bg-gray-300 disabled:ring-white'
                        }`}
                      >
                        <ShoppingCartOutlined className="text-2xl group-hover/btn:rotate-12 transition-transform" />
                      </button>

                      <div className="flex justify-between items-start mb-3 pr-14">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wide uppercase ${
                          isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600'
                        }`}>
                          {product.categoryName || "Khác"}
                        </span>
                        <div className={`flex items-center gap-1 text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <StarFilled className="text-amber-500" />
                          <span>{reviewSummary ? (hasReviews ? reviewSummary.averageRating : "Chưa ĐG") : "..."}</span>
                        </div>
                      </div>

                      {/* Tên sản phẩm: Đen ở Light mode, Trắng tinh ở Dark mode */}
                      <h2 className={`font-bold text-lg mb-4 line-clamp-2 leading-tight transition-colors group-hover:text-orange-500 min-h-[56px] ${
                        isDarkMode ? 'text-white' : 'text-black'
                      }`}>
                        {product.name}
                      </h2>

                      <div className="flex flex-col gap-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-orange-500 tracking-tight">
                            {formatCurrency(mainVariant.price)}
                          </span>
                        </div>
                        <div className={`flex items-center gap-2 text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          <ShoppingCartOutlined />
                          <span>Đã bán {product.soldCount || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar ảo bên dưới */}
                    <div className={`h-1 w-full ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                      <div className="h-full bg-orange-500/40 w-3/4"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
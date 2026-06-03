import React, { useMemo, useState, useEffect } from "react";
import {
  Button,
  Card,
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
} from "antd";
import {
  AppstoreOutlined,
  EyeOutlined,
  FilterOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import api from "../../../Apis/apiConfig";
import API_ENDPOINTS from "../../../Apis/apiEndpoints";
import { getAuthUser } from "../../../Utils/Auth";
import { notifyCartChanged } from "../../../Utils/CartEvents";

const { Title, Text, Paragraph } = Typography;

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

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 p-8 text-white shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Text className="!text-white/80 font-semibold tracking-[0.3em]">
                MEGAMART SUPERMARKET
              </Text>

              <Title level={1} className="!mt-3 !mb-2 !text-white">
                Khám phá sản phẩm
              </Title>

              <Paragraph className="!mb-0 max-w-2xl !text-white/90">
                Tìm kiếm sản phẩm, lọc theo danh mục, mức giá và trạng thái tồn
                kho. Dữ liệu đang được lấy từ backend.
              </Paragraph>
            </div>

            <Button
              onClick={fetchProducts}
              loading={loadingProducts}
              className="!h-11 !rounded-xl"
            >
              Làm mới
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <Card className="h-fit rounded-3xl border-0 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <FilterOutlined className="text-orange-500" />
              <Title level={4} className="!mb-0">
                Bộ lọc sản phẩm
              </Title>
            </div>

            <div className="space-y-6">
              <div>
                <Text strong>Tìm kiếm</Text>

                <Input
                  className="mt-2"
                  size="large"
                  placeholder="Tên sản phẩm, danh mục..."
                  prefix={<SearchOutlined />}
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  allowClear
                />
              </div>

              <div>
                <Text strong>Danh mục</Text>

                <div className="mt-3 space-y-2">
                  {loadingCategories ? (
                    <div className="flex justify-center py-4">
                      <Spin />
                    </div>
                  ) : (
                    categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setSelectedCategoryId(category.id)}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition ${
                          selectedCategoryId === category.id
                            ? "bg-orange-50 font-semibold text-orange-600"
                            : "bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                        }`}
                      >
                        {category.name}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div>
                <Text strong>Khoảng giá</Text>

                <Slider
                  range
                  min={0}
                  max={DEFAULT_PRICE_RANGE[1]}
                  step={100000}
                  value={priceRange}
                  onChange={setPriceRange}
                />

                <div className="flex justify-between text-xs text-gray-500">
                  <span>{formatCurrency(priceRange[0])}</span>
                  <span>{formatCurrency(priceRange[1])}</span>
                </div>
              </div>

              <div>
                <Text strong>Tồn kho</Text>

                <Select
                  className="mt-2 w-full"
                  size="large"
                  value={stockFilter}
                  onChange={setStockFilter}
                  options={[
                    {
                      value: "ALL",
                      label: "Tất cả",
                    },
                    {
                      value: "IN_STOCK",
                      label: "Còn hàng",
                    },
                    {
                      value: "OUT_OF_STOCK",
                      label: "Hết hàng",
                    },
                  ]}
                />
              </div>

              <div>
                <Text strong>Sắp xếp</Text>

                <Select
                  className="mt-2 w-full"
                  size="large"
                  value={sortType}
                  onChange={setSortType}
                  options={[
                    {
                      value: "DEFAULT",
                      label: "Mới nhất",
                    },
                    {
                      value: "NAME_ASC",
                      label: "Tên A-Z",
                    },
                    {
                      value: "PRICE_ASC",
                      label: "Giá tăng dần",
                    },
                    {
                      value: "PRICE_DESC",
                      label: "Giá giảm dần",
                    },
                  ]}
                />
              </div>

              <Button block onClick={resetFilters}>
                Xóa bộ lọc
              </Button>
            </div>
          </Card>

          <div>
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <Title level={3} className="!mb-1">
                  Tìm thấy {filteredProducts.length} sản phẩm
                </Title>

                <Text type="secondary">
                  Bấm vào sản phẩm để xem chi tiết và chọn phiên bản.
                </Text>
              </div>

              <Tag
                icon={<AppstoreOutlined />}
                color="orange"
                className="w-fit rounded-full px-4 py-1 text-sm"
              >
                Product API
              </Tag>
            </div>

            {loadingProducts ? (
              <div className="flex min-h-[360px] items-center justify-center rounded-3xl bg-white shadow-sm">
                <Spin size="large" tip="Đang tải sản phẩm..." />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-3xl bg-white py-16 shadow-sm">
                <Empty description="Không tìm thấy sản phẩm phù hợp." />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => {
                  const mainVariant = getMainVariant(product);
                  const isOutOfStock = Number(mainVariant.stock || 0) <= 0;
                  const reviewSummary = reviewSummaries[product.id];
                  const hasReviews = Number(reviewSummary?.reviewCount || 0) > 0;

                  return (
                    <Card
                      key={product.id}
                      hoverable
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="overflow-hidden rounded-2xl border-0 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                      cover={
                        <div className="relative h-56 overflow-hidden bg-orange-50">
                          <img
                            src={getMainImage(product)}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-300 hover:scale-105"
                          />

                          <div className="absolute left-3 top-3">
                            <Tag color={isOutOfStock ? "red" : "green"}>
                              {isOutOfStock ? "Hết hàng" : "Còn hàng"}
                            </Tag>
                          </div>
                        </div>
                      }
                    >
                      <Space direction="vertical" size={8} className="w-full">
                        <div className="flex items-center justify-between gap-2">
                          <Tag color="orange">
                            {product.categoryName || "Chưa phân loại"}
                          </Tag>

                          <Text type="secondary" className="text-xs">
                            {reviewSummary
                              ? hasReviews
                                ? `⭐ ${reviewSummary.averageRating} (${reviewSummary.reviewCount})`
                                : "Chưa có đánh giá"
                              : "Đang tải đánh giá"}
                          </Text>
                        </div>

                        <Title level={5} className="!mb-0 line-clamp-2">
                          {product.name}
                        </Title>

                        <Paragraph
                          type="secondary"
                          className="!mb-0 line-clamp-2 min-h-[44px]"
                        >
                          {product.description || "Chưa có mô tả sản phẩm."}
                        </Paragraph>

                        <div className="flex items-center justify-between gap-3">
                            <Text className="text-xl font-bold !text-orange-600">
                              {formatCurrency(mainVariant.price)}
                            </Text>

                            <div className="flex items-center gap-2">
                              <Tooltip title="Thêm vào giỏ hàng">
                                <Button
                                  type="primary"
                                  shape="circle"
                                  icon={<ShoppingCartOutlined />}
                                  disabled={isOutOfStock}
                                  onClick={(event) => handleAddToCart(event, product)}
                                  className="!bg-orange-500 hover:!bg-orange-600"
                                />
                              </Tooltip>

                              <Tooltip title="Xem chi tiết">
                                <Button
                                  shape="circle"
                                  icon={<EyeOutlined />}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    navigate(`/products/${product.id}`);
                                  }}
                                />
                              </Tooltip>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                            {mainVariant.sku && <span>SKU: {mainVariant.sku}</span>}
                            <span>Đã bán {product.soldCount || 0}</span>
                            <span>Tồn kho {mainVariant.stock || 0}</span>
                          </div>
                      </Space>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;

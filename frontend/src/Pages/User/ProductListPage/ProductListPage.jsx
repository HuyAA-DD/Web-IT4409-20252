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
  Typography,
  message,
} from "antd";
import {
  AppstoreOutlined,
  FilterOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from '../../../Apis/apiConfig';
import API_ENDPOINTS from '../../../Apis/apiEndpoints';
import { getAuthUser } from '../../../Utils/Auth';

const { Title, Text, Paragraph } = Typography;

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);
};

/**
 * DTO_BACKEND_NOTE:
 * ProductResponse backend dự kiến gồm:
 * {
 *   id,
 *   name,
 *   description,
 *   categoryId,
 *   categoryName,
 *   sellerId,
 *   sellerName,
 *   status,
 *   imageUrls,
 *   variants: [
 *     {
 *       id,
 *       sku,
 *       price,
 *       stock,
 *       attributes
 *     }
 *   ],
 *   createdAt,
 *   updatedAt
 * }
 *
 * TODO_BACKEND:
 * Sau này thay mockProducts bằng:
 *
 * useEffect(() => {
 *   fetchProducts();
 *   fetchCategories();
 * }, []);
 *
 * const fetchProducts = async () => {
 *   const response = await productApi.getProducts({
 *     keyword,
 *     categoryId,
 *     minPrice,
 *     maxPrice,
 *     sort,
 *   });
 *   setProducts(response.data || response);
 * };
 *
 * const fetchCategories = async () => {
 *   const response = await categoryApi.getCategories();
 *   setCategories(response.data || response);
 * };
 */

// categories and products are loaded from API (remove UI mocks)

const getMainVariant = (product) => {
  return product?.variants?.[0] || {
    price: 0,
    stock: 0,
    sku: "",
    attributes: {},
  };
};

const getMainImage = (product) => {
  return product?.imageUrls?.[0] || "https://via.placeholder.com/400x400?text=Product";
};

const ProductListPage = () => {
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const userId = authUser?.id;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ id: 'ALL', name: 'Tất cả' }]);
  const [keyword, setKeyword] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("ALL");
  const [sortType, setSortType] = useState("DEFAULT");
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [stockFilter, setStockFilter] = useState("ALL");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get(API_ENDPOINTS.products.list);
        setProducts(response?.data || response || []);
      } catch (error) {
        console.error('Lỗi khi tải danh sách sản phẩm', error);
      }
    };

    fetchProducts();
    // fetch categories
    const fetchCategories = async () => {
      try {
        const resp = await api.get(API_ENDPOINTS.categories.list);
        const list = resp?.data || resp || [];
        setCategories([{ id: 'ALL', name: 'Tất cả' }, ...list]);
      } catch (err) {
        console.error('Không tải được categories', err);
      }
    };

    fetchCategories();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const mainVariant = getMainVariant(product);

      const matchKeyword =
        product.name.toLowerCase().includes(keyword.toLowerCase()) ||
        product.categoryName.toLowerCase().includes(keyword.toLowerCase()) ||
        mainVariant.sku.toLowerCase().includes(keyword.toLowerCase());

      const matchCategory =
        selectedCategoryId === "ALL" || product.categoryId === selectedCategoryId;

      const matchPrice =
        mainVariant.price >= priceRange[0] && mainVariant.price <= priceRange[1];

      const matchStock =
        stockFilter === "ALL" ||
        (stockFilter === "IN_STOCK" && mainVariant.stock > 0) ||
        (stockFilter === "OUT_OF_STOCK" && mainVariant.stock === 0);

      return (
        product.status === "ACTIVE" &&
        matchKeyword &&
        matchCategory &&
        matchPrice &&
        matchStock
      );
    });

    if (sortType === "PRICE_ASC") {
      result = [...result].sort(
        (a, b) => getMainVariant(a).price - getMainVariant(b).price
      );
    }

    if (sortType === "PRICE_DESC") {
      result = [...result].sort(
        (a, b) => getMainVariant(b).price - getMainVariant(a).price
      );
    }

    if (sortType === "BEST_SELLING") {
      result = [...result].sort((a, b) => b.soldCount - a.soldCount);
    }

    if (sortType === "RATING") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, keyword, selectedCategoryId, sortType, priceRange, stockFilter]);

  const handleAddToCart = async (event, product) => {
    event.stopPropagation();
    const mainVariant = getMainVariant(product);

    if (!userId) {
      message.warning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.');
      return;
    }

    if (mainVariant.stock <= 0) {
      message.warning('Sản phẩm hiện đã hết hàng.');
      return;
    }

    try {
      await api.post(API_ENDPOINTS.cart.items(userId), {
        productVariantId: mainVariant.id,
        quantity: 1,
      });
      message.success('Đã thêm sản phẩm vào giỏ hàng.');
    } catch (error) {
      console.error('Lỗi thêm vào giỏ hàng', error);
      message.error('Không thể thêm sản phẩm vào giỏ hàng.');
    }
  };

  const resetFilters = () => {
    setKeyword("");
    setSelectedCategoryId("ALL");
    setSortType("DEFAULT");
    setPriceRange([0, 1000000]);
    setStockFilter("ALL");
  };

  return (
    <div className="min-h-screen bg-transparent px-4 py-6 md:px-8">
      <div className="mx-auto max-w-[1320px]">
        <div className="mb-6 rounded-3xl bg-gradient-to-r from-orange-500 to-orange-400 p-6 text-white shadow-sm md:p-8">
          <div className="max-w-3xl">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium uppercase tracking-[0.25em] text-white/80">
              <AppstoreOutlined />
              <span>MEGAMART SUPERMARKET</span>
            </div>

            <Title level={1} className="!mb-3 !text-white">
              Khám phá sản phẩm
            </Title>

            <Paragraph className="!mb-0 !text-base !text-white/85">
              Tìm kiếm sản phẩm, lọc theo danh mục, mức giá và trạng thái tồn kho.
              Đây là trang UI mock, sau này sẽ thay dữ liệu bằng API sản phẩm thật.
            </Paragraph>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <Card className="sticky top-6 rounded-2xl border-0 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <FilterOutlined className="text-orange-500" />
                <span className="font-semibold">Bộ lọc sản phẩm</span>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="mb-2 text-sm font-medium">Tìm kiếm</div>
                  <Input
                    placeholder="Tên sản phẩm, SKU..."
                    prefix={<SearchOutlined />}
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    allowClear
                  />
                </div>

                <div>
                  <div className="mb-2 text-sm font-medium">Danh mục</div>
                  <div className="space-y-2">
                    {categories.map((category) => (
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
                        <span>{category.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-sm font-medium">Khoảng giá</div>
                  <Slider
                    range
                    min={0}
                    max={1000000}
                    step={50000}
                    value={priceRange}
                    onChange={setPriceRange}
                  />

                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>{formatCurrency(priceRange[0])}</span>
                    <span>{formatCurrency(priceRange[1])}</span>
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-sm font-medium">Tồn kho</div>
                  <Select
                    className="w-full"
                    value={stockFilter}
                    onChange={setStockFilter}
                    options={[
                      { label: "Tất cả", value: "ALL" },
                      { label: "Còn hàng", value: "IN_STOCK" },
                      { label: "Hết hàng", value: "OUT_OF_STOCK" },
                    ]}
                  />
                </div>

                <Button block onClick={resetFilters} className="!rounded-xl">
                  Xóa bộ lọc
                </Button>
              </div>
            </Card>
          </aside>

          <main className="lg:col-span-9">
            <Card className="mb-5 rounded-2xl border-0 shadow-sm">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <div className="font-semibold">
                    Tìm thấy {filteredProducts.length} sản phẩm
                  </div>
                  <Text type="secondary">
                    Bấm vào sản phẩm để xem chi tiết và chọn phiên bản.
                  </Text>
                </div>

                <Select
                  value={sortType}
                  onChange={setSortType}
                  className="min-w-[220px]"
                  options={[
                    { label: "Sắp xếp mặc định", value: "DEFAULT" },
                    { label: "Giá tăng dần", value: "PRICE_ASC" },
                    { label: "Giá giảm dần", value: "PRICE_DESC" },
                    { label: "Bán chạy", value: "BEST_SELLING" },
                    { label: "Đánh giá cao", value: "RATING" },
                  ]}
                />
              </div>
            </Card>

            {filteredProducts.length === 0 ? (
              <Card className="rounded-2xl border-0 shadow-sm">
                <Empty description="Không tìm thấy sản phẩm phù hợp" />
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => {
                  const mainVariant = getMainVariant(product);
                  const isOutOfStock = mainVariant.stock <= 0;

                  return (
                    <Card
                      key={product.id}
                      hoverable
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="overflow-hidden rounded-2xl border-0 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                      cover={
                        <div className="relative h-56 overflow-hidden bg-gray-100">
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
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <Tag color="blue">{product.categoryName}</Tag>
                        <Text type="secondary" className="!text-xs">
                          ⭐ {product.rating}
                        </Text>
                      </div>

                      <Title level={5} className="line-clamp-2 !mb-2 !min-h-[44px]">
                        {product.name}
                      </Title>

                      <Paragraph className="line-clamp-2 !mb-3 !text-sm !text-gray-500">
                        {product.description}
                      </Paragraph>

                      <div className="mb-3">
                        <div className="text-xl font-bold text-orange-600">
                          {formatCurrency(mainVariant.price)}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          SKU: {mainVariant.sku}
                        </div>
                      </div>

                      <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
                        <span>Đã bán {product.soldCount}</span>
                        <span>Tồn kho {mainVariant.stock}</span>
                      </div>

                      <Space className="w-full" direction="vertical">
                        <Button
                          type="primary"
                          block
                          disabled={isOutOfStock}
                          icon={<ShoppingCartOutlined />}
                          onClick={(event) => handleAddToCart(event, product)}
                          className="!h-10 !rounded-xl !bg-orange-500 hover:!bg-orange-600"
                        >
                          Thêm vào giỏ
                        </Button>

                        <Button
                          block
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(`/products/${product.id}`);
                          }}
                          className="!h-10 !rounded-xl"
                        >
                          Xem chi tiết
                        </Button>
                      </Space>
                    </Card>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
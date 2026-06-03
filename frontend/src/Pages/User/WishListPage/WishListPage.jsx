import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  Empty,
  Image,
  Popconfirm,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  HeartFilled,
  ReloadOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import api from "../../../Apis/apiConfig";
import API_ENDPOINTS from "../../../Apis/apiEndpoints";
import { getAuthUser } from "../../../Utils/Auth";
import { notifyCartChanged } from "../../../Utils/CartEvents";

const { Title, Text, Paragraph } = Typography;

const PLACEHOLDER_IMAGE =
  "https://via.placeholder.com/500x500?text=MEGAMART+PRODUCT";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value || 0));
};

const unwrapApiData = (response) => {
  if (Array.isArray(response)) return response;
  if (response?.data !== undefined) return response.data;
  return response;
};

const getProductImage = (product) => {
  const imageUrls = Array.isArray(product?.imageUrls) ? product.imageUrls : [];
  return imageUrls[0] || PLACEHOLDER_IMAGE;
};

const getMainVariant = (product) => {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  return (
    variants[0] || {
      id: null,
      price: 0,
      stock: 0,
      sku: "",
      attributes: {},
    }
  );
};

const getVariantLabel = (variant) => {
  const attributes = variant?.attributes || {};
  const entries = Object.entries(attributes);

  if (entries.length === 0) {
    return variant?.sku || "Phiên bản mặc định";
  }

  return entries.map(([key, value]) => `${key}: ${value}`).join(" / ");
};

const normalizeWishlistItem = (wishlistItem, productDetail = null) => {
  return {
    wishlistId: wishlistItem?.id,
    userId: wishlistItem?.userId,
    productId: wishlistItem?.productId,
    productName:
      productDetail?.name || wishlistItem?.productName || "Sản phẩm yêu thích",
    createdAt: wishlistItem?.createdAt,
    product: productDetail,
  };
};

const WishListPage = () => {
  const navigate = useNavigate();

  const authUser = getAuthUser();
  const userId = authUser?.id;

  const wishlistEndpoint = API_ENDPOINTS.wishlists || API_ENDPOINTS.wishlist;
  const productEndpoint = API_ENDPOINTS.products || API_ENDPOINTS.product;

  const [items, setItems] = useState([]);
  const [selectedWishlistIds, setSelectedWishlistIds] = useState([]);

  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [addingCartId, setAddingCartId] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkAddingCart, setBulkAddingCart] = useState(false);

  const selectedItems = useMemo(() => {
    return items.filter((item) =>
      selectedWishlistIds.includes(String(item.wishlistId))
    );
  }, [items, selectedWishlistIds]);

  const isAllSelected =
    items.length > 0 && selectedWishlistIds.length === items.length;

  const fetchWishlistItems = async () => {
    if (!userId) {
      setItems([]);
      setSelectedWishlistIds([]);
      return;
    }

    setLoading(true);

    try {
      const wishlistResponse = await api.get(wishlistEndpoint.my());
      const wishlistData = unwrapApiData(wishlistResponse);
      const wishlistList = Array.isArray(wishlistData) ? wishlistData : [];

      const mergedItems = await Promise.all(
        wishlistList.map(async (wishlistItem) => {
          try {
            const productResponse = await api.get(
              productEndpoint.byId(wishlistItem.productId)
            );

            const productData = unwrapApiData(productResponse);
            return normalizeWishlistItem(wishlistItem, productData);
          } catch (error) {
            console.error(
              "Không tải được chi tiết sản phẩm trong wishlist:",
              wishlistItem.productId,
              error
            );

            return normalizeWishlistItem(wishlistItem, null);
          }
        })
      );

      setItems(mergedItems);
      setSelectedWishlistIds([]);
    } catch (error) {
      console.error("Lỗi khi tải wishlist:", error);
      message.error("Không thể tải danh sách yêu thích.");
      setItems([]);
      setSelectedWishlistIds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedWishlistIds(items.map((item) => String(item.wishlistId)));
    } else {
      setSelectedWishlistIds([]);
    }
  };

  const handleSelectItem = (wishlistId) => {
    const normalizedId = String(wishlistId);

    setSelectedWishlistIds((prevIds) => {
      if (prevIds.includes(normalizedId)) {
        return prevIds.filter((id) => id !== normalizedId);
      }

      return [...prevIds, normalizedId];
    });
  };

  const removeItemFromState = (productId) => {
    setItems((prevItems) =>
      prevItems.filter((item) => String(item.productId) !== String(productId))
    );

    setSelectedWishlistIds((prevIds) =>
      prevIds.filter((id) => {
        const item = items.find(
          (wishlistItem) => String(wishlistItem.wishlistId) === String(id)
        );

        return String(item?.productId) !== String(productId);
      })
    );
  };

  const handleRemoveItem = async (item) => {
    if (!userId) {
      message.warning("Vui lòng đăng nhập để sử dụng danh sách yêu thích.");
      return;
    }

    if (!item?.productId) {
      message.warning("Không xác định được sản phẩm cần xóa.");
      return;
    }

    setDeletingId(String(item.wishlistId));

    try {
      await api.delete(
        wishlistEndpoint.deleteByUserProduct(item.productId)
      );

      removeItemFromState(item.productId);
      message.success("Đã xóa sản phẩm khỏi danh sách yêu thích.");
    } catch (error) {
      console.error("Lỗi khi xóa wishlist:", error);
      message.error("Không thể xóa sản phẩm khỏi danh sách yêu thích.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRemoveSelected = async () => {
    if (!userId) {
      message.warning("Vui lòng đăng nhập để sử dụng danh sách yêu thích.");
      return;
    }

    if (selectedItems.length === 0) {
      message.warning("Vui lòng chọn sản phẩm cần xóa.");
      return;
    }

    setBulkDeleting(true);

    try {
      await Promise.all(
        selectedItems.map((item) =>
          api.delete(wishlistEndpoint.deleteByUserProduct(item.productId))
        )
      );

      const selectedProductIds = selectedItems.map((item) =>
        String(item.productId)
      );

      setItems((prevItems) =>
        prevItems.filter(
          (item) => !selectedProductIds.includes(String(item.productId))
        )
      );

      setSelectedWishlistIds([]);
      message.success("Đã xóa các sản phẩm đã chọn khỏi yêu thích.");
    } catch (error) {
      console.error("Lỗi khi xóa nhiều wishlist:", error);
      message.error("Không thể xóa một số sản phẩm đã chọn.");
      fetchWishlistItems();
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleAddToCart = async (item) => {
    if (!userId) {
      message.warning("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      return;
    }

    const mainVariant = getMainVariant(item.product);

    if (!mainVariant?.id) {
      message.warning("Sản phẩm chưa có phiên bản để thêm vào giỏ hàng.");
      return;
    }

    if (Number(mainVariant.stock || 0) <= 0) {
      message.warning("Sản phẩm hiện đã hết hàng.");
      return;
    }

    setAddingCartId(String(item.wishlistId));

    try {
      const response = await api.post(API_ENDPOINTS.cart.items(userId), {
        productVariantId: mainVariant.id,
        quantity: 1,
      });
      notifyCartChanged(response);

      message.success("Đã thêm sản phẩm vào giỏ hàng.");
    } catch (error) {
      console.error("Lỗi thêm sản phẩm vào giỏ hàng:", error);
      message.error("Không thể thêm sản phẩm vào giỏ hàng.");
    } finally {
      setAddingCartId(null);
    }
  };

  const handleAddSelectedToCart = async () => {
    if (!userId) {
      message.warning("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      return;
    }

    if (selectedItems.length === 0) {
      message.warning("Vui lòng chọn sản phẩm cần thêm vào giỏ.");
      return;
    }

    const validItems = selectedItems.filter((item) => {
      const mainVariant = getMainVariant(item.product);
      return mainVariant?.id && Number(mainVariant.stock || 0) > 0;
    });

    if (validItems.length === 0) {
      message.warning("Không có sản phẩm hợp lệ để thêm vào giỏ hàng.");
      return;
    }

    setBulkAddingCart(true);

    try {
      await Promise.all(
        validItems.map((item) => {
          const mainVariant = getMainVariant(item.product);

          return api.post(API_ENDPOINTS.cart.items(userId), {
            productVariantId: mainVariant.id,
            quantity: 1,
          });
        })
      );
      notifyCartChanged();

      message.success(`Đã thêm ${validItems.length} sản phẩm vào giỏ hàng.`);
    } catch (error) {
      console.error("Lỗi thêm nhiều sản phẩm vào giỏ:", error);
      message.error("Không thể thêm một số sản phẩm vào giỏ hàng.");
    } finally {
      setBulkAddingCart(false);
    }
  };

  const handleGoToProductDetail = (productId) => {
    if (!productId) return;
    navigate(`/products/${productId}`);
  };

  if (!userId) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 pb-10 pt-24 md:px-8 md:pt-28">
        <div className="mx-auto max-w-6xl rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
          <HeartFilled className="mb-4 text-5xl text-orange-500" />

          <Title level={2}>Bạn chưa đăng nhập</Title>

          <Paragraph className="mx-auto max-w-xl text-gray-500">
            Vui lòng đăng nhập để xem và quản lý danh sách sản phẩm yêu thích.
          </Paragraph>

          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/auth/login-register")}
            className="!rounded-xl !bg-orange-500 hover:!bg-orange-600"
          >
            Đăng nhập ngay
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 pb-10 pt-24 md:px-8 md:pt-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-8 text-white shadow-sm md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <HeartFilled className="text-3xl" />
                <Title level={2} className="!mb-0 !text-white">
                  Yêu thích của tôi
                </Title>
              </div>

              <Text className="text-white/90">
                Lưu lại các sản phẩm bạn quan tâm và dễ dàng thêm vào giỏ hàng
                khi cần.
              </Text>
            </div>

            <div className="flex items-center gap-3">
              <Tag className="rounded-full px-4 py-1 text-base">
                {items.length} sản phẩm
              </Tag>

              <Button
                icon={<ReloadOutlined />}
                onClick={fetchWishlistItems}
                loading={loading}
                className="!rounded-xl"
              >
                Làm mới
              </Button>
            </div>
          </div>
        </div>

        <Card className="mb-6 rounded-3xl border-0 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Checkbox
              checked={isAllSelected}
              indeterminate={
                selectedWishlistIds.length > 0 &&
                selectedWishlistIds.length < items.length
              }
              disabled={items.length === 0}
              onChange={handleSelectAll}
            >
              Chọn tất cả ({items.length} sản phẩm)
            </Checkbox>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Popconfirm
                title="Xóa các sản phẩm đã chọn?"
                description="Các sản phẩm này sẽ bị xóa khỏi danh sách yêu thích."
                okText="Xóa"
                cancelText="Hủy"
                onConfirm={handleRemoveSelected}
                disabled={selectedWishlistIds.length === 0}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  disabled={selectedWishlistIds.length === 0}
                  loading={bulkDeleting}
                  className="!rounded-xl"
                >
                  Xóa mục chọn
                </Button>
              </Popconfirm>

              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                disabled={selectedWishlistIds.length === 0}
                loading={bulkAddingCart}
                onClick={handleAddSelectedToCart}
                className="!rounded-xl !bg-orange-500 hover:!bg-orange-600"
              >
                Thêm mục chọn vào giỏ
              </Button>
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="flex min-h-[360px] items-center justify-center rounded-3xl bg-white shadow-sm">
            <Spin size="large" tip="Đang tải danh sách yêu thích..." />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
            <Empty
              description={
                <span className="text-gray-500">
                  Danh sách yêu thích của bạn đang trống.
                </span>
              }
            />

            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/supermarket")}
              className="mt-5 !rounded-xl !bg-orange-500 hover:!bg-orange-600"
            >
              Bắt đầu mua sắm
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {items.map((item) => {
              const product = item.product;
              const mainVariant = getMainVariant(product);
              const isOutOfStock = Number(mainVariant.stock || 0) <= 0;
              const isSelected = selectedWishlistIds.includes(
                String(item.wishlistId)
              );

              return (
                <Card
                  key={item.wishlistId || item.productId}
                  className="overflow-hidden rounded-3xl border-0 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  styles={{
                    body: {
                      padding: 0,
                    },
                  }}
                >
                  <div className="grid grid-cols-[150px_minmax(0,1fr)] gap-4 p-4 sm:grid-cols-[190px_minmax(0,1fr)]">
                    <button
                      type="button"
                      onClick={() => handleGoToProductDetail(item.productId)}
                      className="relative overflow-hidden rounded-2xl bg-orange-50"
                    >
                      <Image
                        src={getProductImage(product)}
                        alt={item.productName}
                        fallback={PLACEHOLDER_IMAGE}
                        preview={false}
                        className="!h-40 !w-full !object-cover sm:!h-48"
                      />

                      <div className="absolute left-3 top-3">
                        <Checkbox
                          checked={isSelected}
                          onClick={(event) => event.stopPropagation()}
                          onChange={() => handleSelectItem(item.wishlistId)}
                        />
                      </div>

                      <div className="absolute right-3 top-3">
                        <Tag color={isOutOfStock ? "red" : "green"}>
                          {isOutOfStock ? "Hết hàng" : "Còn hàng"}
                        </Tag>
                      </div>
                    </button>

                    <div className="flex min-w-0 flex-col">
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Tag color="orange">
                            {product?.categoryName || "Sản phẩm"}
                          </Tag>

                          <Title
                            level={4}
                            className="!mb-1 !mt-2 !text-lg"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {item.productName}
                          </Title>
                        </div>

                        <Popconfirm
                          title="Xóa khỏi yêu thích?"
                          description="Sản phẩm này sẽ bị xóa khỏi danh sách yêu thích."
                          okText="Xóa"
                          cancelText="Hủy"
                          onConfirm={() => handleRemoveItem(item)}
                        >
                          <Button
                            danger
                            type="text"
                            icon={<DeleteOutlined />}
                            loading={deletingId === String(item.wishlistId)}
                          />
                        </Popconfirm>
                      </div>

                      <Paragraph
                        className="!mb-3 text-sm text-gray-500"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {product?.description || "Chưa có mô tả sản phẩm."}
                      </Paragraph>

                      <div className="mb-2 text-sm text-gray-500">
                        {getVariantLabel(mainVariant)}
                      </div>

                      <div className="mb-3">
                        <Text className="text-xl font-bold !text-orange-600">
                          {formatCurrency(mainVariant.price)}
                        </Text>
                      </div>

                      <div className="mb-4 flex flex-wrap gap-3 text-xs text-gray-500">
                        {mainVariant.sku && <span>SKU: {mainVariant.sku}</span>}
                        <span>Tồn kho: {mainVariant.stock || 0}</span>
                      </div>

                      <div className="mt-auto grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <Button
                          icon={<EyeOutlined />}
                          onClick={() => handleGoToProductDetail(item.productId)}
                          className="!rounded-xl"
                        >
                          Xem chi tiết
                        </Button>

                        <Button
                          type="primary"
                          icon={<ShoppingCartOutlined />}
                          disabled={isOutOfStock || !mainVariant?.id}
                          loading={addingCartId === String(item.wishlistId)}
                          onClick={() => handleAddToCart(item)}
                          className="!rounded-xl !bg-orange-500 hover:!bg-orange-600"
                        >
                          Thêm vào giỏ
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishListPage;

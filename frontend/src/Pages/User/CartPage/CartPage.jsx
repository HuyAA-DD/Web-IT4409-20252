import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Empty,
  Image,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ArrowRightOutlined,
  DeleteOutlined,
  GiftOutlined,
  MinusOutlined,
  PlusOutlined,
  ReloadOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import api from "../../../Apis/apiConfig";
import API_ENDPOINTS from "../../../Apis/apiEndpoints";
import { getAuthUser } from "../../../Utils/Auth";

const { Title, Text, Paragraph } = Typography;

const PLACEHOLDER_IMAGE =
  "https://via.placeholder.com/500x500?text=MEGAMART+PRODUCT";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value || 0));
};

const formatDate = (value) => {
  if (!value) return "Không giới hạn";

  try {
    return new Date(value).toLocaleDateString("vi-VN");
  } catch {
    return "Không xác định";
  }
};

const unwrapApiData = (response) => {
  if (Array.isArray(response)) return response;
  if (response?.data !== undefined) return response.data;
  return response;
};

const getApiMessage = (response, fallback) => {
  return response?.message || response?.data?.message || fallback;
};

const getProductImage = (product) => {
  const imageUrls = Array.isArray(product?.imageUrls) ? product.imageUrls : [];
  return imageUrls[0] || PLACEHOLDER_IMAGE;
};

const getVariantLabel = (item) => {
  const attributes = item?.attributes || {};
  const entries = Object.entries(attributes);

  if (entries.length === 0) {
    return item?.sku || "Phiên bản mặc định";
  }

  return entries.map(([key, value]) => `${key}: ${value}`).join(" / ");
};

const getItemLineTotal = (item) => {
  if (item?.lineTotal !== undefined && item?.lineTotal !== null) {
    return Number(item.lineTotal);
  }

  return Number(item?.price || 0) * Number(item?.quantity || 0);
};

const getCouponDiscountText = (coupon) => {
  const type = String(coupon?.discountType || "").toUpperCase();
  const value = Number(coupon?.discountValue || 0);

  if (type === "PERCENT" || type === "PERCENTAGE") {
    return `Giảm ${value}%`;
  }

  return `Giảm ${formatCurrency(value)}`;
};

const isCouponInDateRange = (coupon) => {
  const now = new Date();

  const startDate = coupon?.startDate ? new Date(coupon.startDate) : null;
  const endDate = coupon?.endDate ? new Date(coupon.endDate) : null;

  if (startDate && startDate > now) return false;
  if (endDate && endDate < now) return false;

  return true;
};

const isCouponUsageAvailable = (coupon) => {
  if (coupon?.usageLimit === null || coupon?.usageLimit === undefined) {
    return true;
  }

  return Number(coupon.currentUsage || 0) < Number(coupon.usageLimit || 0);
};

const getCouponEligibility = (coupon, subtotal) => {
  if (!coupon?.isActive) {
    return {
      disabled: true,
      label: "Không hoạt động",
      tagColor: "red",
    };
  }

  if (!isCouponInDateRange(coupon)) {
    return {
      disabled: true,
      label: "Hết hạn hoặc chưa tới thời gian áp dụng",
      tagColor: "red",
    };
  }

  if (!isCouponUsageAvailable(coupon)) {
    return {
      disabled: true,
      label: "Đã hết lượt sử dụng",
      tagColor: "red",
    };
  }

  const minOrderValue = Number(coupon?.minOrderValue || 0);

  if (subtotal < minOrderValue) {
    return {
      disabled: true,
      label: `Cần mua thêm ${formatCurrency(minOrderValue - subtotal)}`,
      tagColor: "gold",
    };
  }

  return {
    disabled: false,
    label: "Có thể áp dụng",
    tagColor: "green",
  };
};

const CartPage = () => {
  const navigate = useNavigate();

  const authUser = getAuthUser();
  const userId = authUser?.id;

  const cartEndpoint = API_ENDPOINTS.cart;
  const productEndpoint = API_ENDPOINTS.products || API_ENDPOINTS.product;
  const couponEndpoint = API_ENDPOINTS.coupons;

  const [cart, setCart] = useState(null);
  const [productMap, setProductMap] = useState({});
  const [selectedItemIds, setSelectedItemIds] = useState([]);

  const [voucherCode, setVoucherCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const [coupons, setCoupons] = useState([]);
  const [couponModalOpen, setCouponModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [applyingCouponCode, setApplyingCouponCode] = useState("");

  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [deletingSelected, setDeletingSelected] = useState(false);
  const [clearingCart, setClearingCart] = useState(false);

  const cartItems = useMemo(() => {
    return Array.isArray(cart?.items) ? cart.items : [];
  }, [cart]);

  const selectedItems = useMemo(() => {
    return cartItems.filter((item) => selectedItemIds.includes(String(item.id)));
  }, [cartItems, selectedItemIds]);

  const isAllSelected =
    cartItems.length > 0 && selectedItemIds.length === cartItems.length;

  const subtotal = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + getItemLineTotal(item), 0);
  }, [selectedItems]);

  const selectedQuantity = useMemo(() => {
    return selectedItems.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );
  }, [selectedItems]);

  const finalTotal = Math.max(0, subtotal - Number(discountAmount || 0));

  const visibleCoupons = useMemo(() => {
    return coupons
      .filter((coupon) => coupon?.isActive)
      .filter((coupon) => isCouponInDateRange(coupon))
      .filter((coupon) => isCouponUsageAvailable(coupon));
  }, [coupons]);

  useEffect(() => {
    if (!appliedCoupon) return;

    const originalAmount = Number(appliedCoupon.originalAmount || 0);

    if (originalAmount > 0 && Number(subtotal) !== originalAmount) {
      setAppliedCoupon(null);
      setDiscountAmount(0);
      message.info("Giỏ hàng đã thay đổi, vui lòng áp dụng lại mã giảm giá.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  const fetchProductDetailsForCart = async (items) => {
    const productIds = [
      ...new Set(
        items
          .map((item) => item.productId)
          .filter((productId) => Boolean(productId))
      ),
    ];

    if (productIds.length === 0) {
      setProductMap({});
      return;
    }

    const result = {};

    await Promise.all(
      productIds.map(async (productId) => {
        try {
          const response = await api.get(productEndpoint.byId(productId));
          const productData = unwrapApiData(response);

          result[String(productId)] = productData;
        } catch (error) {
          console.error("Không tải được chi tiết sản phẩm:", productId, error);
        }
      })
    );

    setProductMap(result);
  };

  const applyCartData = async (cartData, keepSelected = false) => {
    const safeCart = cartData || {
      id: null,
      userId,
      totalItems: 0,
      totalAmount: 0,
      items: [],
    };

    const safeItems = Array.isArray(safeCart.items) ? safeCart.items : [];

    setCart({
      ...safeCart,
      items: safeItems,
    });

    setSelectedItemIds((prevSelectedIds) => {
      if (!keepSelected) {
        return safeItems.map((item) => String(item.id));
      }

      const currentItemIds = safeItems.map((item) => String(item.id));
      const keptSelectedIds = prevSelectedIds.filter((id) =>
        currentItemIds.includes(String(id))
      );

      return keptSelectedIds.length > 0 ? keptSelectedIds : currentItemIds;
    });

    await fetchProductDetailsForCart(safeItems);
  };

  const fetchCart = async () => {
    if (!userId) {
      setCart(null);
      setSelectedItemIds([]);
      setProductMap({});
      return;
    }

    setLoading(true);

    try {
      const response = await api.get(cartEndpoint.byUser(userId));
      const cartData = unwrapApiData(response);

      await applyCartData(cartData, false);
    } catch (error) {
      console.error("Lỗi khi tải giỏ hàng:", error);
      message.error("Không thể tải giỏ hàng.");
      setCart({
        id: null,
        userId,
        totalItems: 0,
        totalAmount: 0,
        items: [],
      });
      setSelectedItemIds([]);
      setProductMap({});
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    setLoadingCoupons(true);

    try {
      const response = await api.get(couponEndpoint.list);
      const couponData = unwrapApiData(response);

      setCoupons(Array.isArray(couponData) ? couponData : []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách coupon:", error);
      message.error("Không thể tải danh sách mã giảm giá.");
      setCoupons([]);
    } finally {
      setLoadingCoupons(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleOpenCouponModal = () => {
    if (selectedItems.length === 0 || subtotal <= 0) {
      message.warning("Vui lòng chọn sản phẩm trước khi chọn mã giảm giá.");
      return;
    }

    setCouponModalOpen(true);
    fetchCoupons();
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedItemIds(cartItems.map((item) => String(item.id)));
    } else {
      setSelectedItemIds([]);
    }
  };

  const handleSelectItem = (itemId) => {
    const normalizedId = String(itemId);

    setSelectedItemIds((prevIds) => {
      if (prevIds.includes(normalizedId)) {
        return prevIds.filter((id) => id !== normalizedId);
      }

      return [...prevIds, normalizedId];
    });
  };

  const handleUpdateQuantity = async (item, newQuantity) => {
    if (!userId || !item?.id) return;

    const quantity = Math.max(1, Number(newQuantity || 1));

    if (quantity === Number(item.quantity || 1)) {
      return;
    }

    setUpdatingItemId(String(item.id));

    try {
      const response = await api.put(cartEndpoint.item(userId, item.id), {
        quantity,
      });

      const updatedCart = unwrapApiData(response);
      await applyCartData(updatedCart, true);

      message.success("Đã cập nhật số lượng.");
    } catch (error) {
      console.error("Lỗi cập nhật số lượng:", error);
      message.error("Không thể cập nhật số lượng sản phẩm.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemoveItem = async (item) => {
    if (!userId || !item?.id) return;

    setDeletingItemId(String(item.id));

    try {
      const response = await api.delete(cartEndpoint.item(userId, item.id));
      const updatedCart = unwrapApiData(response);

      await applyCartData(updatedCart, true);
      message.success("Đã xóa sản phẩm khỏi giỏ hàng.");
    } catch (error) {
      console.error("Lỗi xóa sản phẩm khỏi giỏ hàng:", error);
      message.error("Không thể xóa sản phẩm khỏi giỏ hàng.");
    } finally {
      setDeletingItemId(null);
    }
  };

  const handleRemoveSelectedItems = async () => {
    if (!userId) return;

    if (selectedItems.length === 0) {
      message.warning("Vui lòng chọn sản phẩm cần xóa.");
      return;
    }

    setDeletingSelected(true);

    try {
      await Promise.all(
        selectedItems.map((item) =>
          api.delete(cartEndpoint.item(userId, item.id))
        )
      );

      await fetchCart();
      message.success("Đã xóa các sản phẩm đã chọn.");
    } catch (error) {
      console.error("Lỗi xóa các sản phẩm đã chọn:", error);
      message.error("Không thể xóa một số sản phẩm đã chọn.");
      fetchCart();
    } finally {
      setDeletingSelected(false);
    }
  };

  const handleClearCart = async () => {
    if (!userId) return;

    setClearingCart(true);

    try {
      const response = await api.delete(cartEndpoint.clear(userId));
      const updatedCart = unwrapApiData(response);

      await applyCartData(updatedCart, false);
      setAppliedCoupon(null);
      setDiscountAmount(0);
      setVoucherCode("");

      message.success("Đã xóa toàn bộ giỏ hàng.");
    } catch (error) {
      console.error("Lỗi xóa toàn bộ giỏ hàng:", error);
      message.error("Không thể xóa toàn bộ giỏ hàng.");
    } finally {
      setClearingCart(false);
    }
  };

  const handleApplyCoupon = async (codeInput = voucherCode) => {
    const code = String(codeInput || "").trim();

    if (!code) {
      message.warning("Vui lòng nhập hoặc chọn mã giảm giá.");
      return;
    }

    if (selectedItems.length === 0 || subtotal <= 0) {
      message.warning("Vui lòng chọn sản phẩm trước khi áp dụng mã giảm giá.");
      return;
    }

    setApplyingCoupon(true);
    setApplyingCouponCode(code);

    try {
      const response = await api.post(couponEndpoint.apply, {
        code,
        orderAmount: subtotal,
      });

      const result = unwrapApiData(response);

      if (response?.success === false || result?.isValid === false) {
        message.warning(
          getApiMessage(response, result?.message || "Mã giảm giá không hợp lệ.")
        );
        setAppliedCoupon(null);
        setDiscountAmount(0);
        return;
      }

      setAppliedCoupon(result);
      setDiscountAmount(Number(result?.discountAmount || 0));
      setVoucherCode(result?.code || code);
      setCouponModalOpen(false);

      message.success(result?.message || "Áp dụng mã giảm giá thành công.");
    } catch (error) {
      console.error("Lỗi áp dụng coupon:", error);
      message.error("Không thể áp dụng mã giảm giá.");
      setAppliedCoupon(null);
      setDiscountAmount(0);
    } finally {
      setApplyingCoupon(false);
      setApplyingCouponCode("");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setVoucherCode("");
    message.success("Đã bỏ mã giảm giá.");
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      message.warning("Vui lòng chọn sản phẩm cần thanh toán.");
      return;
    }

    const checkoutDraft = {
      cartId: cart?.id,
      selectedItemIds: selectedItems.map((item) => item.id),

      selectedItems: selectedItems.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        productVariantId: item.productVariantId,
        sku: item.sku,
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
        lineTotal: getItemLineTotal(item),
        attributes: item.attributes || {},
      })),

      subtotal,
      couponCode: appliedCoupon?.code || null,
      discountAmount,
      finalAmount: finalTotal,
    };

    sessionStorage.setItem("checkoutDraft", JSON.stringify(checkoutDraft));

    navigate("/checkout", {
      state: {
        checkoutDraft,
      },
    });
  };

  const handleGoToProductDetail = (productId) => {
    if (!productId) return;
    navigate(`/products/${productId}`);
  };

  if (!userId) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 pb-10 pt-24 md:px-8 md:pt-28">
        <div className="mx-auto max-w-6xl rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
          <ShoppingCartOutlined className="mb-4 text-5xl text-orange-500" />

          <Title level={2}>Bạn chưa đăng nhập</Title>

          <Paragraph className="mx-auto max-w-xl text-gray-500">
            Vui lòng đăng nhập để xem và quản lý giỏ hàng của bạn.
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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <ShoppingCartOutlined className="text-3xl" />
                <Title level={2} className="!mb-0 !text-white">
                  Giỏ hàng của tôi
                </Title>
              </div>

              <Text className="text-white/90">
                Kiểm tra sản phẩm, chọn mã giảm giá và chuẩn bị thanh toán.
              </Text>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Tag className="rounded-full px-4 py-1 text-base">
                {cartItems.length} sản phẩm
              </Tag>

              <Button
                icon={<ReloadOutlined />}
                loading={loading}
                onClick={fetchCart}
                className="!rounded-xl"
              >
                Làm mới
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[360px] items-center justify-center rounded-3xl bg-white shadow-sm">
            <Spin size="large" tip="Đang tải giỏ hàng..." />
          </div>
        ) : cartItems.length === 0 ? (
          <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
            <Empty
              description={
                <span className="text-gray-500">
                  Giỏ hàng của bạn đang trống.
                </span>
              }
            />

            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/supermarket")}
              className="mt-5 !rounded-xl !bg-orange-500 hover:!bg-orange-600"
            >
              Tiếp tục mua sắm
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
            <div className="space-y-5">
              <Card className="rounded-3xl border-0 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={
                      selectedItemIds.length > 0 &&
                      selectedItemIds.length < cartItems.length
                    }
                    onChange={handleSelectAll}
                  >
                    Chọn tất cả ({cartItems.length} sản phẩm)
                  </Checkbox>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Popconfirm
                      title="Xóa các sản phẩm đã chọn?"
                      description="Các sản phẩm này sẽ bị xóa khỏi giỏ hàng."
                      okText="Xóa"
                      cancelText="Hủy"
                      onConfirm={handleRemoveSelectedItems}
                      disabled={selectedItems.length === 0}
                    >
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        disabled={selectedItems.length === 0}
                        loading={deletingSelected}
                        className="!rounded-xl"
                      >
                        Xóa mục chọn
                      </Button>
                    </Popconfirm>

                    <Popconfirm
                      title="Xóa toàn bộ giỏ hàng?"
                      description="Tất cả sản phẩm trong giỏ hàng sẽ bị xóa."
                      okText="Xóa tất cả"
                      cancelText="Hủy"
                      onConfirm={handleClearCart}
                    >
                      <Button
                        danger
                        type="primary"
                        loading={clearingCart}
                        className="!rounded-xl"
                      >
                        Xóa tất cả
                      </Button>
                    </Popconfirm>
                  </div>
                </div>
              </Card>

              {cartItems.map((item) => {
                const product = productMap[String(item.productId)];
                const isSelected = selectedItemIds.includes(String(item.id));
                const isUpdating = updatingItemId === String(item.id);
                const isDeleting = deletingItemId === String(item.id);

                return (
                  <Card
                    key={item.id}
                    className="overflow-hidden rounded-3xl border-0 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                    styles={{
                      body: {
                        padding: 0,
                      },
                    }}
                  >
                    <div className="grid grid-cols-[130px_minmax(0,1fr)] gap-4 p-4 sm:grid-cols-[180px_minmax(0,1fr)]">
                      <div className="relative overflow-hidden rounded-2xl bg-orange-50">
                        <button
                          type="button"
                          onClick={() => handleGoToProductDetail(item.productId)}
                          className="block h-full w-full"
                        >
                          <Image
                            src={getProductImage(product)}
                            alt={item.productName}
                            fallback={PLACEHOLDER_IMAGE}
                            preview={false}
                            className="!h-36 !w-full !object-cover sm:!h-44"
                          />
                        </button>

                        <div className="absolute left-3 top-3">
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleSelectItem(item.id)}
                          />
                        </div>
                      </div>

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
                            title="Xóa sản phẩm này?"
                            description="Sản phẩm sẽ bị xóa khỏi giỏ hàng."
                            okText="Xóa"
                            cancelText="Hủy"
                            onConfirm={() => handleRemoveItem(item)}
                          >
                            <Button
                              danger
                              type="text"
                              icon={<DeleteOutlined />}
                              loading={isDeleting}
                            />
                          </Popconfirm>
                        </div>

                        <div className="mb-2 text-sm text-gray-500">
                          Phân loại: {getVariantLabel(item)}
                        </div>

                        {item.sku && (
                          <div className="mb-3 text-xs text-gray-500">
                            SKU: {item.sku}
                          </div>
                        )}

                        <div className="mb-4">
                          <Text className="text-xl font-bold !text-orange-600">
                            {formatCurrency(item.price)}
                          </Text>
                        </div>

                        <div className="mt-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="flex w-fit items-center rounded-xl border border-gray-200 bg-white">
                            <Button
                              type="text"
                              icon={<MinusOutlined />}
                              disabled={Number(item.quantity || 1) <= 1}
                              loading={isUpdating}
                              onClick={() =>
                                handleUpdateQuantity(
                                  item,
                                  Number(item.quantity || 1) - 1
                                )
                              }
                            />

                            <InputNumber
                              min={1}
                              value={Number(item.quantity || 1)}
                              controls={false}
                              onChange={(value) =>
                                handleUpdateQuantity(item, value)
                              }
                              className="!w-16 text-center"
                              disabled={isUpdating}
                            />

                            <Button
                              type="text"
                              icon={<PlusOutlined />}
                              loading={isUpdating}
                              onClick={() =>
                                handleUpdateQuantity(
                                  item,
                                  Number(item.quantity || 1) + 1
                                )
                              }
                            />
                          </div>

                          <div className="text-right">
                            <div className="text-xs text-gray-500">
                              Thành tiền
                            </div>

                            <Text className="text-lg font-bold !text-orange-600">
                              {formatCurrency(getItemLineTotal(item))}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="xl:sticky xl:top-28 xl:h-fit">
              <Card className="rounded-3xl border-0 shadow-sm">
                <Title level={3}>Tóm tắt đơn hàng</Title>

                <div className="mt-5 rounded-2xl bg-orange-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <Text strong>
                      <TagsOutlined className="mr-2 text-orange-500" />
                      Mã giảm giá
                    </Text>

                    <Button
                      type="link"
                      onClick={handleOpenCouponModal}
                      className="!px-0 !text-orange-600"
                    >
                      Xem mã giảm giá
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={voucherCode}
                      onChange={(event) => setVoucherCode(event.target.value)}
                      placeholder="Nhập mã coupon"
                      className="!rounded-xl"
                      disabled={applyingCoupon}
                    />

                    <Button
                      onClick={() => handleApplyCoupon(voucherCode)}
                      loading={applyingCoupon && !applyingCouponCode}
                      className="!rounded-xl"
                    >
                      Áp dụng
                    </Button>
                  </div>

                  {appliedCoupon ? (
                    <div className="mt-3 rounded-xl bg-white p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <Text strong className="!text-orange-600">
                            {appliedCoupon.code}
                          </Text>

                          <div className="text-xs text-gray-500">
                            Đã giảm {formatCurrency(discountAmount)}
                          </div>
                        </div>

                        <Button
                          size="small"
                          danger
                          type="text"
                          onClick={handleRemoveCoupon}
                        >
                          Bỏ mã
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-gray-500">
                      Có thể nhập tay hoặc chọn từ danh sách mã còn hạn.
                    </div>
                  )}
                </div>

                <Divider />

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <Text type="secondary">Sản phẩm đã chọn</Text>
                    <Text>{selectedItems.length}</Text>
                  </div>

                  <div className="flex justify-between">
                    <Text type="secondary">Tổng số lượng</Text>
                    <Text>{selectedQuantity}</Text>
                  </div>

                  <div className="flex justify-between">
                    <Text type="secondary">Tạm tính</Text>
                    <Text>{formatCurrency(subtotal)}</Text>
                  </div>

                  <div className="flex justify-between">
                    <Text type="secondary">Giảm giá</Text>
                    <Text className="!text-green-600">
                      -{formatCurrency(discountAmount)}
                    </Text>
                  </div>
                </div>

                <Divider />

                <div className="mb-5 flex items-center justify-between">
                  <Text strong>Tổng thanh toán</Text>

                  <Text className="text-2xl font-bold !text-orange-600">
                    {formatCurrency(finalTotal)}
                  </Text>
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<ArrowRightOutlined />}
                  disabled={selectedItems.length === 0}
                  onClick={handleCheckout}
                  className="!h-12 !rounded-xl !bg-orange-500 hover:!bg-orange-600"
                >
                  Tiến hành thanh toán
                </Button>

                <Button
                  block
                  size="large"
                  onClick={() => navigate("/supermarket")}
                  className="mt-3 !h-12 !rounded-xl"
                >
                  Tiếp tục mua sắm
                </Button>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <GiftOutlined className="text-orange-500" />
            <span>Chọn mã giảm giá</span>
          </div>
        }
        open={couponModalOpen}
        onCancel={() => setCouponModalOpen(false)}
        footer={null}
        width={760}
      >
        <div className="mb-4 rounded-2xl bg-orange-50 p-4 text-sm">
          <div className="flex justify-between">
            <Text type="secondary">Tạm tính sản phẩm đã chọn</Text>
            <Text strong>{formatCurrency(subtotal)}</Text>
          </div>
        </div>

        {loadingCoupons ? (
          <div className="flex min-h-[260px] items-center justify-center">
            <Spin tip="Đang tải mã giảm giá..." />
          </div>
        ) : visibleCoupons.length === 0 ? (
          <Empty description="Hiện chưa có mã giảm giá khả dụng." />
        ) : (
          <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
            {visibleCoupons.map((coupon) => {
              const eligibility = getCouponEligibility(coupon, subtotal);
              const isApplyingThis =
                applyingCoupon && applyingCouponCode === coupon.code;

              return (
                <div
                  key={coupon.id || coupon.code}
                  className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Tag color="orange" className="rounded-full px-3 py-1">
                          {coupon.code}
                        </Tag>

                        <Tag color={eligibility.tagColor}>
                          {eligibility.label}
                        </Tag>
                      </div>

                      <Title level={5} className="!mb-1">
                        {getCouponDiscountText(coupon)}
                        {coupon.maxDiscount
                          ? `, tối đa ${formatCurrency(coupon.maxDiscount)}`
                          : ""}
                      </Title>

                      <div className="text-sm text-gray-500">
                        Đơn tối thiểu:{" "}
                        {formatCurrency(coupon.minOrderValue || 0)}
                      </div>

                      <div className="text-sm text-gray-500">
                        Hạn dùng: {formatDate(coupon.endDate)}
                      </div>

                      {coupon.usageLimit !== null &&
                        coupon.usageLimit !== undefined && (
                          <div className="text-sm text-gray-500">
                            Đã dùng: {coupon.currentUsage || 0}/
                            {coupon.usageLimit}
                          </div>
                        )}
                    </div>

                    <Button
                      type="primary"
                      disabled={eligibility.disabled}
                      loading={isApplyingThis}
                      onClick={() => handleApplyCoupon(coupon.code)}
                      className="!rounded-xl !bg-orange-500 hover:!bg-orange-600"
                    >
                      Áp dụng
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CartPage;
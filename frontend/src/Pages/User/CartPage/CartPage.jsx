import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Checkbox,
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
  ShoppingTwoTone
} from "@ant-design/icons";
import { useNavigate, useOutletContext } from "react-router-dom";

import api from "../../../Apis/apiConfig";
import API_ENDPOINTS from "../../../Apis/apiEndpoints";
import { getAuthUser } from "../../../Utils/Auth";
import { notifyCartChanged } from "../../../Utils/CartEvents";

const { Title, Text } = Typography;

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
    return { disabled: true, label: "Không hoạt động", tagColor: "red" };
  }
  if (!isCouponInDateRange(coupon)) {
    return { disabled: true, label: "Hết hạn/Chưa áp dụng", tagColor: "red" };
  }
  if (!isCouponUsageAvailable(coupon)) {
    return { disabled: true, label: "Hết lượt", tagColor: "red" };
  }

  const minOrderValue = Number(coupon?.minOrderValue || 0);
  if (subtotal < minOrderValue) {
    return { disabled: true, label: `Cần mua thêm ${formatCurrency(minOrderValue - subtotal)}`, tagColor: "gold" };
  }

  return { disabled: false, label: "Khả dụng", tagColor: "green" };
};

const CartPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useOutletContext() || {};
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

  const isAllSelected = cartItems.length > 0 && selectedItemIds.length === cartItems.length;

  const subtotal = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + getItemLineTotal(item), 0);
  }, [selectedItems]);

  const selectedQuantity = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
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
      message.info("Giỏ hàng thay đổi, vui lòng áp dụng lại mã giảm giá.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  const fetchProductDetailsForCart = async (items) => {
    const productIds = [...new Set(items.map((item) => item.productId).filter(Boolean))];
    if (productIds.length === 0) {
      setProductMap({});
      return;
    }

    const result = {};
    await Promise.all(
      productIds.map(async (productId) => {
        try {
          const response = await api.get(productEndpoint.byId(productId));
          result[String(productId)] = unwrapApiData(response);
        } catch (error) {
          console.error("Lỗi chi tiết SP:", productId, error);
        }
      })
    );
    setProductMap(result);
  };

  const applyCartData = async (cartData, keepSelected = false) => {
    const safeCart = cartData || { id: null, userId, totalItems: 0, totalAmount: 0, items: [] };
    const safeItems = Array.isArray(safeCart.items) ? safeCart.items : [];
    
    setCart({ ...safeCart, items: safeItems });

    setSelectedItemIds((prev) => {
      if (!keepSelected) return safeItems.map((item) => String(item.id));
      const currentIds = safeItems.map((item) => String(item.id));
      const kept = prev.filter((id) => currentIds.includes(String(id)));
      return kept.length > 0 ? kept : currentIds;
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
      await applyCartData(unwrapApiData(response), false);
    } catch (error) {
      message.error("Không thể tải giỏ hàng.");
      setCart({ id: null, userId, totalItems: 0, totalAmount: 0, items: [] });
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
      setCoupons(Array.isArray(unwrapApiData(response)) ? unwrapApiData(response) : []);
    } catch (error) {
      message.error("Không thể tải mã giảm giá.");
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
      message.warning("Chọn sản phẩm trước khi chọn mã giảm giá.");
      return;
    }
    setCouponModalOpen(true);
    fetchCoupons();
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) setSelectedItemIds(cartItems.map((item) => String(item.id)));
    else setSelectedItemIds([]);
  };

  const handleSelectItem = (itemId) => {
    const normalizedId = String(itemId);
    setSelectedItemIds((prevIds) => {
      if (prevIds.includes(normalizedId)) return prevIds.filter((id) => id !== normalizedId);
      return [...prevIds, normalizedId];
    });
  };

  const handleUpdateQuantity = async (item, newQuantity) => {
    if (!userId || !item?.id) return;
    const quantity = Math.max(1, Number(newQuantity || 1));
    if (quantity === Number(item.quantity || 1)) return;

    setUpdatingItemId(String(item.id));
    try {
      const response = await api.put(cartEndpoint.item(userId, item.id), { quantity });
      const updatedCart = unwrapApiData(response);
      await applyCartData(updatedCart, true);
      notifyCartChanged(updatedCart);
    } catch (error) {
      message.error("Không thể cập nhật số lượng.");
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
      notifyCartChanged(updatedCart);
      message.success("Đã xóa sản phẩm khỏi giỏ.");
    } catch (error) {
      message.error("Không thể xóa sản phẩm.");
    } finally {
      setDeletingItemId(null);
    }
  };

  const handleRemoveSelectedItems = async () => {
    if (!userId) return;
    if (selectedItems.length === 0) {
      message.warning("Chọn sản phẩm cần xóa.");
      return;
    }
    setDeletingSelected(true);
    try {
      await Promise.all(selectedItems.map((item) => api.delete(cartEndpoint.item(userId, item.id))));
      await fetchCart();
      notifyCartChanged();
      message.success("Đã xóa các sản phẩm được chọn.");
    } catch (error) {
      message.error("Lỗi khi xóa nhiều sản phẩm.");
      fetchCart();
    } finally {
      setDeletingSelected(false);
    }
  };



  const handleApplyCoupon = async (codeInput = voucherCode) => {
    const code = String(codeInput || "").trim();
    if (!code) { message.warning("Nhập mã giảm giá."); return; }
    if (selectedItems.length === 0 || subtotal <= 0) { message.warning("Chọn sản phẩm trước."); return; }

    setApplyingCoupon(true);
    setApplyingCouponCode(code);
    try {
      const response = await api.post(couponEndpoint.apply, { code, orderAmount: subtotal });
      const result = unwrapApiData(response);

      if (response?.success === false || result?.isValid === false) {
        message.warning(getApiMessage(response, result?.message || "Mã không hợp lệ."));
        setAppliedCoupon(null);
        setDiscountAmount(0);
        return;
      }

      setAppliedCoupon(result);
      setDiscountAmount(Number(result?.discountAmount || 0));
      setVoucherCode(result?.code || code);
      setCouponModalOpen(false);
      message.success("Áp dụng mã thành công.");
    } catch (error) {
      message.error("Lỗi áp dụng mã giảm giá.");
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
    navigate("/checkout", { state: { checkoutDraft } });
  };

  if (!userId) {
    return (
      <div className={`min-h-[calc(100vh-80px)] px-4 pb-10 pt-24 md:px-8 md:pt-28 ${isDarkMode ? 'bg-slate-950' : 'bg-gradient-to-br from-orange-50 via-white to-amber-50'}`}>
        <div className={`mx-auto max-w-5xl rounded-3xl px-6 py-16 text-center shadow-sm border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
          <ShoppingCartOutlined className="mb-4 text-5xl text-orange-500" />
          <h2 className={`text-3xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Bạn chưa đăng nhập</h2>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Vui lòng đăng nhập để quản lý giỏ hàng.</p>
          <Button type="primary" size="large" onClick={() => navigate("/auth/login-register")} className="mt-6 !rounded-xl !bg-orange-500 hover:!bg-orange-600 border-0 font-bold px-8">
            Đăng nhập ngay
          </Button>
        </div>
      </div>
    );
  }

  // Common Card Style
  const cardClass = `rounded-2xl border transition-all duration-300 ${
    isDarkMode 
      ? 'bg-slate-900 border-slate-700 shadow-black/30 shadow-xl' 
      : 'bg-white border-gray-100 shadow-xl shadow-gray-200/40'
  }`;

  return (
    <div className={`min-h-[calc(100vh-80px)] px-2 sm:px-4 py-8 md:px-8 w-full bg-transparent`}>
      <div className="mx-auto w-full max-w-[1800px]">
        
        {/* COMPONENT: HERO BANNER */}
        <section className={`relative overflow-hidden rounded-3xl mb-8 min-h-[180px] md:min-h-[220px] flex items-center border ${
          isDarkMode ? 'border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.6)]' : 'border-orange-400 shadow-xl shadow-orange-500/10'
        }`}>
          {/* Background Image liên quan đến Shopping Cart */}
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1920&auto=format&fit=crop" 
              alt="Cart Background" 
              className="w-full h-full object-cover object-center"
            />
          </div>
          {/* Gradient Overlay L to R che mờ hoàn toàn banner */}
          <div className={`absolute inset-0 bg-gradient-to-r ${
            isDarkMode 
              ? 'from-slate-950 via-slate-950/80 to-slate-950/40' 
              : 'from-orange-600 via-orange-500/90 to-orange-400/40'
          }`}></div>
          
          <div className="relative z-10 p-6 md:p-10 w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-xl backdrop-blur-md ${isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-white/20 text-white'}`}>
                  <ShoppingTwoTone twoToneColor={isDarkMode ? "#f97316" : "#ffffff"} className="text-3xl" />
                </div>
                <h1 className="m-0 text-3xl md:text-4xl font-black tracking-tight text-white">Giỏ hàng của tôi</h1>
              </div>
              <p className="text-sm md:text-base text-white/90">
                Kiểm tra sản phẩm, áp dụng khuyến mãi và tiến hành thanh toán.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 shadow-sm">
                <span className="font-bold text-white text-sm">{cartItems.length} sản phẩm</span>
              </div>
              <Button 
                icon={<ReloadOutlined spin={loading} />} 
                loading={loading}
                onClick={fetchCart} 
                className="!h-10 !px-5 !rounded-xl !font-bold border-0 shadow-lg !bg-white !text-orange-600 hover:!bg-gray-100 transition-all"
              >
                Làm mới
              </Button>
            </div>
          </div>
        </section>

        {loading ? (
          <div className={`flex min-h-[360px] items-center justify-center rounded-3xl shadow-sm border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-white'}`}>
            <Spin size="large" tip="Đang tải giỏ hàng..." />
          </div>
        ) : cartItems.length === 0 ? (
          <div className={`rounded-3xl px-6 py-20 text-center shadow-sm border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'}`}>
            <Empty description={<span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Giỏ hàng của bạn đang trống.</span>} />
            <Button type="primary" size="large" onClick={() => navigate("/supermarket")} className="mt-6 !rounded-xl !bg-orange-500 hover:!bg-orange-600 border-0 font-bold px-8">
              Tiếp tục mua sắm
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 xl:gap-8">
            
            {/* CỘT TRÁI: DANH SÁCH ITEM */}
            <div className="space-y-6">
              
              {/* Action Bar / Select All */}
              <div className={`p-4 md:p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4 border backdrop-blur-xl sticky top-20 z-40 transition-colors ${
                isDarkMode ? 'bg-slate-900/80 border-slate-700 shadow-md' : 'bg-white/80 border-gray-200 shadow-sm'
              }`}>
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={selectedItemIds.length > 0 && selectedItemIds.length < cartItems.length}
                  onChange={handleSelectAll}
                  className={isDarkMode ? '[&_.ant-checkbox-inner]:border-slate-500 [&_.ant-checkbox-checked_.ant-checkbox-inner]:!bg-orange-500' : ''}
                >
                  <span className={`font-bold text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    Chọn tất cả ({cartItems.length})
                  </span>
                </Checkbox>
                <div className="flex gap-2 w-full md:w-auto">
                  <Popconfirm title={<span className={isDarkMode?'text-white':''}>Xóa sản phẩm đã chọn?</span>} okText="Xóa" cancelText="Hủy" onConfirm={handleRemoveSelectedItems} disabled={selectedItems.length === 0}>
                    <Button danger icon={<DeleteOutlined />} disabled={selectedItems.length === 0} loading={deletingSelected} className={`flex-1 md:flex-none !rounded-xl ${isDarkMode ? 'hover:!bg-red-500/20' : ''}`}>
                      Xóa mục chọn
                    </Button>
                  </Popconfirm>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const product = productMap[String(item.productId)];
                  const isSelected = selectedItemIds.includes(String(item.id));
                  const isUpdating = updatingItemId === String(item.id);

                  return (
                    <div key={item.id} className={`relative flex flex-col sm:flex-row gap-4 md:gap-6 p-4 md:p-5 rounded-2xl border transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-slate-800/80 border-slate-700 hover:border-orange-500 hover:bg-slate-800 shadow-black/20' 
                        : 'bg-white border-gray-100 hover:border-orange-300 shadow-sm hover:shadow-md'
                    }`}>
                      {/* Checkbox (Absolute on mobile, relative on desktop) */}
                      <div className="absolute top-4 left-4 sm:relative sm:top-0 sm:left-0 flex items-center h-24">
                        <Checkbox checked={isSelected} onChange={() => handleSelectItem(item.id)} className={`z-10 bg-white/50 dark:bg-slate-800/50 p-1 rounded backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none ${isDarkMode ? '[&_.ant-checkbox-inner]:border-slate-500 [&_.ant-checkbox-checked_.ant-checkbox-inner]:!bg-orange-500' : ''}`} />
                      </div>

                      {/* Image */}
                      <div 
                        onClick={() => navigate(`/products/${item.productId}`)} 
                        className={`w-full sm:w-28 h-28 flex-shrink-0 rounded-xl overflow-hidden border cursor-pointer group ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-100'}`}
                      >
                        <img src={getProductImage(product)} alt={item.productName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={(e) => e.currentTarget.src = PLACEHOLDER_IMAGE} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col min-w-0 py-1">
                        <div className="flex justify-between items-start gap-4 mb-1 pr-8">
                          <h3 
                            onClick={() => navigate(`/products/${item.productId}`)} 
                            className={`font-bold text-base md:text-lg line-clamp-2 leading-tight cursor-pointer transition-colors hover:text-orange-500 m-0 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}
                          >
                            {item.productName}
                          </h3>
                        </div>
                        
                        <div className={`text-xs md:text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          Phân loại: <span className="font-medium">{getVariantLabel(item)}</span>
                          <span className="mx-2">•</span>
                          SKU: <span className="font-mono">{item.sku || "N/A"}</span>
                        </div>

                        {/* Bottom Row: Price & Quantity */}
                        <div className="mt-auto flex flex-wrap items-end justify-between gap-4">
                          <div className={`flex items-center h-9 rounded-lg border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                            <button 
                              disabled={Number(item.quantity || 1) <= 1 || isUpdating}
                              onClick={() => handleUpdateQuantity(item, Number(item.quantity || 1) - 1)}
                              className={`w-9 h-full flex items-center justify-center transition-colors disabled:opacity-30 ${isDarkMode ? 'text-gray-400 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-200'}`}
                            >
                              <MinusOutlined className="text-xs" />
                            </button>
                            <div className={`w-12 h-full flex items-center justify-center font-bold text-sm border-x ${isDarkMode ? 'border-slate-700 text-white' : 'border-gray-200 text-gray-900'}`}>
                              {isUpdating ? <Spin size="small" /> : item.quantity}
                            </div>
                            <button 
                              disabled={isUpdating}
                              onClick={() => handleUpdateQuantity(item, Number(item.quantity || 1) + 1)}
                              className={`w-9 h-full flex items-center justify-center transition-colors ${isDarkMode ? 'text-gray-400 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-200'}`}
                            >
                              <PlusOutlined className="text-xs" />
                            </button>
                          </div>
                          
                          <div className="text-lg md:text-xl font-black text-orange-500 tracking-tight">
                            {formatCurrency(getItemLineTotal(item))}
                          </div>
                        </div>
                      </div>

                      {/* Delete Button (Absolute Top Right) */}
                      <Popconfirm title={<span className={isDarkMode?'text-white':''}>Xóa sản phẩm này?</span>} okText="Xóa" cancelText="Hủy" onConfirm={() => handleRemoveItem(item)}>
                        <button className={`absolute top-4 right-4 p-2 rounded-full transition-all flex items-center justify-center ${
                          isDarkMode ? 'text-gray-500 hover:bg-red-500/20 hover:text-red-400' : 'text-gray-400 hover:bg-red-50 hover:text-red-500'
                        }`}>
                          <DeleteOutlined className="text-base" />
                        </button>
                      </Popconfirm>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CỘT PHẢI: ORDER SUMMARY */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className={`${cardClass} p-6 relative overflow-hidden`}>
                {/* Decorative background blur */}
                {isDarkMode && <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/5 blur-3xl rounded-full pointer-events-none"></div>}
                
                <h2 className={`text-xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Order summary</h2>

                {/* Coupon Section */}
                <div className={`p-4 rounded-xl mb-6 backdrop-blur-md border ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50 border-gray-100'}`}>
                  <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <TagsOutlined className="mr-1" /> Mã giảm giá
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      placeholder="Nhập mã coupon"
                      disabled={applyingCoupon}
                      className={`!rounded-lg flex-1 ${isDarkMode ? '!bg-slate-800 !border-slate-600 !text-white placeholder:!text-gray-500' : ''}`}
                    />
                    <Button
                      type="primary"
                      onClick={() => handleApplyCoupon(voucherCode)}
                      loading={applyingCoupon && !applyingCouponCode}
                      className="!rounded-lg !bg-gray-800 hover:!bg-black border-0 font-bold"
                    >
                      Áp dụng
                    </Button>
                  </div>
                  
                  {appliedCoupon && (
                    <div className={`mt-3 p-3 rounded-lg border flex items-center justify-between ${isDarkMode ? 'bg-slate-800 border-orange-500/30' : 'bg-white border-orange-200 shadow-sm'}`}>
                      <div>
                        <div className="font-bold text-orange-500 text-sm">{appliedCoupon.code}</div>
                        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Đã giảm {formatCurrency(discountAmount)}</div>
                      </div>
                      <Button size="small" type="text" danger onClick={handleRemoveCoupon} className="text-xs">Bỏ mã</Button>
                    </div>
                  )}
                  <div className="mt-2 text-right">
                    <Button type="link" size="small" onClick={handleOpenCouponModal} className="!text-orange-500 !p-0 text-xs">
                      Xem danh sách mã khả dụng
                    </Button>
                  </div>
                </div>

                {/* Calculation Breakdown */}
                <div className="space-y-4 mb-6">
                  <div className={`flex justify-between items-center text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span>Tạm tính ({selectedQuantity} SP)</span>
                    <span className="font-bold">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className={`flex justify-between items-center text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span>Giảm giá</span>
                    <span className="font-bold text-emerald-500">-{formatCurrency(discountAmount)}</span>
                  </div>
                </div>

                <div className={`h-px w-full my-4 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>

                <div className="flex justify-between items-end mb-6">
                  <span className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tổng cộng</span>
                  <div className="text-right">
                    <span className="block text-2xl font-black text-orange-500 tracking-tight">{formatCurrency(finalTotal)}</span>
                    <span className={`text-[10px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>(Đã bao gồm VAT nếu có)</span>
                  </div>
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  disabled={selectedItems.length === 0}
                  onClick={handleCheckout}
                  className="!h-12 !rounded-xl !bg-orange-500 hover:!bg-orange-600 border-0 font-bold text-base shadow-lg shadow-orange-500/30"
                >
                  Tiến hành thanh toán <ArrowRightOutlined />
                </Button>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* COUPON MODAL: SỬA STYLE ĐỂ CHỮ MÀU ĐEN TRÊN NỀN SÁNG Ở CẢ 2 CHẾ ĐỘ */}
      <Modal
        title={<div className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}><GiftOutlined className="text-orange-500" /> Chọn mã giảm giá</div>}
        open={couponModalOpen}
        onCancel={() => setCouponModalOpen(false)}
        footer={null}
        width={600}
        className={isDarkMode ? 'dark-modal' : ''}
        styles={{ content: { backgroundColor: isDarkMode ? '#0f172a' : '#ffffff' }, header: { backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', borderBottom: isDarkMode ? '1px solid #334155' : '1px solid #f0f0f0' } }}
      >
        <div className={`mb-4 rounded-xl p-4 text-sm flex justify-between items-center ${isDarkMode ? 'bg-slate-800 text-gray-300' : 'bg-orange-50 text-gray-700'}`}>
          <span>Tạm tính sản phẩm đã chọn</span>
          <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(subtotal)}</span>
        </div>

        {loadingCoupons ? (
          <div className="flex min-h-[260px] items-center justify-center"><Spin /></div>
        ) : visibleCoupons.length === 0 ? (
          <Empty description={<span className={isDarkMode ? 'text-gray-500' : ''}>Hiện chưa có mã giảm giá khả dụng.</span>} />
        ) : (
          <div className="max-h-[400px] space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {visibleCoupons.map((coupon) => {
              const eligibility = getCouponEligibility(coupon, subtotal);
              const isApplyingThis = applyingCoupon && applyingCouponCode === coupon.code;

              return (
                <div key={coupon.id || coupon.code} className="rounded-xl border p-4 transition-all bg-white border-gray-200 hover:border-orange-500 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Tag color="orange" className="!m-0 font-bold px-2 py-0.5 border-0 bg-orange-500/10 text-orange-500">{coupon.code}</Tag>
                        {eligibility.disabled ? (
                          <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded font-bold">{eligibility.label}</span>
                        ) : (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded font-bold">Khả dụng</span>
                        )}
                      </div>
                      <h4 className="text-base font-black m-0 text-black">
                        {getCouponDiscountText(coupon)} {coupon.maxDiscount ? `(Tối đa ${formatCurrency(coupon.maxDiscount)})` : ""}
                      </h4>
                      <div className="text-xs mt-1 text-gray-800 font-medium">Đơn tối thiểu: {formatCurrency(coupon.minOrderValue || 0)}</div>
                      <div className="text-xs mt-0.5 text-gray-800 font-medium">HSD: {formatDate(coupon.endDate)}</div>
                    </div>
                    <Button
                      type="primary"
                      disabled={eligibility.disabled}
                      loading={isApplyingThis}
                      onClick={() => handleApplyCoupon(coupon.code)}
                      className="!rounded-lg !bg-gray-800 hover:!bg-black border-0 font-bold"
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
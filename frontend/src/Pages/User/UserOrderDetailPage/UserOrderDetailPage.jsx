import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Popconfirm,
  Spin,
  Timeline,
  Typography,
  message,
  Empty
} from "antd";
import {
  ArrowLeftOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  HomeOutlined,
  ReloadOutlined,
  ShoppingOutlined,
  StarOutlined,
  StopOutlined,
  EyeOutlined,
  ShoppingTwoTone,
  CheckCircleFilled
} from "@ant-design/icons";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";

import api from "../../../Apis/apiConfig";
import API_ENDPOINTS from "../../../Apis/apiEndpoints";
import { getAuthUser } from "../../../Utils/Auth";

const { Title, Text, Paragraph } = Typography;

// Định nghĩa hằng số ảnh placeholder tránh lỗi ReferenceError
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/500x500?text=MEGAMART+PRODUCT";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value || 0));
};

const formatDateTime = (value) => {
  if (!value) return "Không xác định";
  try {
    return new Date(value).toLocaleString("vi-VN");
  } catch {
    return "Không xác định";
  }
};

const extractData = (payload) => {
  if (payload?.data !== undefined) return payload.data;
  return payload;
};

const getShortId = (id) => {
  if (!id) return "N/A";
  return String(id).slice(0, 8).toUpperCase();
};

const getAddressText = (address) => {
  if (!address) return "Không có địa chỉ";
  return [
    address.street,
    address.ward,
    address.district,
    address.province,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
};

const getOrderStatusText = (status) => {
  const statusMap = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    PROCESSING: "Đang xử lý",
    SHIPPED: "Đang giao",
    DELIVERED: "Đã giao",
    CANCELLED: "Đã hủy",
  };
  return statusMap[status] || status || "Không xác định";
};

const getPaymentStatusText = (status) => {
  const statusMap = {
    PENDING: "Chờ thanh toán",
    PAID: "Đã thanh toán",
    FAILED: "Thanh toán thất bại",
    REFUNDED: "Đã hoàn tiền",
    CANCELLED: "Đã hủy",
  };
  return statusMap[status] || status || "Không xác định";
};

// Hàm lấy ảnh sản phẩm trong đơn hàng, nếu không có trả về ảnh placeholder
const getItemImage = (item) => {
  if (item?.productImage) return item.productImage;
  if (Array.isArray(item?.imageUrls) && item.imageUrls.length > 0) return item.imageUrls[0];
  if (item?.product?.imageUrls && item.product.imageUrls.length > 0) return item.product.imageUrls[0];
  return PLACEHOLDER_IMAGE;
};

// Custom Tailwind classes for Badges
const getOrderStatusBadgeClass = (status, isDarkMode) => {
  switch (status) {
    case 'PENDING':
      return isDarkMode ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'CONFIRMED':
      return isDarkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-100 text-blue-700 border-blue-200';
    case 'PROCESSING':
      return isDarkMode ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-purple-100 text-purple-700 border-purple-200';
    case 'SHIPPED':
      return isDarkMode ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-cyan-100 text-cyan-700 border-cyan-200';
    case 'DELIVERED':
      return isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'CANCELLED':
      return isDarkMode ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-100 text-red-700 border-red-200';
    default:
      return isDarkMode ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' : 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

const getPaymentStatusBadgeClass = (status, isDarkMode) => {
  switch (status) {
    case 'PENDING':
      return isDarkMode ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-100 text-orange-600 border-orange-200';
    case 'PAID':
      return isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'FAILED':
    case 'CANCELLED':
      return isDarkMode ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-100 text-red-700 border-red-200';
    case 'REFUNDED':
      return isDarkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-100 text-blue-700 border-blue-200';
    default:
      return isDarkMode ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' : 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

const getCurrentStep = (status) => {
  const stepMap = {
    PENDING: 0,
    CONFIRMED: 1,
    PROCESSING: 2,
    SHIPPED: 3,
    DELIVERED: 4,
    CANCELLED: 0,
  };
  return stepMap[status] ?? 0;
};

const canCancelOrder = (order) => {
  return ["PENDING", "CONFIRMED"].includes(order?.status);
};

const canReviewOrder = (order) => {
  return order?.status === "DELIVERED";
};

const canPaySepayOrder = (order) => {
  return order?.paymentMethod === "SEPAY" && order?.paymentStatus !== "PAID";
};

const getItemProductId = (item) => {
  return (
    item?.productId ||
    item?.product?.id ||
    item?.product?.productId ||
    item?.productVariant?.productId ||
    null
  );
};

const buildTrackingItems = (order, tracking, isDarkMode) => {
  const status = order?.status;
  const textColorClass = isDarkMode ? 'text-gray-300' : 'text-gray-700';
  const descColorClass = isDarkMode ? 'text-gray-400' : 'text-gray-500';

  if (tracking?.timeline && Array.isArray(tracking.timeline)) {
    return tracking.timeline.map((item) => ({
      children: (
        <div>
          <div className={`font-bold ${textColorClass}`}>{item.title || getOrderStatusText(item.status)}</div>
          <div className={`text-sm mt-1 ${descColorClass}`}>
            {item.description || "Đơn hàng đã được cập nhật trạng thái."}
          </div>
          {item.createdAt && (
            <div className={`text-xs mt-1 font-mono ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              {formatDateTime(item.createdAt)}
            </div>
          )}
        </div>
      ),
    }));
  }

  const baseItems = [
    { key: "PENDING", title: "Đơn hàng đã được tạo", description: "Hệ thống đã ghi nhận đơn hàng của bạn." },
    { key: "CONFIRMED", title: "Đơn hàng đã được xác nhận", description: "Người bán hoặc quản trị viên đã xác nhận đơn hàng." },
    { key: "PROCESSING", title: "Đơn hàng đang được xử lý", description: "Sản phẩm đang được chuẩn bị." },
    { key: "SHIPPED", title: "Đơn hàng đang giao", description: "Đơn hàng đã được bàn giao cho đơn vị vận chuyển." },
    { key: "DELIVERED", title: "Đơn hàng đã giao", description: "Bạn đã nhận được đơn hàng." },
  ];

  const currentIndex = getCurrentStep(status);

  return baseItems.slice(0, currentIndex + 1).map((item) => ({
    color: 'orange',
    children: (
      <div>
        <div className={`font-bold ${textColorClass}`}>{item.title}</div>
        <div className={`text-sm mt-1 ${descColorClass}`}>{item.description}</div>
      </div>
    ),
  }));
};

const UserOrderDetailPage = () => {
  const navigate = useNavigate();
  const { id: orderId } = useParams();
  const { isDarkMode } = useOutletContext();
  const authUser = getAuthUser();
  const userId = authUser?.id;

  const orderEndpoint = API_ENDPOINTS.orders || API_ENDPOINTS.order;

  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const items = useMemo(() => {
    return Array.isArray(order?.items) ? order.items : [];
  }, [order]);

  const trackingItems = useMemo(() => {
    return buildTrackingItems(order, tracking, isDarkMode);
  }, [order, tracking, isDarkMode]);

  const fetchOrderDetail = async () => {
    if (!userId || !orderId) return;
    setLoading(true);
    try {
      const response = await api.get(orderEndpoint.byId(orderId));
      const data = extractData(response);
      setOrder(data);
    } catch (error) {
      console.error("Lỗi tải chi tiết đơn hàng:", error);
      message.error("Không thể tải chi tiết đơn hàng.");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchTracking = async () => {
    if (!userId || !orderId || !orderEndpoint?.tracking) return;
    setLoadingTracking(true);
    try {
      const response = await api.get(orderEndpoint.tracking(orderId));
      const data = extractData(response);
      setTracking(data);
    } catch (error) {
      console.error("Lỗi tải tracking đơn hàng:", error);
      setTracking(null);
    } finally {
      setLoadingTracking(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
    fetchTracking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, userId]);

  const handleCancelOrder = async () => {
    if (!orderId) return;
    setCancelling(true);
    try {
      const response = await api.put(orderEndpoint.cancel(orderId));
      const updatedOrder = extractData(response);
      setOrder(updatedOrder);
      message.success("Đã hủy đơn hàng.");
    } catch (error) {
      console.error("Lỗi hủy đơn hàng:", error);
      message.error("Không thể hủy đơn hàng.");
    } finally {
      setCancelling(false);
    }
  };

  const handlePaySepay = () => {
    if (!order) return;
    navigate("/seapay", { state: { order } });
  };

  const handleReviewProduct = (item) => {
    const productId = getItemProductId(item);
    if (!productId) {
      message.warning("Không tìm thấy productId của sản phẩm này.");
      return;
    }
    navigate(`/products/${productId}`, {
      state: { focusReview: true, orderId: order?.id, orderItemId: item?.id },
    });
  };

  if (!userId) {
    return (
      <div className={`min-h-[calc(100vh-80px)] px-4 pb-10 pt-24 md:px-8 md:pt-28 ${isDarkMode ? 'bg-slate-950' : 'bg-gradient-to-br from-orange-50 via-white to-amber-50'}`}>
        <div className={`mx-auto max-w-5xl rounded-3xl px-6 py-16 text-center shadow-sm border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
          <ShoppingOutlined className="mb-4 text-5xl text-orange-500" />
          <h2 className={`text-3xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Bạn chưa đăng nhập</h2>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            Vui lòng đăng nhập để xem chi tiết đơn hàng.
          </p>
          <Button type="primary" size="large" onClick={() => navigate("/auth/login-register")} className="mt-6 !rounded-xl !bg-orange-500 hover:!bg-orange-600 border-0 font-bold px-8">
            Đăng nhập ngay
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-transparent">
        <Spin size="large" tip="Đang tải chi tiết đơn hàng..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[calc(100vh-80px)] px-4 pb-10 pt-24 md:px-8 md:pt-28 bg-transparent">
        <div className={`mx-auto max-w-5xl rounded-3xl px-6 py-20 text-center shadow-sm border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
          <Empty description={<span className={isDarkMode ? 'text-gray-400' : ''}>Không tìm thấy thông tin đơn hàng.</span>} />
          <Button type="primary" size="large" onClick={() => navigate("/orders")} className="mt-6 !rounded-xl !bg-orange-500 hover:!bg-orange-600 border-0 font-bold">
            Quay lại đơn hàng của tôi
          </Button>
        </div>
      </div>
    );
  }

  const isCancelled = order.status === "CANCELLED";
  const orderStepItems = [
    { key: "PENDING", title: "Chờ xác nhận" },
    { key: "CONFIRMED", title: "Đã xác nhận" },
    { key: "PROCESSING", title: "Đang xử lý" },
    { key: "SHIPPED", title: "Đang giao" },
    { key: "DELIVERED", title: "Đã giao" },
  ];
  const currentStepIndex = getCurrentStep(order.status);

  const cardClass = `rounded-2xl border transition-all duration-300 ${
    isDarkMode 
      ? 'bg-slate-900 border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.3)]' 
      : 'bg-white border-gray-200 shadow-xl shadow-gray-200/40'
  }`;

  return (
    <div className="min-h-[calc(100vh-80px)] px-2 sm:px-4 py-8 md:px-8 w-full bg-transparent">
      <div className="mx-auto w-full max-w-[1800px]">
        
        {/* COMPONENT: HERO BANNER - ẢNH HOÁ ĐƠN/ĐƠN HÀNG VỚI GRADIENT OVERLAY L TO R */}
        <section className={`relative overflow-hidden rounded-3xl mb-8 min-h-[220px] md:min-h-[260px] flex items-center border ${
          isDarkMode ? 'border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.6)]' : 'border-gray-200 shadow-xl shadow-orange-500/10'
        }`}>
          {/* Background Image liên quan mật thiết đến Hoá đơn / Chi tiết đơn hàng */}
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=1920&auto=format&fit=crop" 
              alt="Order Details Invoice Background" 
              className="w-full h-full object-cover object-center"
            />
          </div>
          {/* Gradient Overlay L to R */}
          <div className={`absolute inset-0 bg-gradient-to-r ${
            isDarkMode 
              ? 'from-slate-950 via-slate-950/90 to-transparent' 
              : 'from-orange-600 via-orange-500/95 to-transparent'
          }`}></div>
          
          <div className="relative z-10 p-6 md:p-10 lg:p-12 w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 text-sm font-bold font-mono rounded-lg border ${
                  isDarkMode ? 'bg-slate-800 text-orange-400 border-slate-600' : 'bg-white/20 text-white border-white/30 backdrop-blur-md'
                }`}>
                  #{getShortId(order.id)}
                </span>
                <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded border ${getOrderStatusBadgeClass(order.status, isDarkMode)}`}>
                  {getOrderStatusText(order.status)}
                </span>
                <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded border ${getPaymentStatusBadgeClass(order.paymentStatus, isDarkMode)}`}>
                  {getPaymentStatusText(order.paymentStatus)}
                </span>
              </div>
              
              <div>
                <h1 className="m-0 text-3xl md:text-4xl font-black tracking-tight text-white">
                  Chi tiết đơn hàng
                </h1>
                <div className="mt-2 text-sm font-medium text-white/90 flex items-center gap-1.5">
                  <FileTextOutlined /> Ngày tạo: {formatDateTime(order.createdAt)}
                </div>
              </div>
            </div>
            
            <div className="relative z-10 flex flex-wrap gap-3">
              <button 
                onClick={() => navigate("/orders")} 
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm ${
                  isDarkMode 
                    ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600' 
                    : 'bg-white text-orange-600 border-0 hover:bg-gray-50'
                }`}
              >
                <ArrowLeftOutlined /> Trở về
              </button>
              <button 
                onClick={fetchOrderDetail}
                disabled={loading}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm ${
                  isDarkMode 
                    ? 'bg-slate-800 text-white border border-slate-600 hover:bg-slate-700 hover:border-orange-500' 
                    : 'bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white'
                }`}
              >
                <ReloadOutlined spin={loading} /> Làm mới
              </button>
            </div>
          </div>
        </section>

        {/* BỐ CỤC CHÍNH 2 CỘT */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          
          {/* CỘT TRÁI (STATUS + ITEMS + ADDRESS) */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* 1. ORDER STATUS STEPPER */}
            <section className={`${cardClass} p-6 lg:p-8`}>
              <h2 className={`text-xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Trạng thái đơn hàng</h2>
              
              {isCancelled ? (
                <div className={`rounded-2xl p-5 flex items-center gap-4 border ${isDarkMode ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-200 text-red-600'}`}>
                  <StopOutlined className="text-2xl" />
                  <div>
                    <strong className="block text-lg">Đơn hàng đã được hủy</strong>
                    <span className="text-sm opacity-80">Giao dịch đã đóng và không thể tiếp tục xử lý.</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  {orderStepItems.map((step, index) => {
                    const isDone = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;

                    let boxClass = isDarkMode ? 'bg-slate-800 border-slate-700 opacity-60' : 'bg-gray-50 border-gray-200 opacity-60';
                    let circleClass = isDarkMode ? 'bg-slate-700 text-gray-500' : 'bg-gray-200 text-gray-500';
                    let textClass = isDarkMode ? 'text-gray-500' : 'text-gray-500';

                    if (isCurrent) {
                      boxClass = isDarkMode ? 'bg-orange-500/10 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.15)]' : 'bg-orange-50 border-orange-500 shadow-sm';
                      circleClass = 'bg-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.4)]';
                      textClass = isDarkMode ? 'text-orange-400' : 'text-orange-600';
                    } else if (isDone) {
                      boxClass = isDarkMode ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-emerald-50 border-emerald-200';
                      circleClass = 'bg-emerald-500 text-white';
                      textClass = isDarkMode ? 'text-emerald-400' : 'text-emerald-600';
                    }

                    return (
                      <div key={step.key} className={`flex-1 relative rounded-xl p-4 flex flex-col items-center justify-center text-center gap-3 border transition-all duration-300 ${boxClass}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-all ${circleClass}`}>
                          {isDone ? <CheckCircleFilled /> : index + 1}
                        </div>
                        <span className={`font-bold text-sm ${textClass}`}>{step.title}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 2. SẢN PHẨM TRONG ĐƠN */}
            <section className={`${cardClass} p-6 lg:p-8`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-xl font-black m-0 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Sản phẩm trong đơn</h2>
                <span className={`text-sm font-bold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{items.length} sản phẩm</span>
              </div>
              
              <div className={`rounded-2xl border overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                {items.map((item, index) => {
                  const productId = getItemProductId(item);
                  const canReviewThisItem = canReviewOrder(order) && Boolean(productId);
                  const isLast = index === items.length - 1;

                  return (
                    <div key={item.id || index} className={`p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center transition-colors ${
                      !isLast ? (isDarkMode ? 'border-b border-slate-700' : 'border-b border-gray-200') : ''
                    } ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-orange-50/50'}`}>
                      
                      {/* Fix triệt để lỗi ReferenceError bằng cách dùng hàm helper getItemImage */}
                      <div className="w-full sm:w-24 h-24 bg-white dark:bg-slate-800 flex-shrink-0 rounded-xl overflow-hidden border border-gray-100 dark:border-slate-700 shadow-sm">
                        <img 
                          src={getItemImage(item)} 
                          alt={item.productName} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      
                      <div className="flex-1 w-full">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                          <div>
                            <div className={`flex items-center gap-2 mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              <ShoppingTwoTone twoToneColor="#f97316" />
                              <h3 className={`font-bold text-base line-clamp-1 m-0 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {item.productName}
                              </h3>
                            </div>
                            <p className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              SKU: <span className="font-mono">{item.sku || "N/A"}</span> &bull; Số lượng: <strong className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{item.quantity}</strong>
                            </p>
                            <p className={`text-sm m-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Đơn giá: {formatCurrency(item.price)}
                            </p>
                          </div>
                          
                          <div className="flex flex-col items-start sm:items-end gap-2 mt-2 sm:mt-0">
                            <span className="font-black text-lg text-orange-500">
                              {formatCurrency(item.lineTotal || (Number(item.price || 0) * Number(item.quantity || 0)))}
                            </span>
                            <div className="flex gap-2">
                              {productId && (
                                <Button size="small" onClick={() => navigate(`/products/${productId}`)} className={`!rounded-lg text-xs ${isDarkMode ? '!bg-slate-800 !text-gray-300 !border-slate-600 hover:!text-orange-400 hover:!border-orange-500' : ''}`}>
                                  Xem sản phẩm
                                </Button>
                              )}
                              {canReviewOrder(order) && (
                                <Button 
                                  size="small" 
                                  type="primary" 
                                  icon={<StarOutlined />} 
                                  disabled={!canReviewThisItem}
                                  onClick={() => handleReviewProduct(item)}
                                  className="!rounded-lg text-xs !bg-orange-500 hover:!bg-orange-600 border-0"
                                >
                                  Đánh giá
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 3. ĐỊA CHỈ NHẬN HÀNG */}
            <section className={`${cardClass} p-6 lg:p-8`}>
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-xl ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                  <HomeOutlined className="text-xl" />
                </div>
                <h2 className={`text-xl font-black m-0 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Địa chỉ nhận hàng</h2>
              </div>
              
              <div className={`rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                <div className={`flex flex-col sm:flex-row border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                  <div className={`sm:w-1/3 p-4 font-bold text-sm ${isDarkMode ? 'text-gray-400 bg-slate-800/50' : 'text-gray-500 bg-gray-100/50'}`}>Người nhận</div>
                  <div className={`sm:w-2/3 p-4 font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{order.address?.recipientName || "Không có"}</div>
                </div>
                <div className={`flex flex-col sm:flex-row border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                  <div className={`sm:w-1/3 p-4 font-bold text-sm ${isDarkMode ? 'text-gray-400 bg-slate-800/50' : 'text-gray-500 bg-gray-100/50'}`}>Số điện thoại</div>
                  <div className={`sm:w-2/3 p-4 font-mono font-medium tracking-wide ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{order.address?.recipientPhone || "Không có"}</div>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <div className={`sm:w-1/3 p-4 font-bold text-sm ${isDarkMode ? 'text-gray-400 bg-slate-800/50' : 'text-gray-500 bg-gray-100/50'}`}>Địa chỉ</div>
                  <div className={`sm:w-2/3 p-4 font-medium leading-relaxed ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{getAddressText(order.address)}</div>
                </div>
              </div>
            </section>
          </div>

          {/* CỘT PHẢI (SUMMARY + ACTIONS + TRACKING) */}
          <div className="space-y-6 xl:sticky xl:top-28 xl:h-fit">
            
            {/* PAYMENT SUMMARY */}
            <section className={`${cardClass} p-6 lg:p-8`}>
              <h2 className={`text-xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tóm tắt thanh toán</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tạm tính</span>
                  <span className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{formatCurrency(order.subTotal)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Mã giảm giá</span>
                  <span className={`font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{order.couponCode || "Không áp dụng"}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Giảm giá</span>
                  <span className="font-bold text-emerald-500">-{formatCurrency(order.discountAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Phương thức</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${isDarkMode ? 'bg-slate-700 text-gray-200' : 'bg-gray-100 text-gray-700'}`}>
                    {order.paymentMethod || "N/A"}
                  </span>
                </div>
                <div className={`flex justify-between items-center text-sm pt-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Thanh toán</span>
                  <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded border ${getPaymentStatusBadgeClass(order.paymentStatus, isDarkMode)}`}>
                    {getPaymentStatusText(order.paymentStatus)}
                  </span>
                </div>
              </div>

              <div className={`flex justify-between items-center pt-5 border-t mb-6 ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <span className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tổng thanh toán</span>
                <span className="text-2xl font-black text-orange-500 tracking-tight">{formatCurrency(order.totalAmount)}</span>
              </div>

              <div className="flex flex-col gap-3">
                {canPaySepayOrder(order) && (
                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<CreditCardOutlined />}
                    onClick={handlePaySepay}
                    className="!h-12 !rounded-xl !font-bold !bg-orange-500 hover:!bg-orange-600 border-0 shadow-lg shadow-orange-500/30"
                  >
                    Thanh toán Sepay
                  </Button>
                )}
                
                {canCancelOrder(order) && (
                  <Popconfirm
                    title={<span className={isDarkMode ? 'text-white' : ''}>Hủy đơn hàng?</span>}
                    description={<span className={isDarkMode ? 'text-gray-400' : ''}>Chỉ nên hủy khi đơn chưa được xử lý/giao hàng.</span>}
                    okText="Hủy đơn"
                    cancelText="Không"
                    okButtonProps={{ danger: true }}
                    onConfirm={handleCancelOrder}
                  >
                    <Button danger block size="large" icon={<StopOutlined />} loading={cancelling} className={`!h-12 !rounded-xl !font-bold ${isDarkMode ? 'hover:!bg-red-500/10' : ''}`}>
                      Hủy đơn hàng
                    </Button>
                  </Popconfirm>
                )}

                <Button
                  block
                  size="large"
                  onClick={() => navigate("/supermarket")}
                  className={`!h-12 !rounded-xl !font-bold ${
                    isDarkMode 
                      ? '!bg-slate-800 !text-gray-300 !border-slate-600 hover:!border-orange-500 hover:!text-orange-400' 
                      : 'text-gray-700 hover:text-orange-600 hover:border-orange-500'
                  }`}
                >
                  Tiếp tục mua sắm
                </Button>
              </div>
            </section>

            {/* TRACKING TIMELINE */}
            <section className={`${cardClass} p-6 lg:p-8`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-black m-0 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Theo dõi đơn hàng</h2>
                <Button
                  size="small"
                  type="text"
                  icon={<ReloadOutlined />}
                  loading={loadingTracking}
                  onClick={fetchTracking}
                  className={isDarkMode ? 'text-gray-400 hover:text-orange-400' : 'text-gray-500 hover:text-orange-600'}
                >
                  Tải lại
                </Button>
              </div>

              {loadingTracking ? (
                <div className="py-10 text-center"><Spin /></div>
              ) : (
                <div className={`pt-2 ${isDarkMode ? '[&_.ant-timeline-item-tail]:!border-slate-600' : ''}`}>
                  <Timeline items={trackingItems} />
                </div>
              )}
            </section>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserOrderDetailPage;
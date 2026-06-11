import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Empty,
  Input,
  Popconfirm,
  Select,
  Spin,
  Timeline,
  message,
} from "antd";
import {
  EyeOutlined,
  FileTextOutlined,
  ReloadOutlined,
  SearchOutlined,
  ShoppingOutlined,
  SortAscendingOutlined,
  StopOutlined,
  ShoppingTwoTone,
  LeftOutlined,
  RightOutlined
} from "@ant-design/icons";
import { useNavigate, useOutletContext } from "react-router-dom";

import api from "../../../Apis/apiConfig";
import API_ENDPOINTS from "../../../Apis/apiEndpoints";
import { getAuthUser } from "../../../Utils/Auth";

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

// Custom Tailwind classes for Order Status Badge
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

// Custom Tailwind classes for Payment Status Badge
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

const canCancelOrder = (order) => {
  return ["PENDING", "CONFIRMED"].includes(order?.status);
};

const SORT_OPTIONS = [
  { value: "createdAt_desc", label: "Mới nhất" },
  { value: "createdAt_asc", label: "Cũ nhất" },
  { value: "totalAmount_desc", label: "Tổng tiền cao nhất" },
  { value: "totalAmount_asc", label: "Tổng tiền thấp nhất" },
  { value: "status_asc", label: "Trạng thái đơn A-Z" },
  { value: "paymentStatus_asc", label: "Trạng thái thanh toán A-Z" },
  { value: "paymentMethod_asc", label: "Phương thức thanh toán A-Z" },
];

const getOrderTime = (order) => {
  const timestamp = new Date(order?.createdAt || 0).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

const getSortValue = (order, key) => {
  switch (key) {
    case "createdAt":
      return getOrderTime(order);
    case "totalAmount":
      return Number(order?.totalAmount || 0);
    case "status":
      return getOrderStatusText(order?.status);
    case "paymentStatus":
      return getPaymentStatusText(order?.paymentStatus);
    case "paymentMethod":
      return order?.paymentMethod || "";
    default:
      return "";
  }
};

const UserOrderListPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useOutletContext() || {};
  const authUser = getAuthUser();
  const userId = authUser?.id;

  const orderEndpoint = API_ENDPOINTS.orders || API_ENDPOINTS.order;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOption, setSortOption] = useState("createdAt_desc");

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // Số lượng đơn hàng hiển thị trên 1 trang

  // Reset trang về 1 mỗi khi đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [keyword, statusFilter, sortOption]);

  const filteredOrders = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    const filtered = orders.filter((order) => {
      const matchStatus =
        statusFilter === "ALL" || String(order.status) === statusFilter;

      const matchKeyword =
        !normalizedKeyword ||
        String(order.id || "").toLowerCase().includes(normalizedKeyword) ||
        String(order.couponCode || "").toLowerCase().includes(normalizedKeyword) ||
        String(order.paymentMethod || "").toLowerCase().includes(normalizedKeyword);

      return matchStatus && matchKeyword;
    });

    const [sortKey, sortDirection] = sortOption.split("_");

    return [...filtered].sort((firstOrder, secondOrder) => {
      const firstValue = getSortValue(firstOrder, sortKey);
      const secondValue = getSortValue(secondOrder, sortKey);

      if (typeof firstValue === "number" && typeof secondValue === "number") {
        return sortDirection === "desc"
          ? secondValue - firstValue
          : firstValue - secondValue;
      }

      const result = String(firstValue).localeCompare(
        String(secondValue),
        "vi-VN"
      );

      return sortDirection === "desc" ? -result : result;
    });
  }, [orders, keyword, statusFilter, sortOption]);

  // Cắt mảng để lấy đơn hàng theo trang hiện tại
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredOrders.slice(startIndex, startIndex + pageSize);
  }, [filteredOrders, currentPage]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize);

  const fetchOrders = async () => {
    if (!userId) {
      setOrders([]);
      return;
    }

    setLoading(true);

    try {
      const response = await api.get(orderEndpoint.list);
      const data = extractData(response);

      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi tải danh sách đơn hàng:", error);
      message.error("Không thể tải danh sách đơn hàng.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleCancelOrder = async (orderId) => {
    if (!orderId) return;

    setCancellingId(String(orderId));

    try {
      const response = await api.put(orderEndpoint.cancel(orderId));
      const updatedOrder = extractData(response);

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          String(order.id) === String(orderId) ? updatedOrder : order
        )
      );

      message.success("Đã hủy đơn hàng.");
    } catch (error) {
      console.error("Lỗi hủy đơn hàng:", error);
      message.error("Không thể hủy đơn hàng.");
    } finally {
      setCancellingId(null);
    }
  };

  const handleGoToDetail = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const popupDarkClass = isDarkMode 
    ? "!bg-slate-800 [&_.ant-select-item]:!text-gray-200 [&_.ant-select-item-option-selected]:!bg-orange-500/20 [&_.ant-select-item-option-selected]:!text-orange-400 [&_.ant-select-item-option-active]:!bg-slate-700" 
    : "";

  if (!userId) {
    return (
      <div className={`min-h-[calc(100vh-80px)] px-4 pb-10 pt-24 md:px-8 md:pt-28 ${isDarkMode ? 'bg-slate-950' : 'bg-gradient-to-br from-orange-50 via-white to-amber-50'}`}>
        <div className={`mx-auto max-w-5xl rounded-3xl px-6 py-16 text-center shadow-sm border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
          <ShoppingOutlined className="mb-4 text-5xl text-orange-500" />
          <h2 className={`text-3xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Bạn chưa đăng nhập</h2>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
            Vui lòng đăng nhập để xem đơn hàng của bạn.
          </p>
          <Button
            type="primary"
            size="large"
            onClick={() => navigate("/auth/login-register")}
            className="mt-6 !rounded-xl !bg-orange-500 hover:!bg-orange-600 border-0 font-bold px-8"
          >
            Đăng nhập ngay
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-[calc(100vh-80px)] px-2 sm:px-4 py-8 md:px-8 w-full bg-transparent`}>
      <div className="mx-auto w-full max-w-[1800px]">
        
        {/* COMPONENT: HERO BANNER (IMAGE VỚI GRADIENT OVERLAY L TO R) */}
        <section className={`relative overflow-hidden rounded-3xl mb-8 min-h-[220px] md:min-h-[260px] flex items-center border ${
          isDarkMode ? 'border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.6)]' : 'border-orange-400 shadow-xl shadow-orange-500/10'
        }`}>
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1920&auto=format&fit=crop" 
              alt="Order Logistics Background" 
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
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-xl backdrop-blur-md ${isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-white/20 text-white'}`}>
                  <ShoppingTwoTone twoToneColor={isDarkMode ? "#f97316" : "#ffffff"} className="text-3xl" />
                </div>
                <h1 className="m-0 text-3xl md:text-4xl font-black tracking-tight text-white">
                  Đơn hàng của tôi
                </h1>
              </div>
              <p className="text-base md:text-lg text-white/90">
                Theo dõi trạng thái đơn hàng, thanh toán và lịch sử mua sắm.
              </p>
            </div>
            
            <button 
              onClick={fetchOrders}
              disabled={loading}
              className={`relative z-10 rounded-xl px-5 py-2.5 font-bold flex items-center gap-2 transition-all shadow-sm ${
                isDarkMode 
                  ? 'bg-slate-800 text-white border border-slate-600 hover:bg-slate-700 hover:border-orange-500' 
                  : 'bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white'
              }`}
            >
              <ReloadOutlined spin={loading} /> Làm mới
            </button>
          </div>
        </section>

        {/* COMPONENT: BỘ LỌC (FILTERS) */}
        <section className={`mb-8 p-4 md:p-5 rounded-2xl flex flex-col md:flex-row gap-4 border transition-all duration-300 ${
          isDarkMode ? 'bg-slate-800 border-slate-700 shadow-xl' : 'bg-white border-gray-200 shadow-sm shadow-gray-200/50'
        }`}>
          <div className="relative flex-1">
            <Input
              size="large"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              prefix={<SearchOutlined className={isDarkMode ? 'text-gray-400' : 'text-gray-400'} />}
              placeholder="Tìm theo mã đơn, phương thức thanh toán..."
              allowClear
              className={isDarkMode ? '!bg-slate-900 !border-slate-700 !text-white placeholder:!text-gray-500 hover:!border-orange-500 focus:!border-orange-500' : 'hover:!border-orange-500 focus:!border-orange-500'}
            />
          </div>
          <div className="flex gap-4 shrink-0 flex-col sm:flex-row">
            <Select
              size="large"
              value={statusFilter}
              onChange={setStatusFilter}
              popupClassName={popupDarkClass}
              className={`w-full sm:min-w-[180px] ${isDarkMode ? '[&_.ant-select-selector]:!bg-slate-900 [&_.ant-select-selector]:!border-slate-700 [&_.ant-select-selection-item]:!text-white [&_.ant-select-arrow]:!text-gray-400 hover:[&_.ant-select-selector]:!border-orange-500' : ''}`}
              options={[
                { value: "ALL", label: "Tất cả trạng thái" },
                { value: "PENDING", label: "Chờ xác nhận" },
                { value: "CONFIRMED", label: "Đã xác nhận" },
                { value: "PROCESSING", label: "Đang xử lý" },
                { value: "SHIPPED", label: "Đang giao" },
                { value: "DELIVERED", label: "Đã giao" },
                { value: "CANCELLED", label: "Đã hủy" },
              ]}
            />
            <Select
              size="large"
              value={sortOption}
              onChange={setSortOption}
              popupClassName={popupDarkClass}
              className={`w-full sm:min-w-[220px] ${isDarkMode ? '[&_.ant-select-selector]:!bg-slate-900 [&_.ant-select-selector]:!border-slate-700 [&_.ant-select-selection-item]:!text-white [&_.ant-select-arrow]:!text-gray-400 hover:[&_.ant-select-selector]:!border-orange-500' : ''}`}
              suffixIcon={<SortAscendingOutlined className={isDarkMode ? 'text-gray-400' : ''} />}
              options={SORT_OPTIONS}
            />
          </div>
        </section>

        {/* DANH SÁCH ĐƠN HÀNG VÀ PHÂN TRANG */}
        {loading ? (
          <div className={`flex min-h-[360px] items-center justify-center rounded-3xl shadow-sm border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-white'}`}>
            <Spin size="large" tip="Đang tải đơn hàng..." />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className={`rounded-3xl px-6 py-20 text-center shadow-sm border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-white'}`}>
            <Empty description={<span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Chưa có đơn hàng phù hợp.</span>} />
            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/supermarket")}
              className="mt-6 !rounded-xl !bg-orange-500 hover:!bg-orange-600 border-0 font-bold px-8"
            >
              Mua sắm ngay
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {paginatedOrders.map((order) => {
              const items = Array.isArray(order.items) ? order.items : [];
              const firstItems = items.slice(0, 3);
              const remainingCount = Math.max(items.length - firstItems.length, 0);

              return (
                /* ORDER CARD - PREMIUM STYLE */
                <article
                  key={order.id}
                  className={`rounded-2xl p-5 md:p-6 flex flex-col lg:flex-row gap-6 border transition-all duration-300 hover:shadow-xl ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-700 hover:border-orange-500 shadow-black/20' 
                      : 'bg-white border-gray-100 hover:border-orange-300 shadow-sm shadow-gray-200/50'
                  }`}
                >
                  {/* Cột Trái: Thông tin chung & Sản phẩm */}
                  <div className="flex-1 space-y-5">
                    {/* Order Header (Tags & Date) */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-2.5 py-1 text-sm font-bold font-mono rounded border ${
                        isDarkMode ? 'bg-slate-700 text-orange-400 border-slate-600' : 'bg-orange-50 text-orange-600 border-orange-100'
                      }`}>
                        #{getShortId(order.id)}
                      </span>
                      
                      <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded border ${getOrderStatusBadgeClass(order.status, isDarkMode)}`}>
                        {getOrderStatusText(order.status)}
                      </span>

                      <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded border ${getPaymentStatusBadgeClass(order.paymentStatus, isDarkMode)}`}>
                        {getPaymentStatusText(order.paymentStatus)}
                      </span>

                      <span className={`px-2.5 py-1 text-xs font-bold rounded border ${
                        isDarkMode ? 'bg-slate-900 text-gray-300 border-slate-700' : 'bg-gray-100 text-gray-600 border-gray-200'
                      }`}>
                        {order.paymentMethod || "N/A"}
                      </span>
                      
                      <div className={`w-full md:w-auto md:ml-auto text-sm font-medium mt-2 md:mt-0 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Ngày tạo: {formatDateTime(order.createdAt)}
                      </div>
                    </div>

                    {/* Line Items */}
                    <div className="space-y-3">
                      {firstItems.map((item) => (
                        <div
                          key={item.id}
                          className={`rounded-xl p-4 flex justify-between items-center group transition-colors ${
                            isDarkMode ? 'bg-slate-900 hover:bg-slate-700/50' : 'bg-gray-50 hover:bg-orange-50/50'
                          }`}
                        >
                          <div className="min-w-0 pr-4">
                            <h4 className={`text-base font-semibold line-clamp-1 transition-colors ${
                              isDarkMode ? 'text-gray-200 group-hover:text-orange-400' : 'text-gray-800 group-hover:text-orange-600'
                            }`}>
                              {item.productName}
                            </h4>
                            <div className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                              SKU: <span className="font-mono">{item.sku || "Không có"}</span> &bull; SL: <span className="font-bold">{item.quantity}</span>
                            </div>
                          </div>
                          <div className={`whitespace-nowrap font-bold ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                            {formatCurrency(item.lineTotal)}
                          </div>
                        </div>
                      ))}

                      {remainingCount > 0 && (
                        <div className={`rounded-xl px-4 py-3 text-sm font-medium text-center cursor-pointer transition-colors ${
                          isDarkMode ? 'bg-slate-900 text-orange-400 hover:bg-slate-700' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                        }`} onClick={() => handleGoToDetail(order.id)}>
                          +{remainingCount} sản phẩm khác (Xem chi tiết)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cột Phải: Summary & Actions */}
                  <div className={`lg:w-80 shrink-0 flex flex-col gap-4 pt-4 lg:pt-0 lg:pl-6 border-t lg:border-t-0 lg:border-l ${
                    isDarkMode ? 'border-slate-700' : 'border-gray-200'
                  }`}>
                    {/* Bill Summary Box */}
                    <div className={`rounded-xl p-5 space-y-3 ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
                      <div className={`flex justify-between items-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span>Tạm tính</span>
                        <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{formatCurrency(order.subTotal)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Giảm giá</span>
                        <span className="text-emerald-500 font-medium">-{formatCurrency(order.discountAmount)}</span>
                      </div>
                      
                      <div className={`h-px w-full my-2 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
                      
                      <div className="flex justify-between items-center">
                        <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tổng tiền</span>
                        <span className="text-xl font-black text-orange-500 tracking-tight">{formatCurrency(order.totalAmount)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto space-y-3">
                      <Button
                        icon={<EyeOutlined />}
                        onClick={() => handleGoToDetail(order.id)}
                        className={`w-full !h-11 !rounded-xl !font-bold ${
                          isDarkMode 
                            ? '!bg-transparent !text-gray-200 !border-slate-600 hover:!border-orange-500 hover:!text-orange-400' 
                            : '!bg-transparent !text-gray-700 !border-gray-300 hover:!border-orange-500 hover:!text-orange-600 hover:!bg-orange-50/50'
                        }`}
                      >
                        Xem chi tiết
                      </Button>

                      {canCancelOrder(order) && (
                        <Popconfirm
                          title={<span className={isDarkMode ? 'text-white' : ''}>Hủy đơn hàng?</span>}
                          description={<span className={isDarkMode ? 'text-gray-400' : ''}>Bạn chỉ nên hủy khi đơn chưa được xử lý/giao hàng.</span>}
                          okText="Hủy đơn"
                          cancelText="Không"
                          okButtonProps={{ danger: true }}
                          onConfirm={() => handleCancelOrder(order.id)}
                        >
                          <Button
                            danger
                            icon={<StopOutlined />}
                            loading={cancellingId === String(order.id)}
                            className="w-full !h-11 !rounded-xl !font-bold"
                          >
                            Hủy đơn hàng
                          </Button>
                        </Popconfirm>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}

            {/* PAGING CONTROL */}
            {filteredOrders.length > 0 && (
              <div className={`mt-6 p-4 md:p-6 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100 shadow-sm'}`}>
                <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Đang hiển thị {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredOrders.length)} trong {filteredOrders.length} đơn hàng
                </span>
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 ${
                      isDarkMode ? 'text-gray-400 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <LeftOutlined className="text-xs" />
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const page = idx + 1;
                    if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                            page === currentPage
                              ? 'bg-orange-500 text-white shadow-md'
                              : isDarkMode
                                ? 'text-gray-400 hover:bg-slate-800 hover:text-white'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>...</span>;
                    }
                    return null;
                  })}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 ${
                      isDarkMode ? 'text-gray-400 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <RightOutlined className="text-xs" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TIMELINE THÔNG TIN BỔ SUNG */}
        <div className={`mt-8 rounded-2xl p-6 md:p-8 border shadow-sm ${
          isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
        }`}>
          <h3 className={`text-xl font-black mb-6 flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <div className={`p-2 rounded-lg ${isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
              <FileTextOutlined />
            </div>
            Quy trình xử lý đơn hàng
          </h3>

          <Timeline
            className={`mt-2 ${isDarkMode ? '[&_.ant-timeline-item-content]:!text-gray-300' : ''}`}
            items={[
              { color: "orange", children: <strong>PENDING:</strong> },
              { color: "blue", children: "CONFIRMED: Người bán hoặc Admin đã xác nhận đơn" },
              { color: "purple", children: "PROCESSING: Kho đang đóng gói và chuẩn bị hàng" },
              { color: "cyan", children: "SHIPPED: Đã giao cho đơn vị vận chuyển" },
              { color: "green", children: <strong>DELIVERED: Đơn hàng giao thành công đến tay bạn</strong> },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default UserOrderListPage;
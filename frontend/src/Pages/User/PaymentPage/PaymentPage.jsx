import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Button,
  Descriptions,
  Empty,
  Modal,
  Select,
  Spin,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  EyeOutlined,
  LinkOutlined,
  ReloadOutlined,
  SortAscendingOutlined,
  SyncOutlined,
  WalletOutlined,
  CopyOutlined,
  LeftOutlined,
  RightOutlined
} from "@ant-design/icons";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";

import api from "../../../Apis/apiConfig";
import API_ENDPOINTS from "../../../Apis/apiEndpoints";
import { getAuthUser } from "../../../Utils/Auth";
import { notifyCartChanged } from "../../../Utils/CartEvents";

const { Title, Text, Paragraph } = Typography;

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

const unwrapApiData = (response) => {
  if (response?.data?.data !== undefined) return response.data.data;
  if (response?.data !== undefined) return response.data;
  return response;
};

const getApiMessage = (error, fallback = "Có lỗi xảy ra.") => {
  const responseData = error?.response?.data;
  return (
    responseData?.message ||
    responseData?.error ||
    responseData?.detail ||
    responseData?.data?.message ||
    error?.message ||
    fallback
  );
};

const getShortId = (id) => {
  if (!id) return "N/A";
  return String(id).slice(0, 8).toUpperCase();
};

// Custom UI Badges matching HTML template
const getPaymentStatusBadge = (status, isDarkMode) => {
  switch (status) {
    case 'PENDING':
      return <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-md border ${isDarkMode ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-orange-100 text-orange-600 border-orange-200'}`}>Chờ thanh toán</span>;
    case 'PAID':
      return <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-md border ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-100 text-emerald-600 border-emerald-200'}`}>Đã thanh toán</span>;
    case 'FAILED':
      return <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-md border ${isDarkMode ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-100 text-red-600 border-red-200'}`}>Thất bại</span>;
    case 'REFUNDED':
      return <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-md border ${isDarkMode ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-blue-100 text-blue-600 border-blue-200'}`}>Đã hoàn tiền</span>;
    default:
      return <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-md border ${isDarkMode ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>{status || "N/A"}</span>;
  }
};

const getOrderStatusBadge = (status, isDarkMode) => {
  switch (status) {
    case 'PENDING':
      return <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-md ${isDarkMode ? 'bg-slate-700 text-yellow-400' : 'bg-gray-100 text-yellow-600'}`}>Chờ xác nhận</span>;
    case 'PROCESSING':
      return <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-md ${isDarkMode ? 'bg-slate-700 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>Đang xử lý</span>;
    case 'SHIPPED':
      return <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-md ${isDarkMode ? 'bg-slate-700 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>Đang giao</span>;
    case 'DELIVERED':
      return <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-md ${isDarkMode ? 'bg-slate-700 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>Đã giao</span>;
    case 'CANCELLED':
      return <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-md border ${isDarkMode ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-100 text-red-600 border-red-200'}`}>Đã hủy</span>;
    default:
      return <span className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-md ${isDarkMode ? 'bg-slate-700 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>{status || "N/A"}</span>;
  }
};

const isPayableSepayOrder = (order) => {
  return order?.paymentMethod === "SEPAY" && order?.paymentStatus !== "PAID";
};

const SORT_OPTIONS = [
  { value: "createdAt_desc", label: "Mới nhất" },
  { value: "createdAt_asc", label: "Cũ nhất" },
  { value: "totalAmount_desc", label: "Tổng tiền cao nhất" },
  { value: "totalAmount_asc", label: "Tổng tiền thấp nhất" },
  { value: "payable_desc", label: "Chưa thanh toán trước" },
  { value: "payable_asc", label: "Đã thanh toán trước" },
];

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useOutletContext() || {};
  const authUser = getAuthUser();
  const userId = authUser?.id;

  const orderEndpoint = API_ENDPOINTS.orders || API_ENDPOINTS.order;
  const paymentEndpoint = API_ENDPOINTS.payments || API_ENDPOINTS.payment;

  const orderFromState = location.state?.order || null;

  const [orders, setOrders] = useState([]);
  const [focusedOrder, setFocusedOrder] = useState(orderFromState);
  const [paymentResult, setPaymentResult] = useState(null);

  const [loadingOrders, setLoadingOrders] = useState(false);
  const [creatingCheckoutId, setCreatingCheckoutId] = useState(null);
  const [refreshingStatusId, setRefreshingStatusId] = useState(null);
  const [sortOption, setSortOption] = useState("createdAt_desc");
  
  // Custom Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // --- STATE VÀ REF CHO CHỨC NĂNG POLLING TỰ ĐỘNG ---
  const [pollingOrderId, setPollingOrderId] = useState(null);
  const qrModalRef = useRef(null);

  const sepayOrders = useMemo(() => {
    const filtered = orders.filter((order) => order.paymentMethod === "SEPAY");
    const [sortKey, sortDirection] = sortOption.split("_");

    return [...filtered].sort((a, b) => {
      let valA, valB;
      if (sortKey === "createdAt") {
        valA = new Date(a.createdAt || 0).getTime();
        valB = new Date(b.createdAt || 0).getTime();
      } else if (sortKey === "totalAmount") {
        valA = Number(a.totalAmount || 0);
        valB = Number(b.totalAmount || 0);
      } else if (sortKey === "payable") {
        valA = isPayableSepayOrder(a) ? 1 : 0;
        valB = isPayableSepayOrder(b) ? 1 : 0;
      }

      if (sortDirection === "desc") {
        return valB - valA;
      }
      return valA - valB;
    });
  }, [orders, sortOption]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sepayOrders.slice(startIndex, startIndex + pageSize);
  }, [sepayOrders, currentPage]);

  const totalPages = Math.ceil(sepayOrders.length / pageSize);

  const pendingSepayOrders = useMemo(() => sepayOrders.filter((order) => order.paymentStatus !== "PAID"), [sepayOrders]);
  const paidSepayOrders = useMemo(() => sepayOrders.filter((order) => order.paymentStatus === "PAID"), [sepayOrders]);
  const totalPendingAmount = useMemo(() => pendingSepayOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0), [pendingSepayOrders]);

  const fetchOrders = async () => {
    if (!userId) {
      setOrders([]);
      return;
    }
    setLoadingOrders(true);
    try {
      const response = await api.get(orderEndpoint.list);
      const data = unwrapApiData(response);
      const orderList = Array.isArray(data) ? data : [];
      setOrders(orderList);

      if (focusedOrder?.id) {
        const freshFocusedOrder = orderList.find((order) => String(order.id) === String(focusedOrder.id));
        if (freshFocusedOrder) setFocusedOrder(freshFocusedOrder);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách đơn hàng:", error);
      message.error("Không thể tải danh sách đơn hàng.");
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // --- USE-EFFECT ĐỂ POLLING KIỂM TRA TRẠNG THÁI ĐƠN HÀNG ---
  useEffect(() => {
    let intervalId;

    if (pollingOrderId) {
      intervalId = setInterval(async () => {
        try {
          const response = await api.get(paymentEndpoint.orderStatus(pollingOrderId));
          const data = unwrapApiData(response);

          if (data.paymentStatus === "PAID") {
            clearInterval(intervalId);
            setPollingOrderId(null);

            if (qrModalRef.current) {
              qrModalRef.current.destroy();
            }

            message.success("Nhận tiền thành công! Đang chuyển hướng...");
            setPaymentResult(data);
            updateOrderPaymentStatus(data);
            
            navigate(`/payment-success?orderId=${pollingOrderId}`); 
          }
        } catch (error) {
          console.error("Lỗi khi tự động kiểm tra trạng thái:", error);
        }
      }, 3000); 
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [pollingOrderId, paymentEndpoint, navigate]);

  const updateOrderPaymentStatus = (paymentData) => {
    if (!paymentData?.orderId) return;

    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (String(order.id) !== String(paymentData.orderId)) return order;
        return {
          ...order,
          paymentStatus: paymentData.paymentStatus || order.paymentStatus,
          paymentMethod: paymentData.paymentMethod || order.paymentMethod,
        };
      })
    );

    setFocusedOrder((prevOrder) => {
      if (!prevOrder || String(prevOrder.id) !== String(paymentData.orderId)) return prevOrder;
      return {
        ...prevOrder,
        paymentStatus: paymentData.paymentStatus || prevOrder.paymentStatus,
        paymentMethod: paymentData.paymentMethod || prevOrder.paymentMethod,
      };
    });
  };

  const handleCopy = (text, itemLabel) => {
    navigator.clipboard.writeText(text);
    message.success(`Đã sao chép ${itemLabel}!`);
  };

  const handleCreateSepayCheckout = async (order) => {
    if (!order?.id) return;
    if (order.paymentMethod !== "SEPAY") {
      message.warning("Chỉ đơn hàng có phương thức SEPAY mới thanh toán tại đây.");
      return;
    }
    if (order.paymentStatus === "PAID") {
      message.success("Đơn hàng này đã được thanh toán.");
      return;
    }

    setFocusedOrder(order);
    setCreatingCheckoutId(String(order.id));

    try {
      const response = await api.post(paymentEndpoint.sepayCheckout, {
        orderId: order.id,
        returnUrl: `${window.location.origin}/orders/${order.id}`,
      });

      const data = unwrapApiData(response);
      setPaymentResult(data);
      updateOrderPaymentStatus(data);

      if (data?.qrCodeUrl) {
        const modalInstance = Modal.info({
          title: <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-orange-600'}`}>Quét mã để thanh toán</span>,
          width: 500,
          okText: "Đóng",
          className: isDarkMode ? 'dark-modal' : '',
          onOk: () => {
            setPollingOrderId(null);
          },
          icon: <WalletOutlined className="text-orange-500" />,
          content: (
            <div className="flex flex-col items-center mt-4 text-base">
              <img
                src={data.qrCodeUrl}
                alt="Mã QR Thanh toán SePay"
                className={`w-64 h-64 object-contain rounded-2xl shadow-sm border mb-6 ${isDarkMode ? 'border-slate-700 bg-white' : 'border-gray-100'}`}
              />

              <div className={`w-full p-4 rounded-xl border space-y-3 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-orange-50 border-orange-100'}`}>
                <div className={`flex justify-between items-center border-b pb-2 ${isDarkMode ? 'border-slate-700' : 'border-orange-200/50'}`}>
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Ngân hàng:</span>
                  <strong className={`text-lg ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>{data.bankName}</strong>
                </div>

                <div className={`flex justify-between items-center border-b pb-2 ${isDarkMode ? 'border-slate-700' : 'border-orange-200/50'}`}>
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Số tài khoản:</span>
                  <div className="flex items-center gap-2">
                    <strong className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{data.bankAccountNumber}</strong>
                    <Button size="small" type="text" icon={<CopyOutlined className="text-orange-500" />} onClick={() => handleCopy(data.bankAccountNumber, "số tài khoản")} />
                  </div>
                </div>

                <div className={`flex justify-between items-center border-b pb-2 ${isDarkMode ? 'border-slate-700' : 'border-orange-200/50'}`}>
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Số tiền:</span>
                  <strong className="text-red-500 text-lg">{formatCurrency(data.amount)}</strong>
                </div>

                <div className="flex justify-between items-center">
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Nội dung <span className="text-red-500">*</span>:</span>
                  <div className="flex items-center gap-2">
                    <strong className={`px-3 py-1 rounded-md text-lg ${isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-200 text-yellow-800'}`}>
                      {data.transferContent}
                    </strong>
                    <Button size="small" type="text" icon={<CopyOutlined className="text-orange-500" />} onClick={() => handleCopy(data.transferContent, "nội dung chuyển khoản")} />
                  </div>
                </div>
              </div>

              <p className={`text-sm mt-5 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Mở App ngân hàng bất kỳ để quét mã.<br />
                Hệ thống sẽ tự động chuyển trang khi nhận được tiền.
              </p>
            </div>
          ),
        });

        qrModalRef.current = modalInstance;
        setPollingOrderId(order.id);

      } else {
        Modal.error({
          title: "Lỗi khởi tạo",
          content: "Không nhận được mã QR. Vui lòng thử lại.",
        });
      }
    } catch (error) {
      console.error("Lỗi tạo Sepay checkout:", error);
      message.error(getApiMessage(error, "Không thể tạo thanh toán Sepay."));
    } finally {
      setCreatingCheckoutId(null);
    }
  };

  const handleRefreshPaymentStatus = async (order) => {
    if (!order?.id) return;
    setRefreshingStatusId(String(order.id));
    try {
      const response = await api.get(paymentEndpoint.orderStatus(order.id));
      const data = unwrapApiData(response);
      setPaymentResult(data);
      updateOrderPaymentStatus(data);
      message.success("Đã cập nhật trạng thái thanh toán.");
    } catch (error) {
      message.error(getApiMessage(error, "Không thể cập nhật trạng thái."));
    } finally {
      setRefreshingStatusId(null);
    }
  };

  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  if (!userId) {
    return (
      <div className={`min-h-[calc(100vh-80px)] px-4 pb-10 pt-24 md:px-8 md:pt-28 ${isDarkMode ? 'bg-slate-950' : 'bg-gradient-to-br from-orange-50 via-white to-amber-50'}`}>
        <div className={`mx-auto max-w-5xl rounded-3xl px-6 py-16 text-center shadow-sm border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-100'}`}>
          <WalletOutlined className="mb-4 text-5xl text-orange-500" />
          <Title level={2} className={isDarkMode ? '!text-white' : ''}>Bạn chưa đăng nhập</Title>
          <Paragraph className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Vui lòng đăng nhập để quản lý thanh toán.</Paragraph>
          <Button type="primary" size="large" onClick={() => navigate("/auth/login-register")} className="!rounded-xl !bg-orange-500 hover:!bg-orange-600 border-0">
            Đăng nhập ngay
          </Button>
        </div>
      </div>
    );
  }

  // Common Class cho các thẻ (Cards) 
  const cardClass = `rounded-2xl border transition-all duration-300 ${
    isDarkMode 
      ? 'bg-slate-900 border-slate-800 shadow-[0_4px_20px_rgba(0,0,0,0.4)]' 
      : 'bg-white border-gray-100 shadow-sm hover:border-outline-variant hover:shadow-md'
  }`;

  return (
    <div className={`min-h-[calc(100vh-80px)] px-2 sm:px-4 py-8 md:px-8 w-full ${isDarkMode ? 'bg-transparent' : 'bg-transparent'}`}>
      <div className="w-full">
        
        {/* HERO BANNER - IMAGE VỚI GRADIENT OVERLAY */}
        <section className={`relative overflow-hidden rounded-3xl mb-8 min-h-[220px] md:min-h-[260px] flex items-center border ${
          isDarkMode ? 'border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.6)]' : 'border-gray-200 shadow-xl shadow-orange-500/10'
        }`}>
          {/* Background Image */}
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=1200&auto=format&fit=crop" 
              alt="Payment Wallet Background" 
              className="w-full h-full object-cover object-center"
            />
          </div>
          {/* Gradient Overlay L to R */}
          <div className={`absolute inset-0 bg-gradient-to-r ${
            isDarkMode 
              ? 'from-slate-950 via-slate-950/90 to-transparent' 
              : 'from-white via-white/95 to-transparent'
          }`}></div>
          
          <div className="relative z-10 p-6 md:p-10 lg:p-12 w-full flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-xl backdrop-blur-md ${isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-500 text-white'}`}>
                  <WalletOutlined className="text-2xl" />
                </div>
                <h1 className={`m-0 text-3xl md:text-4xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Thanh toán Sepay
                </h1>
              </div>
              <p className={`text-base md:text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Quản lý các đơn hàng thanh toán qua cổng Sepay và cập nhật trạng thái giao dịch theo thời gian thực.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={() => navigate("/orders")} 
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${
                  isDarkMode 
                    ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10' 
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-orange-500 hover:text-orange-600 shadow-sm'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
                Đơn hàng của tôi
              </button>
              <button 
                onClick={fetchOrders} 
                disabled={loadingOrders}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg ${
                  isDarkMode
                    ? 'bg-orange-500 text-white hover:bg-orange-600 border border-orange-400/50'
                    : 'bg-orange-500 text-white hover:bg-orange-600 border-0'
                }`}
              >
                <SyncOutlined spin={loadingOrders} className="text-[18px]" />
                Làm mới
              </button>
            </div>
          </div>
        </section>

        {/* STATS BENTO GRID */}
        <section className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className={`${cardClass} p-6 flex items-center gap-6 group`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110 ${isDarkMode ? 'bg-slate-800 text-orange-400' : 'bg-orange-50 text-orange-500'}`}>
              <WalletOutlined className="text-3xl" />
            </div>
            <div>
              <span className={`text-sm font-semibold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Đơn Sepay</span>
              <span className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{sepayOrders.length}</span>
            </div>
          </div>

          <div className={`${cardClass} p-6 flex items-center gap-6 group`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110 ${isDarkMode ? 'bg-slate-800 text-yellow-400' : 'bg-yellow-50 text-yellow-500'}`}>
              <ClockCircleOutlined className="text-3xl" />
            </div>
            <div>
              <span className={`text-sm font-semibold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Chờ thanh toán</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{pendingSepayOrders.length}</span>
                {totalPendingAmount > 0 && (
                   <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded-full">{formatCurrency(totalPendingAmount)}</span>
                )}
              </div>
            </div>
          </div>

          <div className={`${cardClass} p-6 flex items-center gap-6 group`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110 ${isDarkMode ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-50 text-emerald-500'}`}>
              <CheckCircleOutlined className="text-3xl" />
            </div>
            <div>
              <span className={`text-sm font-semibold uppercase tracking-wider block mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Đã thanh toán</span>
              <span className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{paidSepayOrders.length}</span>
            </div>
          </div>
        </section>

        {/* FOCUSED ORDER SECTION */}
        {focusedOrder && (
          <div className={`${cardClass} mb-8 p-6 lg:p-8 relative overflow-hidden`}>
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase ${isDarkMode ? 'bg-slate-800 text-white border border-slate-700' : 'bg-gray-100 text-gray-800 border border-gray-200'}`}>
                    Đang chọn #{getShortId(focusedOrder.id)}
                  </span>
                  {getPaymentStatusBadge(focusedOrder.paymentStatus, isDarkMode)}
                  {getOrderStatusBadge(focusedOrder.status, isDarkMode)}
                  <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                    {focusedOrder.paymentMethod || "N/A"}
                  </span>
                </div>
                <h2 className={`text-2xl font-black mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Tổng: <span className="text-orange-500">{formatCurrency(focusedOrder.totalAmount)}</span>
                </h2>
                <Text className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Ngày tạo: {formatDateTime(focusedOrder.createdAt)}</Text>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button icon={<EyeOutlined />} onClick={() => handleViewOrder(focusedOrder.id)} className={`!rounded-xl !h-11 ${isDarkMode ? '!bg-slate-800 !text-white !border-slate-700 hover:!border-orange-500' : ''}`}>
                  Xem chi tiết
                </Button>
                {isPayableSepayOrder(focusedOrder) && (
                  <Button type="primary" icon={<CreditCardOutlined />} loading={creatingCheckoutId === String(focusedOrder.id)} onClick={() => handleCreateSepayCheckout(focusedOrder)} className="!rounded-xl !h-11 !bg-orange-500 hover:!bg-orange-600 font-bold border-0 shadow-lg shadow-orange-500/20">
                    Tạo thanh toán
                  </Button>
                )}
                <Button icon={<SyncOutlined />} loading={refreshingStatusId === String(focusedOrder.id)} onClick={() => handleRefreshPaymentStatus(focusedOrder)} className={`!rounded-xl !h-11 ${isDarkMode ? '!bg-slate-800 !text-white !border-slate-700 hover:!border-blue-500 hover:!text-blue-400' : ''}`}>
                  Cập nhật
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* PAYMENT RESULT SECTION */}
        {paymentResult && (
          <div className={`${cardClass} mb-8 overflow-hidden`}>
            <div className={`p-5 border-b ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-orange-50/50 border-gray-100'} flex items-center gap-2`}>
              <LinkOutlined className="text-orange-500 text-xl" />
              <h3 className={`text-lg font-bold m-0 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Giao dịch vừa tạo</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div><span className={`block text-xs uppercase font-bold mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Order ID</span><span className={`font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{paymentResult.orderId || "N/A"}</span></div>
                <div><span className={`block text-xs uppercase font-bold mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Transaction ID</span><span className={`font-mono ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{paymentResult.transactionId || "N/A"}</span></div>
                <div><span className={`block text-xs uppercase font-bold mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Số tiền</span><span className="text-red-500 font-black text-lg">{formatCurrency(paymentResult.amount)}</span></div>
                <div><span className={`block text-xs uppercase font-bold mb-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Trạng thái</span>{getPaymentStatusBadge(paymentResult.paymentStatus, isDarkMode)}</div>
              </div>

              {paymentResult.qrCodeUrl && (
                <div className={`p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-200'} flex flex-col md:flex-row gap-8 items-center md:items-start`}>
                  <img src={paymentResult.qrCodeUrl} alt="QR Code" className={`w-40 h-40 object-contain p-2 rounded-xl bg-white shadow-sm border ${isDarkMode ? 'border-slate-600' : 'border-gray-200'}`} />
                  <div className="space-y-4 w-full max-w-md">
                    <div className="flex justify-between items-center"><span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Ngân hàng:</span><strong className={isDarkMode ? 'text-white' : 'text-gray-900'}>{paymentResult.bankName}</strong></div>
                    <div className="flex justify-between items-center"><span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Số tài khoản:</span><div className="flex items-center gap-2"><strong className={`text-lg font-mono tracking-wider ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>{paymentResult.bankAccountNumber}</strong><Button type="text" size="small" icon={<CopyOutlined />} onClick={() => handleCopy(paymentResult.bankAccountNumber, "số tài khoản")} className={isDarkMode ? 'text-gray-400 hover:text-white' : ''}/></div></div>
                    <div className="flex justify-between items-center"><span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Nội dung:</span><div className="flex items-center gap-2"><strong className={`px-2 py-1 rounded-md font-mono ${isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800'}`}>{paymentResult.transferContent}</strong><Button type="text" size="small" icon={<CopyOutlined />} onClick={() => handleCopy(paymentResult.transferContent, "nội dung")} className={isDarkMode ? 'text-gray-400 hover:text-white' : ''}/></div></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CUSTOM TAILWIND TABLE SECTION (MATCHING HTML DESIGN) */}
        <section className={`rounded-xl overflow-hidden border ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-xl' : 'bg-white border-gray-200 shadow-sm'}`}>
          {/* Table Header Controls */}
          <div className={`p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
            <div>
              <h2 className={`text-xl font-black mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Danh sách đơn hàng Sepay</h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Tổng tiền đang chờ: <span className="text-orange-500 font-bold">{formatCurrency(totalPendingAmount)}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select
                value={sortOption}
                onChange={setSortOption}
                popupClassName={isDarkMode ? "!bg-slate-800 [&_.ant-select-item]:!text-gray-300 [&_.ant-select-item-option-selected]:!bg-orange-500/20 [&_.ant-select-item-option-active]:!bg-slate-700" : ""}
                className={`w-[200px] ${isDarkMode ? '[&_.ant-select-selector]:!bg-slate-800 [&_.ant-select-selector]:!border-slate-700 [&_.ant-select-selection-item]:!text-gray-300 [&_.ant-select-arrow]:!text-gray-400' : ''}`}
                options={SORT_OPTIONS}
              />
              <button onClick={fetchOrders} disabled={loadingOrders} className={`p-2 rounded-lg transition-colors border flex items-center justify-center ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}>
                <SyncOutlined spin={loadingOrders} />
              </button>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            {loadingOrders ? (
              <div className="flex justify-center items-center py-20"><Spin size="large" tip="Đang tải dữ liệu..." /></div>
            ) : sepayOrders.length === 0 ? (
              <div className="py-20 text-center">
                <Empty description={<span className={isDarkMode ? 'text-gray-400' : ''}>Chưa có giao dịch Sepay nào.</span>} />
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-gray-50/50 border-gray-100'}`}>
                    <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Mã đơn</th>
                    <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Ngày tạo</th>
                    <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-right ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tổng tiền</th>
                    <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Thanh toán</th>
                    <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Đơn hàng</th>
                    <th className={`px-6 py-4 text-xs font-bold uppercase tracking-wider text-right ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Hành động</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-gray-100'}`}>
                  {paginatedOrders.map((order) => {
                    const isPayable = isPayableSepayOrder(order);
                    return (
                      <tr key={order.id} className={`transition-colors group ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-orange-50/30'}`}>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 text-sm font-bold font-mono rounded-full border transition-colors ${
                            isDarkMode 
                              ? 'bg-slate-800 text-orange-400 border-slate-700 group-hover:border-orange-500/50' 
                              : 'bg-white text-orange-600 border-gray-200 group-hover:border-orange-400'
                          }`}>
                            #{getShortId(order.id)}
                          </span>
                        </td>
                        <td className={`px-6 py-5 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatDateTime(order.createdAt)}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <span className={`text-base font-black tracking-tight ${isDarkMode ? 'text-orange-400' : 'text-orange-600'}`}>
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          {getPaymentStatusBadge(order.paymentStatus, isDarkMode)}
                        </td>
                        <td className="px-6 py-5">
                          {getOrderStatusBadge(order.status, isDarkMode)}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleViewOrder(order.id)}
                              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border transition-colors ${
                                isDarkMode 
                                  ? 'bg-slate-800 border-slate-700 text-gray-300 hover:bg-slate-700 hover:text-white' 
                                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                              }`}
                            >
                              <EyeOutlined /> Xem đơn
                            </button>
                            
                            {isPayable ? (
                              <button 
                                onClick={() => handleCreateSepayCheckout(order)}
                                disabled={creatingCheckoutId === String(order.id)}
                                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg border-0 transition-all shadow-md ${
                                  isDarkMode
                                    ? 'bg-orange-500 text-white hover:bg-orange-400 shadow-orange-500/20'
                                    : 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/30'
                                }`}
                              >
                                {creatingCheckoutId === String(order.id) ? <SyncOutlined spin /> : <span className="material-symbols-outlined text-[14px]" style={{fontVariationSettings: "'FILL' 1"}}>payments</span>}
                                Thanh toán
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleRefreshPaymentStatus(order)}
                                disabled={refreshingStatusId === String(order.id)}
                                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border transition-colors ${
                                  isDarkMode 
                                    ? 'bg-slate-800 border-slate-700 text-blue-400 hover:bg-slate-700 hover:border-blue-500/50' 
                                    : 'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100'
                                }`}
                              >
                                <SyncOutlined spin={refreshingStatusId === String(order.id)} /> Cập nhật
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Table Pagination Footer */}
          {sepayOrders.length > 0 && (
            <div className={`p-4 md:p-6 border-t flex flex-col md:flex-row items-center justify-between gap-4 ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-gray-50/50 border-gray-100'}`}>
              <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Đang hiển thị {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, sepayOrders.length)} trong {sepayOrders.length} giao dịch
              </span>
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 ${
                    isDarkMode ? 'text-gray-400 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <LeftOutlined className="text-xs" />
                </button>
                
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const page = idx + 1;
                  const isActive = page === currentPage;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        isActive 
                          ? 'bg-orange-500 text-white shadow-md' 
                          : isDarkMode 
                            ? 'text-gray-400 hover:bg-slate-800 hover:text-white' 
                            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 ${
                    isDarkMode ? 'text-gray-400 hover:bg-slate-800' : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <RightOutlined className="text-xs" />
                </button>
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default PaymentPage;
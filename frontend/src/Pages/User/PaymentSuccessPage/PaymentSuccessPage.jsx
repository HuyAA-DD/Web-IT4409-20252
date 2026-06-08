import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate, useSearchParams } from 'react-router-dom';
import { Spin, message } from 'antd'; // Tận dụng Spin của Ant Design cho đẹp
import api from '../../../Apis/apiConfig';
import API_ENDPOINTS from '../../../Apis/apiEndpoints';

// Hàm format tiền tệ
const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value || 0));
};

// Hàm lấy mã ngắn
const getShortId = (id) => {
  if (!id) return "N/A";
  return String(id).slice(0, 8).toUpperCase();
};

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useOutletContext() || {};
  
  // Dùng useSearchParams để lấy orderId từ URL (?orderId=...)
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");

  // State lưu trữ dữ liệu
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tạo pháo giấy (giữ nguyên logic xịn xò của bạn)
  const [confettiPieces] = useState(() => {
    const colors = ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#c2410c'];
    return Array.from({ length: 50 }).map(() => {
      const size = Math.random() * 10 + 5 + 'px';
      return {
        left: Math.random() * 100 + 'vw',
        animationDuration: Math.random() * 3 + 2 + 's',
        animationDelay: Math.random() * 5 + 's',
        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
        width: size,
        height: size,
      };
    });
  });

  // Gọi API lấy thông tin chi tiết đơn hàng
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const endpoint = API_ENDPOINTS.orders || API_ENDPOINTS.order;
        // Gọi API chi tiết đơn hàng (Giả sử endpoint là /orders/{id})
        const response = await api.get(`${endpoint.list}/${orderId}`);
        
        // Unwrap data tùy theo cấu trúc trả về của Backend
        const data = response?.data?.data !== undefined ? response.data.data : response.data;
        setOrderData(data);
      } catch (error) {
        console.error("Lỗi khi tải thông tin đơn hàng:", error);
        message.error("Không thể lấy dữ liệu đơn hàng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Nếu đang gọi API thì hiện Loading mượt mà
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-transparent' : 'bg-gray-50'}`}>
        <Spin size="large" tip="Đang tải dữ liệu đơn hàng..." />
      </div>
    );
  }

  // Nếu không có OrderID hoặc lỗi API
  if (!orderData) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy thông tin đơn hàng</h2>
        <button 
          onClick={() => navigate('/orders')} 
          className="bg-orange-600 text-white px-6 py-2 rounded-full hover:bg-orange-700 transition"
        >
          Về danh sách đơn hàng
        </button>
      </div>
    );
  }

  // --- DỮ LIỆU ĐỘNG ĐÃ SẴN SÀNG ---
  // Giả lập ngày giao hàng dự kiến là 3 ngày sau kể từ ngày tạo đơn
  const createdDate = orderData.createdAt ? new Date(orderData.createdAt) : new Date();
  const deliveryDate = new Date(createdDate);
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString("vi-VN", { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
          
          body { font-family: 'Manrope', sans-serif; }
          .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
          @keyframes fall { to { transform: translateY(100vh) rotate(360deg); } }
        `}
      </style>

      {/* Main Container */}
      <div className={` text-[#111c2d] min-h-screen flex flex-col font-['Manrope',sans-serif] ${isDarkMode ? 'bg-transparent' : ''}`}>
        
        <main className="grow flex items-center justify-center relative overflow-hidden py-8 px-4">
          
          {/* Confetti Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {confettiPieces.map((style, index) => (
              <div 
                key={index} 
                className="absolute rounded-full opacity-60 animate-[fall_linear_infinite]" 
                style={style} 
              />
            ))}
          </div>

          <div className="max-w-2xl w-full flex flex-col items-center text-center z-10">
            {/* Orange Success Icon */}
            <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-4 animate-bounce border-2 border-orange-100 shadow-lg shadow-orange-100">
              <span className="material-symbols-outlined text-orange-500 text-6xl!" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>

            {/* Headline & Subtext */}
            <h1 className={`text-[32px] leading-[1.3] font-bold ${isDarkMode ? 'text-[#ffffff]' : 'text-[#111c2d]'} mb-2`}>
              Thanh toán thành công!
            </h1>
            <p className={`text-[18px] leading-[1.6] font-normal ${isDarkMode ? 'text-[#cccccc]' : 'text-[#464554]'} max-w-md mx-auto mb-8`}>
              Cảm ơn bạn đã mua sắm tại <strong>Mega Mart</strong>.<br></br> 
              Đơn hàng của bạn đã được ghi nhận và đang được xử lý.
            </p>

            {/* Order Summary Card - Đã thay dữ liệu động */}
            <div className="bg-[#ffffff] p-8 rounded-2xl shadow-sm border border-[#c7c4d7]/30 w-full mb-8 transition-transform hover:scale-[1.01]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="flex flex-col gap-1">
                  <span className="text-[12px] leading-[1.4] font-medium text-[#777586] uppercase tracking-wider">Mã đơn hàng</span>
                  <span className="text-[20px] leading-[1.4] font-semibold text-[#111c2d]">
                    #{orderData.orderCode || getShortId(orderData.id)}
                  </span>
                </div>
                
                <div className="flex flex-col gap-1 border-y md:border-y-0 md:border-x border-[#c7c4d7]/30 py-4 md:py-0 md:px-6">
                  <span className="text-[12px] leading-[1.4] font-medium text-[#777586] uppercase tracking-wider">Tổng thanh toán</span>
                  <span className="text-[20px] leading-[1.4] font-bold text-[#ea580c]">
                    {formatCurrency(orderData.totalAmount)}
                  </span>
                </div>
                
                <div className="flex flex-col gap-1 md:pl-6">
                  <span className="text-[12px] leading-[1.4] font-medium text-[#777586] uppercase tracking-wider">Giao hàng dự kiến</span>
                  <span className="text-[20px] leading-[1.4] font-semibold text-[#111c2d]">
                    {formattedDeliveryDate}
                  </span>
                </div>
              </div>
              
              <div className="mt-8 pt-4 border-t border-[#c7c4d7]/20 flex items-center gap-3 text-[#464554]">
                <span className="material-symbols-outlined text-[#ea580c]">local_shipping</span>
                <span className="text-[15px] leading-[1.6] font-normal">
                  Đơn hàng sẽ được vận chuyển qua đối tác <span className="font-bold text-[#111c2d]">Giao Hàng Nhanh</span>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button 
                onClick={() => navigate(`/orders/${orderId}`)} 
                className="bg-[#ea580c] text-[#ffffff] px-10 py-4 rounded-full text-[14px] leading-[1.4] tracking-[0.01em] font-semibold shadow-lg shadow-orange-500/30 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">track_changes</span>
                Theo dõi đơn hàng
              </button>
              
              <button 
                onClick={() => navigate('/supermarket')} 
                className="border-2 border-[#ea580c] text-[#ea580c] bg-white px-10 py-4 rounded-full text-[14px] leading-[1.4] tracking-[0.01em] font-semibold hover:bg-[#ffedd5] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">shopping_bag</span>
                Tiếp tục mua sắm
              </button>
            </div>

          </div>
        </main>
      </div>
    </>
  );
};

export default PaymentSuccessPage;
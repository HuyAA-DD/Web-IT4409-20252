import React from 'react';
import {useNavigate} from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';

const PaymentFailPage = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useOutletContext();

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
          
          body { font-family: 'Manrope', sans-serif; background-color: #f9f9ff; }
          .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        `}
      </style>

      {/* Main Container: Full màn hình, căn giữa nội dung */}
      <div className={` min-h-screen flex flex-col font-['Manrope',sans-serif]`}>
        
        {/* Main Content Area */}
        <main className="grow flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
          
          {/* Abstract Background Element */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2a14b4]/5 rounded-full blur-3xl -z-10"></div>

          <div className="w-full max-w-2xl text-center flex flex-col items-center z-10">
            {/* Animated Error Icon */}
            <div className="w-24 h-24 mb-6 flex items-center justify-center rounded-full bg-[#ffdad6] text-[#ba1a1a] shadow-lg shadow-[#ba1a1a]/10 animate-bounce">
              <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
            </div>
            
            {/* Headline & Subtext */}
            <h1 className={`text-[32px] leading-[1.3] font-bold ${isDarkMode ? 'text-[#ffffff]' : 'text-[#111c2d]'} mb-2`}>
              Thanh toán thất bại
            </h1>
            <p className={`text-[18px] leading-[1.6] font-normal ${isDarkMode ? 'text-[#cfcfd4]' : 'text-[#464554]'} mb-8 max-w-md mx-auto`}>
              Đã có lỗi xảy ra trong quá trình xử lý giao dịch của bạn. Vui lòng kiểm tra lại phương thức thanh toán.
            </p>

            {/* Action Button */}
            <div className="flex w-full justify-center">
              <button 
                className="bg-[#cf691c] text-[#ffffff] px-10 py-4 rounded-full text-[14px] leading-[1.4] tracking-[0.01em] font-semibold shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                onClick={() => {
                    navigate('/cart')
                }}
              >
                <span className="material-symbols-outlined">shopping_basket</span>
                Quay lại giỏ hàng
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default PaymentFailPage;
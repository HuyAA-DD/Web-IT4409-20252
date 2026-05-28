import React, { useState, useEffect } from 'react';
import api from '../../../Apis/apiConfig';
import API_ENDPOINTS from '../../../Apis/apiEndpoints';
import Loading from '../../../Components/Loading/Loading';




/* ── Tiny helpers ── */
const fmt = (val) =>
  val != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
    : '—';

function MaterialIcon({ name, className = '' }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24", verticalAlign: 'middle' }}
    >
      {name}
    </span>
  );
}

/* ── KPI Card (glass) ── */
function KpiCard({ label, value, trend, trendIcon, trendColor, iconBg, iconColor, iconName, hoverBorder, sparkColor }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`z-10 w-full mb-10 rounded-2xl p-6 flex flex-col justify-between cursor-default transition-all duration-200 border ${hoverBorder}`}
      style={{
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(8px)',
        border: hovered ? undefined : '1px solid #e2e8f0',
        boxShadow: hovered
          ? '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)'
          : '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.025)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs font-bold text-[#5c4037] mb-1 uppercase tracking-widest">{label}</p>
          <h3 className="font-[Manrope,Inter,sans-serif] text-[32px] leading-[40px] font-bold tracking-tight text-[#191c1e]">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${iconBg}`}>
          <MaterialIcon name={iconName} className={iconColor} />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className={`flex items-center font-bold text-xs ${trendColor}`}>
          <MaterialIcon name={trendIcon} className="text-sm mr-1" />
          {trend}
        </div>
        {/* Sparkline */}
        <div className={`w-16 h-8 transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-40'}`}>
          <div className="w-full h-full flex items-end gap-0.5">
            {sparkColor && [1, 2, 3, 4].map((n, i) => (
              <div key={i} className={`${sparkColor} w-1.5 rounded-full`} style={{ height: `${[50, 75, 65, 100][i]}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Highlighted Net Revenue Card ── */
function NetRevenueCard({ value }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="rounded-2xl p-6 flex flex-col justify-between text-white overflow-hidden relative cursor-default transition-all duration-200"
      style={{
        background: 'linear-gradient(135deg, #aa3000 0%, #d43f00 100%)',
        boxShadow: hovered
          ? '0 20px 25px -5px rgba(0,0,0,0.1)'
          : '0 10px 15px -3px rgba(0,0,0,0.05)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      {/* Decorative icon */}
      <div
        className="absolute -right-4 -top-4 opacity-10 scale-150 transition-transform duration-700"
        style={{ transform: hovered ? 'scale(1.5) rotate(45deg)' : 'scale(1.5) rotate(12deg)' }}
      >
        <MaterialIcon name="account_balance" className="text-[120px]" />
      </div>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-xs font-bold text-white/80 mb-1 uppercase tracking-widest">DOANH THU THUẦN (NET)</p>
            <h3 className="font-[Manrope,Inter,sans-serif] text-[32px] leading-[40px] font-bold">{value}</h3>
          </div>
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
            <MaterialIcon name="price_check" className="text-white" />
          </div>
        </div>
        <div className="flex items-center text-white/90 font-bold text-xs mt-4">
          <MaterialIcon name="check_circle" className="text-sm mr-1 text-white" />
          Đã khấu trừ hoàn trả &amp; hủy đơn
        </div>
      </div>
    </div>
  );
}

export default function AdminRevenuePage() {
  const currentYear = new Date().getFullYear();
  const [revenue, setRevenue]   = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filterYear, setFilterYear] = useState(currentYear);
  const [filterMonth, setFilterMonth] = useState(null);
  const [filterQuarter, setFilterQuarter] = useState(null);

  useEffect(() => {
    const fetchRevenue = async () => {
      setIsLoading(true);
      try {
        const params = { year: filterYear };
        if (filterMonth) params.month = filterMonth;
        if (filterQuarter) params.quarter = filterQuarter;

        const response = await api.get(API_ENDPOINTS.admin.revenue, params);
        setRevenue(response?.data || response);
      } catch (error) {
        console.error('Lỗi khi tải doanh thu', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRevenue();
  }, [filterYear, filterMonth, filterQuarter]);

  /* ── Derived display values ── */
  const grossRev  = revenue ? fmt(revenue.totalRevenue)       : '1,248.5 M';
  const refunds   = revenue ? fmt(revenue.totalRefunds)       : '42.8 M';
  const aov       = revenue ? fmt(revenue.averageOrderValue)  : '850K';
  const netRev    = revenue ? fmt(revenue.netRevenue)         : '1,205.7 M';
  const refundPct = revenue
    ? `Chiếm ${(revenue.totalRefunds / revenue.totalRevenue * 100).toFixed(1)}% tổng doanh thu`
    : '-3.2% cải thiện rủi ro';

  if (isLoading) {
    return (
      <Loading/>
    );
  }

  return (
    <>
      {/* Google Fonts for Manrope */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');
      `}</style>

      <div className="min-h-screen " style={{ background: '#f7f9fb', fontFamily: "'Inter', sans-serif" }}>
        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MaterialIcon name="payments" className="text-[#aa3000] font-bold" />
              <h2
                className="text-[24px] leading-[32px] font-semibold text-[#191c1e] uppercase tracking-tight"
                style={{ fontFamily: "'Manrope', 'Inter', sans-serif" }}
              >
                Báo cáo doanh thu
              </h2>
            </div>
            <p className="text-sm text-[#5c4037]">Thống kê dòng tiền, giá trị đơn hàng và đối soát hoàn trả trong kỳ.</p>
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
              <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Lọc:</span>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(Number(e.target.value))}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-800 outline-none"
              >
                {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((year) => (
                  <option key={year} value={year}>Năm {year}</option>
                ))}
              </select>
              <select
                value={filterQuarter || ''}
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : null;
                  setFilterQuarter(value);
                  if (value) setFilterMonth(null);
                }}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-800 outline-none"
              >
                <option value="">Chọn Quý</option>
                {[1, 2, 3, 4].map((q) => (
                  <option key={q} value={q}>Quý {q}</option>
                ))}
              </select>
              <select
                value={filterMonth || ''}
                onChange={(e) => {
                  const value = e.target.value ? Number(e.target.value) : null;
                  setFilterMonth(value);
                  if (value) setFilterQuarter(null);
                }}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-800 outline-none"
              >
                <option value="">Chọn Tháng</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <option key={month} value={month}>Tháng {month}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  setFilterYear(currentYear);
                  setFilterMonth(null);
                  setFilterQuarter(null);
                }}
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Xóa
              </button>
            </div>
            <button
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-white transition-transform hover:scale-[0.98] active:scale-95"
              style={{ background: '#aa3000', boxShadow: '0 10px 15px -3px rgba(170,48,0,0.2)' }}
            >
              <MaterialIcon name="download" className="text-white" />
              <span className="text-sm">Xuất báo cáo</span>
            </button>
          </div>
        </div>

        {/* ── KPI Grid ── */}
        <div className="flex-col ">
          <KpiCard
            label="TỔNG DOANH THU GỘP"
            value={grossRev}
            trend="+12.5% so với tháng trước"
            trendIcon="trending_up"
            trendColor="text-[#aa3000]"
            iconBg="bg-[#d5e0f8]"
            iconColor="text-[#aa3000]"
            iconName="account_balance_wallet"
            hoverBorder="hover:border-[#aa3000]"
            sparkColor="bg-[#d43f00]"
          />
          <KpiCard
            label="TỔNG TIỀN HOÀN TRẢ"
            value={refunds}
            trend={refundPct}
            trendIcon="trending_down"
            trendColor="text-[#ba1a1a]"
            iconBg="bg-[#ffdad6]"
            iconColor="text-[#ba1a1a]"
            iconName="keyboard_return"
            hoverBorder="hover:border-[#ba1a1a]"
            sparkColor="bg-[#ba1a1a]"
          />
          <KpiCard
            label="GIÁ TRỊ ĐƠN TB (AOV)"
            value={aov}
            trend="Khách hàng chi tiêu nhiều hơn"
            trendIcon="insights"
            trendColor="text-[#4648d4]"
            iconBg="bg-[#6063ee]"
            iconColor="text-white"
            iconName="shopping_basket"
            hoverBorder="hover:border-[#4648d4]"
            sparkColor="bg-[#4648d4]"
          />
          <NetRevenueCard value={netRev} />
        </div>




      </div>
    </>
  );
}
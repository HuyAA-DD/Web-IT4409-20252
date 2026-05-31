import React, { useState, useMemo, useEffect } from 'react';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined,
  LeftOutlined,
  RightOutlined,
  TagOutlined,
  PercentageOutlined,
  DollarOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { Progress, message } from 'antd';
import api from '../../../Apis/apiConfig';
import API_ENDPOINTS from '../../../Apis/apiEndpoints';

export default function AdminCouponPage() {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- STATES BỘ LỌC ---
  const [searchCode, setSearchCode] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({ searchCode: '', typeFilter: '', statusFilter: '' });

  // --- STATES PHÂN TRANG ---
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    const fetchCoupons = async () => {
      setIsLoading(true);
      try {
        // ĐÃ SỬA: Cập nhật lại logic truyền tham số isActive cho API
        const isActiveParam = 
          ['ACTIVE', 'UPCOMING', 'EXPIRED'].includes(appliedFilters.statusFilter) ? true :
          appliedFilters.statusFilter === 'LOCKED' ? false : undefined;

        const params = {
          code: appliedFilters.searchCode || undefined,
          type: appliedFilters.typeFilter || undefined,
          isActive: isActiveParam,
          page: currentPage - 1,
          size: pageSize,
        };

        const response = await api.get(API_ENDPOINTS.coupons.list, params);
        const data = response?.data || response;

        if (Array.isArray(data?.content)) {
          setCoupons(data.content);
          setTotalElements(data.totalElements || data.content.length);
        } else if (Array.isArray(data)) {
          setCoupons(data);
          setTotalElements(data.length);
        } else {
          setCoupons([]);
          setTotalElements(0);
        }
      } catch (error) {
        console.error('Lỗi khi tải danh sách Coupon', error);
        message.error('Không thể tải danh sách khuyến mãi!');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoupons();
  }, [appliedFilters, currentPage]);

  // =========================================================================
  // LOGIC QUẢN LÝ MODAL (THÊM / SỬA)
  // =========================================================================
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    code: '', discountType: 'PERCENT', discountValue: '5', minOrderValue: '',
    maxDiscount: '', startDate: '', endDate: '', usageLimit: '', isActive: true
  };
  const [formData, setFormData] = useState(initialFormState);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coupon) => {
    setModalMode('edit');
    setEditingId(coupon.id);
    setFormData({
      code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue, 
      minOrderValue: coupon.minOrderValue, maxDiscount: coupon.maxDiscount, 
      startDate: coupon.startDate, endDate: coupon.endDate, 
      usageLimit: coupon.usageLimit, isActive: coupon.isActive
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => setIsModalOpen(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const updatedData = { ...prev, [name]: type === 'checkbox' ? checked : value };
      
      if (name === 'discountType') {
        updatedData.discountValue = value === 'PERCENT' ? '5' : ''; 
        if (value === 'FIXED') {
          updatedData.maxDiscount = ''; 
        }
      }
      return updatedData;
    });
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();

    const payload = {
      code: formData.code,
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      minOrderValue: Number(formData.minOrderValue),
      maxDiscount: formData.discountType === 'FIXED' ? Number(formData.discountValue) : Number(formData.maxDiscount),
      startDate: formData.startDate,
      endDate: formData.endDate,
      usageLimit: Number(formData.usageLimit),
      isActive: formData.isActive,
    };

    try {
      if (modalMode === 'create') {
        const newCoupon = await api.post(API_ENDPOINTS.coupons.create, payload);
        const final_newCoupon =  newCoupon?.data || newCoupon;
        setCoupons((prev) => [final_newCoupon, ...prev]);
        console.log('Mã giảm giá mới:', newCoupon);
        message.success('Tạo mã giảm giá thành công!');
      } else {
        const updatedCoupon = await api.put(API_ENDPOINTS.coupons.update(editingId), payload);
        const final_updatedCoupon = updatedCoupon?.data || updatedCoupon;
        setCoupons((prev) =>
          prev.map((coupon) => (coupon.id === editingId ? { ...coupon, ...final_updatedCoupon } : coupon))
        );
        message.success('Cập nhật mã giảm giá thành công!');
      }
      handleCloseModal();
    } catch (error) {
      console.error('Lỗi lưu mã khuyến mãi', error);
      message.error('Không thể lưu mã giảm giá.');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này không? Hành động này không thể hoàn tác.')) {
      return;
    }

    try {
      await api.delete(API_ENDPOINTS.coupons.delete(id));
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      message.success('Đã xóa mã giảm giá!');
    } catch (error) {
      console.error('Lỗi xóa mã giảm giá', error);
      message.error('Không thể xóa mã giảm giá.');
    }
  };

  // =========================================================================
  // LỌC VÀ PHÂN TRANG FRONTEND
  // =========================================================================
  const handleApplyFilter = () => {
    setAppliedFilters({ searchCode, typeFilter, statusFilter });
    setCurrentPage(1); 
  };

  // ĐÃ SỬA LẠI HOÀN TOÀN LOGIC LỌC
  const filteredCoupons = useMemo(() => {
    return coupons.filter(c => {
      if (!c) return false;

      // Lọc theo mã và loại
      if (appliedFilters.searchCode && !c.code.toLowerCase().includes(appliedFilters.searchCode.toLowerCase())) return false;
      if (appliedFilters.typeFilter && c.discountType !== appliedFilters.typeFilter) return false;
      
      // Lọc chi tiết theo trạng thái (kết hợp isActive, lượt dùng và thời gian)
      if (appliedFilters.statusFilter) {
        const now = new Date();
        const startDate = new Date(c.startDate);
        const endDate = new Date(c.endDate);
        const currentUsage = c.currentUsage || 0;
        const usageLimit = c.usageLimit || 1;

        const isLocked = !c.isActive;
        const isExpired = endDate < now;
        const isUpcoming = startDate > now;
        const isFullyUsed = currentUsage >= usageLimit;

        switch (appliedFilters.statusFilter) {
          case 'LOCKED':
            if (!isLocked) return false; // Chỉ lấy mã bị khóa
            break;
          case 'UPCOMING':
            if (isLocked || !isUpcoming) return false; // Chỉ lấy mã chưa đến hạn (và đang bật)
            break;
          case 'EXPIRED':
            if (isLocked || (!isExpired && !isFullyUsed)) return false; // Chỉ lấy mã hết hạn hoặc hết lượt
            break;
          case 'ACTIVE':
            if (isLocked || isExpired || isFullyUsed || isUpcoming) return false; // Chỉ lấy mã đang chạy ngon lành
            break;
          default:
            break;
        }
      }
      return true;
    });
  }, [coupons, appliedFilters]);

  const totalPages = Math.ceil(filteredCoupons.length / pageSize) || 1;
  const paginatedCoupons = filteredCoupons.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const formatCurrency = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  return (
    <div className="max-w-[1200px] mx-auto animate-fade-in transition-colors duration-500 relative">
      
      {/* --- HEADER --- */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1 flex items-center gap-2">
            <TagOutlined className="text-orange-600" /> Quản lý Khuyến mãi
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Tạo và quản lý các mã giảm giá (Coupon) trên toàn hệ thống.</p>
        </div>
        <button 
          onClick={handleOpenCreateModal}
          className="bg-orange-600 text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-700 transition-colors shadow-sm"
        >
          <PlusOutlined /> Tạo mã mới
        </button>
      </div>

      {/* --- BỘ LỌC --- */}
      <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mã Coupon</label>
            <div className="relative">
              <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Nhập mã..." value={searchCode} onChange={(e) => setSearchCode(e.target.value)} className="w-full bg-transparent pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 focus:border-orange-500 focus:ring-1 outline-none text-sm text-gray-800 dark:text-gray-200 uppercase" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Loại giảm giá</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full bg-transparent px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 focus:border-orange-500 focus:ring-1 outline-none text-sm text-gray-800 dark:text-gray-200 appearance-none cursor-pointer">
              <option value="" className="dark:bg-slate-800">Tất cả</option>
              <option value="PERCENT" className="dark:bg-slate-800">Giảm theo %</option>
              <option value="FIXED" className="dark:bg-slate-800">Giảm tiền mặt</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trạng thái</label>
            {/* ĐÃ SỬA: Cập nhật lại Select option cho filter trạng thái */}
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-transparent px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 focus:border-orange-500 focus:ring-1 outline-none text-sm text-gray-800 dark:text-gray-200 appearance-none cursor-pointer">
              <option value="" className="dark:bg-slate-800">Tất cả trạng thái</option>
              <option value="ACTIVE" className="dark:bg-slate-800">Đang hoạt động</option>
              <option value="UPCOMING" className="dark:bg-slate-800">Sắp diễn ra</option>
              <option value="EXPIRED" className="dark:bg-slate-800">Hết hạn / Hết lượt</option>
              <option value="LOCKED" className="dark:bg-slate-800">Đã khóa</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 justify-end">
            <button onClick={handleApplyFilter} className="bg-gray-800 dark:bg-slate-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-gray-900 dark:hover:bg-slate-500 active:scale-[0.98] transition-all w-full h-[38px] shadow-sm">Áp dụng bộ lọc</button>
          </div>
        </div>
      </section>

      {/* --- DATA TABLE --- */}
      <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
                <th className="text-sm font-semibold text-gray-800 dark:text-gray-200 py-4 px-4">Mã Coupon</th>
                <th className="text-sm font-semibold text-gray-800 dark:text-gray-200 py-4 px-4">Mức giảm</th>
                <th className="text-sm font-semibold text-gray-800 dark:text-gray-200 py-4 px-4">Điều kiện</th>
                <th className="text-sm font-semibold text-gray-800 dark:text-gray-200 py-4 px-4">Đã dùng</th>
                <th className="text-sm font-semibold text-gray-800 dark:text-gray-200 py-4 px-4">Thời gian</th>
                <th className="text-sm font-semibold text-gray-800 dark:text-gray-200 py-4 px-4 text-center">Trạng thái</th>
                <th className="text-sm font-semibold text-gray-800 dark:text-gray-200 py-4 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {paginatedCoupons.map(coupon => {
                if (!coupon) return null;
                const currentUsage = coupon.currentUsage || 0;
                const usageLimit = coupon.usageLimit || 1; 
                const percentUsed = Math.min((currentUsage / usageLimit) * 100, 100);

                const now = new Date();
                const startDate = new Date(coupon.startDate);
                const endDate = new Date(coupon.endDate);
                
                const isExpired = endDate < now;
                const isUpcoming = startDate > now;
                const isFullyUsed = currentUsage >= usageLimit;

                return (
                  <tr key={coupon.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="py-4 px-4"><span className="inline-block px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 font-mono font-bold rounded border border-orange-200 dark:border-orange-800 text-sm">{coupon.code}</span></td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 font-bold text-gray-800 dark:text-gray-200">
                        {coupon.discountType === 'PERCENT' ? <><PercentageOutlined className="text-blue-500" /> {coupon.discountValue}%</> : <><DollarOutlined className="text-emerald-500" /> {formatCurrency(coupon.discountValue)}</>}
                      </div>
                      {coupon.discountType === 'PERCENT' && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tối đa: {formatCurrency(coupon.maxDiscount)}</div>
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300">Đơn tối thiểu:<br/><span className="font-semibold text-gray-800 dark:text-gray-200">{formatCurrency(coupon.minOrderValue)}</span></td>
                    <td className="py-4 px-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-gray-700 dark:text-gray-300">{currentUsage}</span>
                        <span className="text-gray-500 dark:text-gray-400">/ {coupon.usageLimit}</span>
                      </div>
                      <Progress percent={percentUsed} showInfo={false} size="small" strokeColor={percentUsed >= 100 ? '#ef4444' : '#f97316'} />
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-500 dark:text-gray-400 font-mono">
                      <div>{startDate.toLocaleDateString('vi-VN')}</div>
                      <div className={(isExpired || isFullyUsed) ? "text-red-500 font-bold" : ""}>{endDate.toLocaleDateString('vi-VN')}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide inline-block 
                        ${(!coupon.isActive) ? 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300' : 
                          (isExpired || isFullyUsed) ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                          (isUpcoming) ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 
                          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                        {!coupon.isActive ? 'Đã khóa' : isExpired ? 'Hết hạn' : isFullyUsed ? 'Hết lượt' : isUpcoming ? 'Sắp diễn ra' : 'Đang hoạt động'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleOpenEditModal(coupon)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors" title="Chỉnh sửa"><EditOutlined /></button>
                        <button onClick={() => handleDeleteCoupon(coupon.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors" title="Xóa"><DeleteOutlined /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedCoupons.length === 0 && <tr><td colSpan="7" className="py-12 text-center text-gray-500 dark:text-gray-400 font-medium">Không tìm thấy mã giảm giá nào.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION --- */}
        <div className="bg-white dark:bg-slate-800 px-4 py-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Hiển thị {paginatedCoupons.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, filteredCoupons.length)} trên tổng {filteredCoupons.length} mã
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"><LeftOutlined className="text-xs" /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => handlePageChange(page)} className={`w-8 h-8 rounded text-sm font-bold flex items-center justify-center shadow-sm ${currentPage === page ? 'bg-orange-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'}`}>{page}</button>
            ))}
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed"><RightOutlined className="text-xs" /></button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MODAL THÊM / SỬA KHUYẾN MÃI
      ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 m-0">{modalMode === 'create' ? 'Tạo mã khuyến mãi mới' : 'Cập nhật mã khuyến mãi'}</h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-red-500 transition-colors p-1"><CloseOutlined className="text-xl" /></button>
            </div>

            <form id="couponForm" onSubmit={handleSaveCoupon} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Mã Coupon *</label>
                  <input required name="code" value={formData.code} onChange={handleInputChange} type="text" placeholder="VD: MEGA2026" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-500 uppercase font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Loại giảm giá *</label>
                  <select required name="discountType" value={formData.discountType} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-500">
                    <option value="PERCENT">Giảm theo phần trăm (%)</option>
                    <option value="FIXED">Giảm tiền mặt (VND)</option>
                  </select>
                </div>
              </div>

              <div className={`grid grid-cols-1 gap-4 ${formData.discountType === 'PERCENT' ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                    {formData.discountType === 'PERCENT' ? 'Mức giảm (%) *' : 'Mức giảm (VND) *'}
                  </label>
                  {formData.discountType === 'PERCENT' ? (
                    <select required name="discountValue" value={formData.discountValue} onChange={handleInputChange} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-500">
                      {Array.from({ length: 20 }, (_, i) => (i + 1) * 5).map(val => (
                        <option key={val} value={val}>{val}%</option>
                      ))}
                    </select>
                  ) : (
                    <input required name="discountValue" value={formData.discountValue} onChange={handleInputChange} type="number" min="1" placeholder="VD: 50000" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-500" />
                  )}
                </div>

                {formData.discountType === 'PERCENT' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Giảm tối đa (VND) *</label>
                    <input required name="maxDiscount" value={formData.maxDiscount} onChange={handleInputChange} type="number" min="0" placeholder="VD: 100000" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-500" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Đơn tối thiểu (VND) *</label>
                  <input required name="minOrderValue" value={formData.minOrderValue} onChange={handleInputChange} type="number" min="0" placeholder="VD: 200000" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-500" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Thời gian bắt đầu *</label>
                  <input required name="startDate" value={formData.startDate} onChange={handleInputChange} type="datetime-local" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Thời gian kết thúc *</label>
                  <input required name="endDate" value={formData.endDate} onChange={handleInputChange} type="datetime-local" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Giới hạn lượt dùng *</label>
                  <input required name="usageLimit" value={formData.usageLimit} onChange={handleInputChange} type="number" min="1" placeholder="VD: 100" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-500" />
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-50 dark:bg-slate-700/30 rounded-lg border border-gray-200 dark:border-slate-600 flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-800 dark:text-gray-200 m-0">Kích hoạt mã</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 m-0">Cho phép người dùng sử dụng mã này ngay lập tức</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-slate-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                </label>
              </div>
            </form>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button type="button" onClick={handleCloseModal} className="px-6 py-2 rounded-lg font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors">Hủy</button>
              <button type="submit" form="couponForm" className="px-6 py-2 rounded-lg font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-sm">{modalMode === 'create' ? 'Tạo Khuyến Mãi' : 'Lưu Thay Đổi'}</button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
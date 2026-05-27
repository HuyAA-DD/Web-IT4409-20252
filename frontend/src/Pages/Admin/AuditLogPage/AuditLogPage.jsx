import React, { useState, useMemo, useEffect } from 'react';
import { 
  DownloadOutlined, 
  UserOutlined, 
  RightOutlined,
  MinusOutlined,
  PlusOutlined,
  LeftOutlined
} from '@ant-design/icons';
import api from '../../../Apis/apiConfig';
import API_ENDPOINTS from '../../../Apis/apiEndpoints';

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- STATES BỘ LỌC ---
  const [searchUser, setSearchUser] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [appliedFilters, setAppliedFilters] = useState({
    searchUser: '', actionFilter: '', startDate: '', endDate: ''
  });

  // --- STATES PHÂN TRANG (PAGINATION) ---
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5; // Số bản ghi trên 1 trang

  // Hàm xử lý khi bấm "Áp dụng bộ lọc"
  const handleApplyFilter = () => {
    setAppliedFilters({ searchUser, actionFilter, startDate, endDate });
    setCurrentPage(1); // QUAN TRỌNG: Reset về trang 1 khi đổi bộ lọc
    setExpandedRowKeys([]); // Đóng tất cả các hàng đang mở
  };

  useEffect(() => {
    const fetchAuditLogs = async () => {
      setIsLoading(true);
      try {
        const params = {
          user: appliedFilters.searchUser || undefined,
          action: appliedFilters.actionFilter || undefined,
          startDate: appliedFilters.startDate || undefined,
          endDate: appliedFilters.endDate || undefined,
          page: currentPage - 1,
          size: pageSize,
        };

        const response = await api.get(API_ENDPOINTS.auditLogs.list, params);
        const data = response?.data || response;

        if (Array.isArray(data?.content)) {
          setLogs(data.content);
        } else if (Array.isArray(data)) {
          setLogs(data);
        } else {
          setLogs([]);
        }
      } catch (error) {
        console.error('Lỗi tải nhật ký hệ thống', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuditLogs();
  }, [appliedFilters, currentPage]);

  // 1. CHẠY BỘ LỌC TRƯỚC
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      if (appliedFilters.searchUser) {
        const searchTerm = appliedFilters.searchUser.toLowerCase();
        const userNameMatch = log.userName.toLowerCase().includes(searchTerm);
        const userIdMatch = log.userId.toLowerCase().includes(searchTerm);
        if (!userNameMatch && !userIdMatch) return false;
      }

      if (appliedFilters.actionFilter && log.action !== appliedFilters.actionFilter) {
        return false;
      }

      const logDateStr = log.createdAt.substring(0, 10); 
      if (appliedFilters.startDate && logDateStr < appliedFilters.startDate) return false;
      if (appliedFilters.endDate && logDateStr > appliedFilters.endDate) return false;

      return true;
    });
  }, [logs, appliedFilters]);

  // 2. CHẠY PHÂN TRANG DỰA TRÊN KẾT QUẢ ĐÃ LỌC
  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Hàm chuyển trang
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setExpandedRowKeys([]); // Chuyển trang thì đóng các hàng đang mở
    }
  };

  const toggleRowExpand = (id) => {
    setExpandedRowKeys(prev => prev.includes(id) ? prev.filter(key => key !== id) : [...prev, id]);
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATE': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'UPDATE': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'DELETE': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300';
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto animate-fade-in transition-colors duration-500">
      
      {/* --- PAGE HEADER --- */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-1">Nhật ký hệ thống (Audit Log)</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Theo dõi và kiểm tra các thay đổi dữ liệu quan trọng trong hệ thống.</p>
        </div>
        <button className="bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
          <DownloadOutlined className="text-lg" /> Xuất báo cáo
        </button>
      </div>

      {/* --- FILTER SECTION --- */}
      <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Người dùng</label>
            <div className="relative">
              <UserOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Tên hoặc Email..." 
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="w-full bg-transparent pl-9 pr-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm text-gray-800 dark:text-gray-200 transition-all"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hành động</label>
            <select 
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full bg-transparent px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm text-gray-800 dark:text-gray-200 transition-all appearance-none cursor-pointer"
            >
              <option value="" className="dark:bg-slate-800">Tất cả hành động</option>
              <option value="CREATE" className="dark:bg-slate-800">Thêm mới (CREATE)</option>
              <option value="UPDATE" className="dark:bg-slate-800">Cập nhật (UPDATE)</option>
              <option value="DELETE" className="dark:bg-slate-800">Xóa (DELETE)</option>
            </select>
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Khoảng thời gian</label>
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-transparent px-2 py-2 rounded-lg border border-gray-200 dark:border-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm text-gray-800 dark:text-gray-200 transition-all cursor-pointer"
              />
              <span className="text-gray-400">-</span>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-transparent px-2 py-2 rounded-lg border border-gray-200 dark:border-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm text-gray-800 dark:text-gray-200 transition-all cursor-pointer"
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-1 justify-end">
            <button 
              onClick={handleApplyFilter}
              className="bg-orange-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-orange-700 active:scale-[0.98] transition-all w-full h-[38px] shadow-sm"
            >
              Áp dụng bộ lọc
            </button>
          </div>
        </div>
      </section>

      {/* --- DATA TABLE SECTION --- */}
      <section className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors duration-500">
        <div className="overflow-x-auto w-full min-h-[350px]">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
                <th className="py-3 px-4 w-12 text-center"></th>
                <th className="text-sm font-semibold text-gray-800 dark:text-gray-200 py-3 px-4">Thời gian</th>
                <th className="text-sm font-semibold text-gray-800 dark:text-gray-200 py-3 px-4">Người dùng</th>
                <th className="text-sm font-semibold text-gray-800 dark:text-gray-200 py-3 px-4">Hành động</th>
                <th className="text-sm font-semibold text-gray-800 dark:text-gray-200 py-3 px-4">Đối tượng</th>
                <th className="text-sm font-semibold text-gray-800 dark:text-gray-200 py-3 px-4 text-right">Địa chỉ IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              
              {/* RENDER MẢNG ĐÃ ĐƯỢC PHÂN TRANG: paginatedLogs */}
              {paginatedLogs.map(log => {
                const isExpanded = expandedRowKeys.includes(log.id);
                
                return (
                  <React.Fragment key={log.id}>
                    <tr 
                      onClick={() => toggleRowExpand(log.id)}
                      className={`transition-colors cursor-pointer ${isExpanded ? 'bg-gray-50 dark:bg-slate-700/30' : 'hover:bg-gray-50 dark:hover:bg-slate-700/50'}`}
                    >
                      <td className="py-3 px-4 text-center text-gray-400 hover:text-orange-600">
                        <RightOutlined className={`text-sm transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(log.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200 font-medium">{log.userName}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${getActionBadge(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-800 dark:text-gray-200">{log.entityType}: {log.entityId}</td>
                      <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400 text-right font-mono">{log.ipAddress}</td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-gray-50 dark:bg-slate-800/80 border-b-2 border-gray-200 dark:border-slate-700">
                        <td colSpan="6" className="p-0">
                          <div className="px-8 py-4 flex flex-col gap-3 shadow-inner">
                            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Chi tiết thay đổi</h4>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div className="border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2 border-b border-red-200 dark:border-red-900/50 pb-2">
                                  <MinusOutlined className="text-red-500" />
                                  <span className="text-sm font-bold text-red-600 dark:text-red-400">Giá trị cũ (Old Value)</span>
                                </div>
                                <pre className="font-mono text-xs leading-relaxed text-gray-600 dark:text-gray-400 whitespace-pre-wrap break-words">{log.oldValue || "null"}</pre>
                              </div>
                              <div className="border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/10 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2 border-b border-green-200 dark:border-green-900/50 pb-2">
                                  <PlusOutlined className="text-green-600" />
                                  <span className="text-sm font-bold text-green-700 dark:text-green-400">Giá trị mới (New Value)</span>
                                </div>
                                <pre className="font-mono text-xs leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">{log.newValue || "null"}</pre>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              
              {paginatedLogs.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500 dark:text-gray-400 font-medium">Không tìm thấy nhật ký hệ thống khớp với bộ lọc.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- PAGINATION (UI CHUẨN XÁC) --- */}
        <div className="bg-white dark:bg-slate-800 px-4 py-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Hiển thị {paginatedLogs.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, filteredLogs.length)} trên tổng số {filteredLogs.length} bản ghi
          </span>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <LeftOutlined className="text-xs" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button 
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-8 h-8 rounded text-sm font-bold flex items-center justify-center transition-colors shadow-sm ${
                  currentPage === page 
                    ? 'bg-orange-600 text-white' 
                    : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium'
                }`}
              >
                {page}
              </button>
            ))}

            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <RightOutlined className="text-xs" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
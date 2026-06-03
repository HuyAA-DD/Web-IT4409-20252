import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SearchOutlined, 
  FilterOutlined, 
  EyeOutlined, 
  DownloadOutlined,
  CalendarOutlined,
  LeftOutlined,
  RightOutlined,
  EditOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { message } from 'antd'; // Dùng để hiện thông báo thành công
import useDebounce from '../../../Hooks/useDebounce';
import ADMIN_ROUTE from '../../../Routes/Admin.routes';
import api from '../../../Apis/apiConfig';
import API_ENDPOINTS from '../../../Apis/apiEndpoints';

export default function OrderListPage() {
  const navigate = useNavigate();
  
  // States cho Bộ lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  const finalSearchTerm = useDebounce(searchTerm, 500);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // States cho Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(API_ENDPOINTS.admin.orders);
        setOrders(response?.data || response || []);
      } catch (error) {
        console.error('Lỗi khi tải danh sách đơn hàng', error);
        message.error('Không thể tải đơn hàng.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // =========================================================================
  // LOGIC MODAL: CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
  // =========================================================================
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  // Hàm mở Modal
  const handleOpenEditModal = (order) => {
    setEditingOrder(order);
    setNewStatus(order.status); // Lấy trạng thái hiện tại làm mặc định
    setIsEditModalOpen(true);
  };

  // Hàm đóng Modal
  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingOrder(null);
  };

  // Hàm Lưu (Gọi API)
  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      const response = await api.put(API_ENDPOINTS.admin.updateOrderStatus(editingOrder.id), {
        status: newStatus,
      });
      const updatedOrder = response?.data || response;

      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o.id === editingOrder.id ? { ...o, ...updatedOrder } : o
        )
      );
      message.success(`Đã cập nhật trạng thái đơn hàng thành ${newStatus}!`);
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái đơn hàng', error);
      message.error('Lỗi cập nhật trạng thái!');
      return;
    }

    handleCloseModal();
  };

  // =========================================================================
  // LOGIC LỌC VÀ PHÂN TRANG
  // =========================================================================
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      const searchLower = finalSearchTerm.toLowerCase();
      const matchesSearch = 
        order.id.toLowerCase().includes(searchLower) ||
        order.customer.toLowerCase().includes(searchLower) ||
        order.email.toLowerCase().includes(searchLower);
      const matchesDate = !dateFilter || order.date === dateFilter;

      return matchesStatus && matchesSearch && matchesDate;
    });
  }, [orders, statusFilter, finalSearchTerm, dateFilter]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [finalSearchTerm, statusFilter, dateFilter]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'SHIPPED': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'DELIVERED': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'CANCELLED': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300';
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-fade-in transition-colors duration-500 relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 m-0">Quản lý Đơn hàng</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm m-0 mt-1">Theo dõi và xử lý tất cả đơn hàng trên hệ thống.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm shadow-sm">
          <DownloadOutlined /> Xuất File Excel
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center transition-colors">
        <div className="relative w-full md:max-w-md">
          <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm theo Mã ĐH, Tên khách, Email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-sm"
          />
        </div>

        <div className="flex w-full md:w-auto gap-3 overflow-x-auto">
          <div className="relative shrink-0">
            <FilterOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-transparent focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm text-gray-700 dark:text-gray-200 cursor-pointer"
            >
              <option value="ALL" className="dark:bg-slate-800">Tất cả trạng thái</option>
              <option value="PENDING" className="dark:bg-slate-800">Pending (Chờ xử lý)</option>
              <option value="SHIPPED" className="dark:bg-slate-800">Shipped (Đang giao)</option>
              <option value="DELIVERED" className="dark:bg-slate-800">Delivered (Hoàn thành)</option>
              <option value="CANCELLED" className="dark:bg-slate-800">Cancelled (Đã hủy)</option>
            </select>
          </div>
          <div className="relative shrink-0">
            <CalendarOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-8 pr-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-transparent focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-sm text-gray-700 dark:text-gray-200 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="p-4 font-semibold">Mã ĐH</th>
                <th className="p-4 font-semibold">Khách hàng</th>
                <th className="p-4 font-semibold">Ngày đặt</th>
                <th className="p-4 font-semibold text-right">Tổng tiền</th>
                <th className="p-4 font-semibold text-center">Trạng thái</th>
                <th className="p-4 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {paginatedOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-4 text-sm font-mono text-gray-600 dark:text-gray-400 font-medium">
                    #{order.id.substring(0, 8)}...
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-gray-800 dark:text-gray-200 text-sm m-0">{order.customer}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 m-0">{order.email}</p>
                  </td>
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(order.date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="p-4 font-bold text-orange-600 dark:text-orange-400 text-sm text-right">
                    {`$${Number(order.total || 0).toFixed(2)}`}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide inline-block ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {/* Nút Xem chi tiết */}
                      <button 
                        onClick={() => navigate(`/orders/${order.id}`)}
                        title="Xem chi tiết"
                        className="p-2 text-gray-500 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                      >
                        <EyeOutlined className="text-lg" />
                      </button>
                      {/* Nút Cập nhật trạng thái */}
                      <button 
                        onClick={() => handleOpenEditModal(order)}
                        title="Cập nhật trạng thái"
                        className="p-2 text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors cursor-pointer"
                      >
                        <EditOutlined className="text-lg" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {paginatedOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium">Không tìm thấy đơn hàng nào khớp với bộ lọc.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PHÂN TRANG */}
        <div className="bg-white dark:bg-slate-800 p-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between transition-colors">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Hiển thị {paginatedOrders.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, filteredOrders.length)} trên tổng số {filteredOrders.length} đơn hàng
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 disabled:opacity-30 transition-colors"><LeftOutlined className="text-xs" /></button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => handlePageChange(page)} className={`w-8 h-8 rounded text-sm font-bold flex items-center justify-center transition-colors shadow-sm ${currentPage === page ? 'bg-orange-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium'}`}>{page}</button>
            ))}
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 disabled:opacity-30 transition-colors"><RightOutlined className="text-xs" /></button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL: CẬP NHẬT TRẠNG THÁI (PORTAL OVERLAY)
      ========================================================================= */}
      {isEditModalOpen && editingOrder && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 m-0">Cập nhật trạng thái</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-0 font-mono">Đơn hàng: #{editingOrder.id.substring(0, 8)}</p>
              </div>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                <CloseOutlined className="text-xl" />
              </button>
            </div>

            {/* Modal Body */}
            <form id="statusForm" onSubmit={handleSaveStatus} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Trạng thái mới</label>
                <select 
                  required
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)} 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                >
                  <option value="PENDING">Chờ xử lý (PENDING)</option>
                  <option value="SHIPPED">Đang giao hàng (SHIPPED)</option>
                  <option value="DELIVERED">Đã hoàn thành (DELIVERED)</option>
                  <option value="CANCELLED">Đã hủy (CANCELLED)</option>
                </select>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 p-3 rounded-lg text-xs">
                <strong>Lưu ý:</strong> Việc thay đổi trạng thái sẽ gửi email thông báo tự động đến khách hàng <strong>{editingOrder.customer}</strong>.
              </div>
            </form>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={handleCloseModal} 
                className="px-5 py-2 rounded-lg font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
              >
                Hủy
              </button>
              <button 
                type="submit" 
                form="statusForm" 
                className="px-5 py-2 rounded-lg font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors shadow-sm"
              >
                Lưu Thay Đổi
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
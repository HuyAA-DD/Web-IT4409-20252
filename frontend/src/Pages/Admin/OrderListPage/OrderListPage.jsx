import React, { useState, useMemo, useEffect } from 'react';
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
import api from '../../../Apis/apiConfig';
import API_ENDPOINTS from '../../../Apis/apiEndpoints';

const extractData = (payload) => {
  if (payload?.data !== undefined) return payload.data;
  return payload;
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(Number(value || 0));
};

const getShortId = (id) => {
  if (!id) return 'N/A';
  return String(id).slice(0, 8);
};

const getOrderDate = (order) => order.createdAt || order.date;

const getOrderCustomer = (order) =>
  order.customer || order.userName || order.address?.recipientName || 'N/A';

const getOrderEmail = (order) => order.email || order.userEmail || 'N/A';

const getOrderPhone = (order) => order.phone || order.address?.phone || order.address?.recipientPhone || 'N/A';
const getOrderAddress = (order) => {
  const address = order.address || order.shippingAddress || order.deliveryAddress;
  if (!address) return 'N/A';
  const parts = [
    address.recipientName,
    address.street,
    address.ward,
    address.district,
    address.city,
    address.state,
    address.country,
    address.postalCode,
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : 'N/A';
};
const getOrderPayment = (order) => order.paymentMethod || order.paymentType || order.payment || 'N/A';
const getOrderItems = (order) => order.items || order.orderItems || [];

export default function OrderListPage() {
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
        const data = extractData(response);
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Lỗi khi tải danh sách đơn hàng', error);
        message.error('Không thể tải đơn hàng.');
        setOrders([]);
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
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);

  // Hàm mở Modal xem chi tiết đơn hàng
  const handleOpenViewModal = (order) => {
    setViewOrder(order);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewOrder(null);
  };

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
      const updatedOrder = extractData(response);

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
      const orderId = String(order.id || '');
      const customer = getOrderCustomer(order).toLowerCase();
      const email = getOrderEmail(order).toLowerCase();
      const orderDate = getOrderDate(order);
      const matchesSearch = 
        orderId.toLowerCase().includes(searchLower) ||
        customer.includes(searchLower) ||
        email.includes(searchLower);
      const matchesDate = !dateFilter || (orderDate && String(orderDate).slice(0, 10) === dateFilter);

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
      case 'CONFIRMED': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'PROCESSING': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
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
              <option value="CONFIRMED" className="dark:bg-slate-800">Confirmed (Đã xác nhận)</option>
              <option value="PROCESSING" className="dark:bg-slate-800">Processing (Đang xử lý)</option>
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
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium">Đang tải đơn hàng...</td>
                </tr>
              ) : paginatedOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-4 text-sm font-mono text-gray-600 dark:text-gray-400 font-medium">
                    #{getShortId(order.id)}...
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-gray-800 dark:text-gray-200 text-sm m-0">{getOrderCustomer(order)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 m-0">{getOrderEmail(order)}</p>
                  </td>
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                    {getOrderDate(order) ? new Date(getOrderDate(order)).toLocaleDateString('vi-VN') : 'N/A'}
                  </td>
                  <td className="p-4 font-bold text-orange-600 dark:text-orange-400 text-sm text-right">
                    {formatCurrency(order.totalAmount ?? order.total)}
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
                        onClick={() => handleOpenViewModal(order)}
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
              
              {!isLoading && paginatedOrders.length === 0 && (
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
          MODAL: XEM CHI TIẾT ĐƠN HÀNG
      ========================================================================= */}
      {isViewModalOpen && viewOrder && (
        <div className="fixed inset-0 z-[998] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 m-0">Chi tiết đơn hàng</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-0 font-mono">Mã đơn: #{getShortId(viewOrder.id)} | Trạng thái: {viewOrder.status || 'N/A'}</p>
              </div>
              <button onClick={handleCloseViewModal} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                <CloseOutlined className="text-xl" />
              </button>
            </div>

            <div className="p-6 grid gap-4">
              <div className="grid gap-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">Khách hàng</span>
                  <span>{getOrderCustomer(viewOrder)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">Email</span>
                  <span>{getOrderEmail(viewOrder)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">Số điện thoại</span>
                  <span>{getOrderPhone(viewOrder)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">Ngày đặt</span>
                  <span>{getOrderDate(viewOrder) ? new Date(getOrderDate(viewOrder)).toLocaleString('vi-VN') : 'N/A'}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">Địa chỉ giao hàng</span>
                  <span>{getOrderAddress(viewOrder)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">Phương thức thanh toán</span>
                  <span>{getOrderPayment(viewOrder)}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">Tổng tiền</span>
                  <span>{formatCurrency(viewOrder.totalAmount ?? viewOrder.total)}</span>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-700">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Sản phẩm trong đơn</h4>
                {getOrderItems(viewOrder).length > 0 ? (
                  <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                    {getOrderItems(viewOrder).map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-7 font-medium text-gray-800 dark:text-gray-200">{item.name || item.productName || item.title || 'Sản phẩm #' + (index + 1)}</div>
                        <div className="col-span-2 text-right">x{item.quantity ?? item.qty ?? 1}</div>
                        <div className="col-span-3 text-right font-semibold text-orange-600 dark:text-orange-400">{formatCurrency(item.price ?? item.unitPrice ?? item.totalPrice)}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Không có thông tin sản phẩm chi tiết trong đơn này.</p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex justify-end">
              <button 
                type="button" 
                onClick={handleCloseViewModal} 
                className="px-5 py-2 rounded-lg font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

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
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-0 font-mono">Đơn hàng: #{getShortId(editingOrder.id)}</p>
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
                  <option value="CONFIRMED">Đã xác nhận (CONFIRMED)</option>
                  <option value="PROCESSING">Đang xử lý (PROCESSING)</option>
                  <option value="SHIPPED">Đang giao hàng (SHIPPED)</option>
                  <option value="DELIVERED">Đã hoàn thành (DELIVERED)</option>
                  <option value="CANCELLED">Đã hủy (CANCELLED)</option>
                </select>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 p-3 rounded-lg text-xs">
                <strong>Lưu ý:</strong> Việc thay đổi trạng thái sẽ gửi email thông báo tự động đến khách hàng <strong>{getOrderCustomer(editingOrder)}</strong>.
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

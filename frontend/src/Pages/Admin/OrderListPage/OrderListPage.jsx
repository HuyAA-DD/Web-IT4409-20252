import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  SearchOutlined, 
  FilterOutlined, 
  EyeOutlined, 
  DownloadOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import ADMIN_ROUTE from '../../../Routes/Admin.routes';

// FIXME: [MOCK_DATA] - Xóa dữ liệu này khi kết nối API
const mockOrderList = [
  { id: "f47ac10b-58cc-4372-a567-0e02b2c3d479", customer: "Jane Doe", email: "jane@example.com", total: 1364.98, status: "PENDING", date: "2023-10-24" },
  { id: "e28bc21c-69dd-4123-b123-123456789abc", customer: "John Smith", email: "john@example.com", total: 54.00, status: "DELIVERED", date: "2023-10-23" },
  { id: "a12bc34d-89ee-4f3a-9c2b-ab1234567890", customer: "Alice Nguyen", email: "alice@example.com", total: 899.50, status: "SHIPPED", date: "2023-10-22" },
  { id: "b34cd56e-12ff-4444-5555-666666666666", customer: "Bob Tran", email: "bob@example.com", total: 12.99, status: "CANCELLED", date: "2023-10-21" },
  { id: "c56de78f-34aa-7777-8888-999999999999", customer: "Charlie Le", email: "charlie@example.com", total: 340.00, status: "PENDING", date: "2023-10-24" },
];

export default function OrderListPage() {
  const navigate = useNavigate();
  
  // States cho Bộ lọc giao diện
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('');
  
  // FIXME: [MOCK_DATA] - Đổi state khởi tạo thành useState([]) khi nối API thực tế
  const [orders, setOrders] = useState(mockOrderList);

  // ----------------------------------------------------------------------
  // TODO: [API_CALL] - GET /api/v1/admin/orders?search=...&status=...&date=...
  // Sau này khi có API, bạn sẽ gọi axios ở đây và dùng setSearchTerm, setStatusFilter 
  // để kích hoạt useEffect tải lại dữ liệu từ Spring Boot chứ không lọc bằng JS nữa.
  // ----------------------------------------------------------------------

  // LOGIC LỌC TẠM THỜI TẠI FRONTEND
  const filteredOrders = orders.filter(order => {
    // 1. Kiểm tra trạng thái tuyển chọn
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    
    // 2. Kiểm tra ô tìm kiếm (Không phân biệt chữ hoa / chữ thường)
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    // 3. Kiểm tra lọc theo ngày (nếu người dùng có chọn ngày)
    const matchesDate = !dateFilter || order.date === dateFilter;

    return matchesStatus && matchesSearch && matchesDate;
  });

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-blue-100 text-blue-700';
      case 'SHIPPED': return 'bg-purple-100 text-purple-700';
      case 'DELIVERED': return 'bg-emerald-100 text-emerald-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 m-0">Quản lý Đơn hàng</h1>
          <p className="text-gray-500 text-sm m-0 mt-1">Theo dõi và xử lý tất cả đơn hàng trên hệ thống.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm">
          <DownloadOutlined /> Xuất File Excel
        </button>
      </div>

      {/* TOOLBAR: TÌM KIẾM & BỘ LỌC */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Search Bar */}
        <div className="relative w-full md:max-w-md">
          <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm theo Mã ĐH, Tên khách hàng, Email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-orange-500 transition-all text-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex w-full md:w-auto gap-3 overflow-x-auto">
          {/* Lọc Trạng thái */}
          <div className="relative shrink-0">
            <FilterOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-8 pr-8 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-orange-500 text-sm text-gray-700 cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Pending (Chờ xử lý)</option>
              <option value="SHIPPED">Shipped (Đang giao)</option>
              <option value="DELIVERED">Delivered (Hoàn thành)</option>
              <option value="CANCELLED">Cancelled (Đã hủy)</option>
            </select>
          </div>

          {/* Lọc Thời gian */}
          <div className="relative shrink-0">
            <CalendarOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-8 pr-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:border-orange-500 text-sm text-gray-700 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU ĐƠN HÀNG */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <th className="p-4 font-semibold">Mã ĐH</th>
                <th className="p-4 font-semibold">Khách hàng</th>
                <th className="p-4 font-semibold">Ngày đặt</th>
                <th className="p-4 font-semibold">Tổng tiền</th>
                <th className="p-4 font-semibold">Trạng thái</th>
                <th className="p-4 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* ĐỔI THÀNH MAP TỪ MẢNG DỮ LIỆU ĐÃ QUA BỘ LỌC */}
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm font-mono text-gray-600 font-medium">
                    #{order.id.substring(0, 8)}...
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-gray-800 text-sm m-0">{order.customer}</p>
                    <p className="text-xs text-gray-500 m-0">{order.email}</p>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(order.date).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="p-4 font-bold text-orange-600 text-sm">${order.total.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => navigate(ADMIN_ROUTE.Order)} // Chỗ này sau sẽ thay với order/:uuid
                      className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <EyeOutlined className="text-lg" />
                    </button>
                  </td>
                </tr>
              ))}
              
              {/* Nếu lọc xong không ra kết quả nào */}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500 font-medium">Không tìm thấy đơn hàng nào khớp với bộ lọc.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 bg-white">
          <span>Hiển thị {filteredOrders.length} kết quả</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50">Trước</button>
            <button className="px-3 py-1 bg-orange-600 text-white rounded font-bold">1</button>
            <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Sau</button>
          </div>
        </div>
      </div>

    </div>
  );
}
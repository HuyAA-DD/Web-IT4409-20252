import { Link } from "react-router-dom";

function AdminDashboardPage() {
  return (
    <div>
      <div className="admin-page-header">
        <p className="home-badge">Admin Dashboard</p>
        <h2>Tổng quan quản trị</h2>
        <p>
          Đây là khu vực quản trị dành cho admin. Các module quản lý sẽ được
          phát triển lần lượt theo backend API đã có.
        </p>
      </div>

      <section className="admin-stat-grid">
        <div className="admin-stat-card">
          <strong>01</strong>
          <span>Category Management</span>
          <p>Quản lý danh mục sản phẩm.</p>
        </div>

        <div className="admin-stat-card">
          <strong>02</strong>
          <span>Product Management</span>
          <p>Quản lý sản phẩm, tồn kho, trạng thái và hình ảnh.</p>
        </div>

        <div className="admin-stat-card">
          <strong>03</strong>
          <span>Order Management</span>
          <p>Theo dõi đơn hàng và cập nhật trạng thái xử lý.</p>
        </div>

        <div className="admin-stat-card">
          <strong>04</strong>
          <span>Coupon Management</span>
          <p>Tạo, sửa, xóa và kiểm soát mã giảm giá.</p>
        </div>
      </section>

      <section className="admin-module-grid">
        <article className="admin-module-card">
          <h3>Quản lý danh mục</h3>
          <p>
            Tạo danh mục mới, chỉnh sửa tên danh mục, mô tả và trạng thái hiển
            thị.
          </p>
          <Link to="/admin/categories" className="btn btn-primary">
            Vào quản lý danh mục
          </Link>
        </article>

        <article className="admin-module-card">
          <h3>Quản lý sản phẩm</h3>
          <p>
            Thêm sản phẩm, sửa thông tin, cập nhật tồn kho, giá bán và trạng
            thái sản phẩm.
          </p>
          <Link to="/admin/products" className="btn btn-primary">
            Vào quản lý sản phẩm
          </Link>
        </article>

        <article className="admin-module-card">
          <h3>Quản lý đơn hàng</h3>
          <p>
            Xem danh sách đơn hàng, chi tiết đơn hàng và cập nhật trạng thái
            đơn.
          </p>
          <Link to="/admin/orders" className="btn btn-primary">
            Vào quản lý đơn hàng
          </Link>
        </article>

        <article className="admin-module-card">
          <h3>Quản lý mã giảm giá</h3>
          <p>
            Tạo mã giảm giá mới, giới hạn lượt dùng, thời gian hiệu lực và giá
            trị giảm.
          </p>
          <Link to="/admin/coupons" className="btn btn-primary">
            Vào quản lý coupon
          </Link>
        </article>
      </section>
    </div>
  );
}

export default AdminDashboardPage;
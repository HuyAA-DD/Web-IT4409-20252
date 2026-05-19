import { NavLink, Outlet, useNavigate } from "react-router-dom";

import {
  clearAuthData,
  getAuthUser,
} from "../utils/authStorage";

function AdminLayout() {
  const navigate = useNavigate();
  const authUser = getAuthUser();

  const getNavClass = ({ isActive }) => {
    return isActive ? "admin-nav-link active" : "admin-nav-link";
  };

  const handleLogout = () => {
    clearAuthData();
    navigate("/");
  };

  const displayName =
    authUser?.fullName ||
    authUser?.full_name ||
    authUser?.name ||
    authUser?.email ||
    "Admin";

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2>Admin Panel</h2>
          <p>E-Commerce</p>
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin" end className={getNavClass}>
            Dashboard
          </NavLink>

          <NavLink to="/admin/categories" className={getNavClass}>
            Danh mục
          </NavLink>

          <NavLink to="/admin/products" className={getNavClass}>
            Sản phẩm
          </NavLink>

          <NavLink to="/admin/orders" className={getNavClass}>
            Đơn hàng
          </NavLink>

          <NavLink to="/admin/coupons" className={getNavClass}>
            Mã giảm giá
          </NavLink>

          <NavLink to="/admin/notifications" className={getNavClass}>
            Thông báo
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <button
            type="button"
            className="btn btn-outline full-width"
            onClick={() => navigate("/")}
          >
            Về trang user
          </button>

          <button
            type="button"
            className="btn btn-danger full-width"
            onClick={handleLogout}
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <h1>Quản trị hệ thống</h1>
            <p>Quản lý sản phẩm, đơn hàng, coupon và thông báo.</p>
          </div>

          <div className="admin-user-box">
            <span>Xin chào,</span>
            <strong>{displayName}</strong>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AdminLayout;
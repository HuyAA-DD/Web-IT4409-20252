import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import notificationApi from "../../api/notificationApi";
import {
  clearAuthData,
  getAccessToken,
  getAuthUser,
  onAuthChanged,
} from "../../utils/authStorage";

function normalizeNotifications(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.notifications)) {
    return response.notifications;
  }

  if (Array.isArray(response?.data?.notifications)) {
    return response.data.notifications;
  }

  return [];
}

function Header() {
  const navigate = useNavigate();

  const [authUser, setAuthUser] = useState(getAuthUser());
  const [token, setToken] = useState(getAccessToken());
  const [unreadCount, setUnreadCount] = useState(0);

  const getNavClass = ({ isActive }) => {
    return isActive ? "nav-link active" : "nav-link";
  };

  useEffect(() => {
    const syncAuthState = () => {
      setAuthUser(getAuthUser());
      setToken(getAccessToken());
    };

    const unsubscribe = onAuthChanged(syncAuthState);

    window.addEventListener("storage", syncAuthState);

    return () => {
      unsubscribe();
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

  useEffect(() => {
    async function fetchUnreadCount() {
      if (!token) {
        setUnreadCount(0);
        return;
      }

      try {
        const response = await notificationApi.getUnreadNotifications();
        const list = normalizeNotifications(response);

        setUnreadCount(list.length);
      } catch (error) {
        setUnreadCount(0);
      }
    }

    fetchUnreadCount();
  }, [token]);

  const handleLogout = () => {
    clearAuthData();
    setUnreadCount(0);
    navigate("/");
  };

  const displayName =
    authUser?.fullName ||
    authUser?.full_name ||
    authUser?.name ||
    authUser?.email ||
    "Tài khoản";

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo">
          E-Commerce
        </Link>

        <nav className="nav">
          <NavLink to="/" className={getNavClass}>
            Trang chủ
          </NavLink>

          <NavLink to="/products" className={getNavClass}>
            Sản phẩm
          </NavLink>

          <NavLink to="/cart" className={getNavClass}>
            Giỏ hàng
          </NavLink>

          {token && (
            <>
              <NavLink to="/coupons" className={getNavClass}>
                Mã giảm giá
              </NavLink>

              <NavLink to="/wishlist" className={getNavClass}>
                Yêu thích
              </NavLink>

              <NavLink to="/orders" className={getNavClass}>
                Đơn hàng
              </NavLink>

              <NavLink to="/notifications" className={getNavClass}>
                <span className="notification-nav-link">
                  Thông báo
                  {unreadCount > 0 && (
                    <span className="notification-nav-badge">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="header-actions">
          {token ? (
            <>
              <span style={{ color: "#374151", fontWeight: 600 }}>
                {displayName}
              </span>

              <button
                type="button"
                className="btn btn-outline"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">
                Đăng nhập
              </Link>

              <Link to="/register" className="btn btn-primary">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
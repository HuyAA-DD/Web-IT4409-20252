import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

import {
  clearAuthData,
  getAccessToken,
  getAuthUser,
  onAuthChanged,
} from "../../utils/authStorage";

function Header() {
  const navigate = useNavigate();

  const [authUser, setAuthUser] = useState(getAuthUser());
  const [token, setToken] = useState(getAccessToken());

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

  const handleLogout = () => {
    clearAuthData();
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
            <NavLink to="/orders" className={getNavClass}>
              Đơn hàng
            </NavLink>
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
import { Link, NavLink } from "react-router-dom";

function Header() {
  const getNavClass = ({ isActive }) => {
    return isActive ? "nav-link active" : "nav-link";
  };

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
        </nav>

        <div className="header-actions">
          <Link to="/login" className="btn btn-outline">
            Đăng nhập
          </Link>

          <Link to="/register" className="btn btn-primary">
            Đăng ký
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
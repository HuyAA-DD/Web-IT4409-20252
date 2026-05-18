import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="container page">
      <section className="hero">
        <div>
          <p className="eyebrow">IT4409 E-Commerce Project</p>

          <h1>Giao diện bán hàng trực tuyến</h1>

          <p className="hero-description">
            Frontend được tạo lại từ đầu bằng React + Vite. Các chức năng sẽ
            được phát triển lần lượt: sản phẩm, giỏ hàng, đăng nhập, đặt hàng,
            yêu thích và quản trị.
          </p>

          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary">
              Xem sản phẩm
            </Link>

            <Link to="/login" className="btn btn-outline">
              Đăng nhập
            </Link>
          </div>
        </div>

        <div className="hero-card">
          <div className="feature-grid">
            <div className="feature-item">
              <strong>01</strong>
              <span>Product</span>
            </div>

            <div className="feature-item">
              <strong>02</strong>
              <span>Cart</span>
            </div>

            <div className="feature-item">
              <strong>03</strong>
              <span>Order</span>
            </div>

            <div className="feature-item">
              <strong>04</strong>
              <span>Admin</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-grid">
        <div className="info-card">
          <h2>Sản phẩm</h2>
          <p>Hiển thị danh sách, tìm kiếm, lọc và xem chi tiết sản phẩm.</p>
        </div>

        <div className="info-card">
          <h2>Giỏ hàng</h2>
          <p>Thêm sản phẩm vào giỏ, cập nhật số lượng và tính tổng tiền.</p>
        </div>

        <div className="info-card">
          <h2>Đơn hàng</h2>
          <p>Tạo đơn hàng, chọn địa chỉ, thanh toán và theo dõi trạng thái.</p>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
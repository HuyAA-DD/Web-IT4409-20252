import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="container home-hero-inner">
          <div className="home-hero-content">
            <p className="home-badge">IT4409 E-Commerce Project</p>

            <h1>
              Nền tảng bán hàng trực tuyến đơn giản, hiện đại và dễ mở rộng
            </h1>

            <p className="home-hero-description">
              Hệ thống hỗ trợ các chức năng chính của một website thương mại
              điện tử: xem sản phẩm, thêm vào giỏ hàng, đặt hàng, thanh toán,
              yêu thích sản phẩm và quản lý đơn hàng.
            </p>

            <div className="home-hero-actions">
              <Link to="/products" className="btn btn-primary">
                Khám phá sản phẩm
              </Link>

              <Link to="/cart" className="btn btn-outline">
                Xem giỏ hàng
              </Link>
            </div>

            <div className="home-stats">
              <div>
                <strong>Product</strong>
                <span>Danh sách & chi tiết</span>
              </div>

              <div>
                <strong>Cart</strong>
                <span>Giỏ hàng</span>
              </div>

              <div>
                <strong>Order</strong>
                <span>Đặt hàng</span>
              </div>
            </div>
          </div>

          <div className="home-hero-panel">
            <div className="home-panel-card large">
              <span className="home-panel-label">Current module</span>
              <h2>Shopping Flow</h2>
              <p>Product → Cart → Checkout → Order → Payment</p>
            </div>

            <div className="home-panel-grid">
              <div className="home-panel-card">
                <strong>01</strong>
                <span>Browse</span>
              </div>

              <div className="home-panel-card">
                <strong>02</strong>
                <span>Add Cart</span>
              </div>

              <div className="home-panel-card">
                <strong>03</strong>
                <span>Checkout</span>
              </div>

              <div className="home-panel-card">
                <strong>04</strong>
                <span>Payment</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container home-section">
        <div className="home-section-header">
          <p className="home-badge">Main Features</p>
          <h2>Các chức năng người dùng đã triển khai</h2>
          <p>
            Frontend hiện đã có đủ luồng mua hàng cơ bản, có thể tiếp tục mở
            rộng sang review, coupon, notification và admin.
          </p>
        </div>

        <div className="home-feature-grid">
          <div className="home-feature-card">
            <div className="home-feature-icon">🛍️</div>
            <h3>Sản phẩm</h3>
            <p>
              Hiển thị danh sách sản phẩm, xem chi tiết, giá, tồn kho và trạng
              thái sản phẩm.
            </p>
            <Link to="/products">Xem sản phẩm →</Link>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-icon">🛒</div>
            <h3>Giỏ hàng</h3>
            <p>
              Thêm sản phẩm vào giỏ, cập nhật số lượng, xóa sản phẩm và tính
              tổng tiền.
            </p>
            <Link to="/cart">Mở giỏ hàng →</Link>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-icon">📦</div>
            <h3>Đơn hàng</h3>
            <p>
              Tạo đơn hàng, nhập thông tin giao hàng, xem lịch sử đơn hàng và
              hủy đơn khi cần.
            </p>
            <Link to="/orders">Xem đơn hàng →</Link>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-icon">❤️</div>
            <h3>Yêu thích</h3>
            <p>
              Lưu các sản phẩm quan tâm vào danh sách yêu thích để xem lại sau.
            </p>
            <Link to="/wishlist">Xem yêu thích →</Link>
          </div>
        </div>
      </section>

      <section className="container home-section">
        <div className="home-section-header">
          <p className="home-badge">Workflow</p>
          <h2>Luồng mua hàng trong hệ thống</h2>
        </div>

        <div className="home-flow">
          <div className="home-flow-item">
            <span>1</span>
            <h3>Xem sản phẩm</h3>
            <p>Người dùng vào trang sản phẩm và chọn sản phẩm muốn mua.</p>
          </div>

          <div className="home-flow-item">
            <span>2</span>
            <h3>Thêm vào giỏ</h3>
            <p>Sản phẩm được thêm vào giỏ hàng với số lượng đã chọn.</p>
          </div>

          <div className="home-flow-item">
            <span>3</span>
            <h3>Thanh toán</h3>
            <p>Người dùng nhập thông tin giao hàng và tạo đơn hàng.</p>
          </div>

          <div className="home-flow-item">
            <span>4</span>
            <h3>Theo dõi đơn</h3>
            <p>Người dùng xem trạng thái đơn hàng và thanh toán giả lập.</p>
          </div>
        </div>
      </section>

      <section className="container home-cta">
        <div>
          <p className="home-badge">Next step</p>
          <h2>Tiếp tục hoàn thiện giao diện và chức năng</h2>
          <p>
            Sau HomePage, nên polish lại ProductList, ProductCard và Wishlist để
            toàn bộ giao diện đồng bộ hơn.
          </p>
        </div>

        <Link to="/products" className="btn btn-primary">
          Bắt đầu mua hàng
        </Link>
      </section>
    </div>
  );
}

export default HomePage;
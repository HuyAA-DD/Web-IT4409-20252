import { Link } from "react-router-dom";

function NotFoundPage() {
  return (
    <div className="not-found">
      <div className="not-found-card">
        <h1>404</h1>
        <h2>Không tìm thấy trang</h2>
        <p>Đường dẫn bạn đang truy cập không tồn tại.</p>

        <Link to="/" className="btn btn-primary">
          Quay về trang chủ
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
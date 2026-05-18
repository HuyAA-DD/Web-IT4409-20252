import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import authApi from "../api/authApi";
import { saveAuthData } from "../utils/authStorage";

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || "/";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      toast.error("Vui lòng nhập email và mật khẩu");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await authApi.login({
        email: formData.email.trim(),
        password: formData.password,
      });

      saveAuthData(response, {
        email: formData.email.trim(),
      });

      toast.success("Đăng nhập thành công");
      navigate(redirectPath, { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Đăng nhập thất bại. Kiểm tra lại email hoặc mật khẩu.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container page auth-page">
      <div className="auth-card">
        <h1>Đăng nhập</h1>

        <p>Đăng nhập để sử dụng giỏ hàng, đặt hàng và theo dõi đơn hàng.</p>

        <form className="form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
          />

          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
          />

          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p style={{ marginTop: "18px", color: "#4b5563" }}>
          Chưa có tài khoản?{" "}
          <Link to="/register" style={{ color: "#2563eb", fontWeight: 700 }}>
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
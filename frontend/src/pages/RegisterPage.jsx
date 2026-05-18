import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import authApi from "../api/authApi";

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error("Vui lòng nhập họ tên");
      return false;
    }

    if (!formData.email.trim()) {
      toast.error("Vui lòng nhập email");
      return false;
    }

    if (!formData.password.trim()) {
      toast.error("Vui lòng nhập mật khẩu");
      return false;
    }

    if (formData.password.length < 6) {
      toast.error("Mật khẩu nên có ít nhất 6 ký tự");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu nhập lại không khớp");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      await authApi.register({
        fullName: formData.fullName.trim(),
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      toast.success("Đăng ký thành công. Vui lòng đăng nhập.");
      navigate("/login");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container page auth-page">
      <div className="auth-card">
        <h1>Đăng ký</h1>

        <p>Tạo tài khoản mới để mua hàng và theo dõi đơn hàng.</p>

        <form className="form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullName"
            placeholder="Họ tên"
            value={formData.fullName}
            onChange={handleChange}
            autoComplete="name"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
          />

          <input
            type="text"
            name="phone"
            placeholder="Số điện thoại"
            value={formData.phone}
            onChange={handleChange}
            autoComplete="tel"
          />

          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Nhập lại mật khẩu"
            value={formData.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
          />

          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <p style={{ marginTop: "18px", color: "#4b5563" }}>
          Đã có tài khoản?{" "}
          <Link to="/login" style={{ color: "#2563eb", fontWeight: 700 }}>
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import AuthBackground from '../../Components/AuthBackground/AuthBackground';

import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

import { Button, message } from 'antd';

import api from '../../Apis/apiConfig';

import API_ENDPOINTS from '../../Apis/apiEndpoints';

import { saveAuthUser } from '../../Utils/Auth';

import USER_ROUTE from '../../Routes/User.routes';

import ADMIN_ROUTE from '../../Routes/Admin.routes';

import SELLER_ROUTE from '../../Routes/Seller.routes';

import './AuthDecorations.css';

// Khối Component vẽ hình tam giác bo góc
const RoundedTriangle = ({ id, className, colorClass }) => (
  <svg
    id={id}
    viewBox="0 0 100 100"
    className={`absolute pointer-events-none ${className} ${colorClass}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="currentColor"
      d="M 50 10 A 10 10 0 0 1 58 15 L 90 70 A 10 10 0 0 1 82 85 L 18 85 A 10 10 0 0 1 10 70 L 42 15 A 10 10 0 0 1 50 10 Z"
    />
  </svg>
);

const AuthPage = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const [isLogin, setIsLogin] = useState(true);

  const [fullName, setFullName] = useState('');

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const getRoleRedirect = (role = 'USER') => {
    const normalized = String(role || 'USER').toUpperCase();

    if (normalized.includes('ADMIN')) {
      return ADMIN_ROUTE.Dashboard || ADMIN_ROUTE.Home || '/';
    }

    if (normalized.includes('SELLER')) {
      return SELLER_ROUTE.Home || '/';
    }

    return USER_ROUTE.Home || '/';
  };

  const normalizeAuthResult = (responseData) => {
    if (!responseData) return null;

    const payload = responseData.data || responseData;

    const token =
      payload.accessToken ||
      payload.token ||
      payload.jwt ||
      responseData.accessToken ||
      responseData.token;

    const user = payload.user || responseData.user || payload;

    return {
      ...user,
      accessToken: token,
      tokenType: payload.tokenType || responseData.tokenType || 'Bearer',
    };
  };

  const getServerMessage = (error) => {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Lỗi xác thực. Vui lòng thử lại.'
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    if (!email.trim() || !password) {
      message.warning('Vui lòng nhập email và mật khẩu.');
      return;
    }

    if (!isLogin) {
      if (!fullName.trim()) {
        message.warning('Vui lòng nhập họ và tên.');
        return;
      }

      if (password !== confirmPassword) {
        message.error('Mật khẩu và xác nhận mật khẩu không khớp.');
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        email: email.trim().toLowerCase(),
        password,
      };

      if (!isLogin) {
        payload.fullName = fullName.trim();
      }

      const endpoint = isLogin
        ? API_ENDPOINTS.auth.login
        : API_ENDPOINTS.auth.register;

      const response = await api.post(endpoint, payload);

      const authData = normalizeAuthResult(response);

      if (!authData || !authData.accessToken) {
        throw new Error('Không nhận được token hợp lệ từ máy chủ.');
      }

      saveAuthUser(authData);

      window.dispatchEvent(new Event('auth-changed'));

      message.success(isLogin ? 'Đăng nhập thành công!' : 'Đăng ký thành công!');

      navigate(getRoleRedirect(authData.role), { replace: true });
    } catch (error) {
      console.error('Auth error:', error);

      message.error(getServerMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');

        .font-luxury {
          font-family: 'Playfair Display', serif;
        }
        `}
      </style>

      <div className="bg-gray-50 text-gray-900 min-h-screen flex flex-col w-full overflow-hidden font-sans">
        <main
          className="flex-1 flex flex-col md:flex-row w-full"
          style={{ boxShadow: '0 8px 30px 20px rgba(0,0,0,0.8)' }}
        >
          {/* Left Side: Visual & Quote */}
          <div className="hidden md:flex md:w-1/2 relative bg-red-900 items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-orange-900/30 to-black/60 z-10"></div>

              <img
                alt="Quiet luxury fashion background"
                className="w-full h-full object-cover opacity-80 drop-shadow-2xl scale-105"
                src="https://images.unsplash.com/photo-1607083206869-4c76720723b7?q=80&w=2115&auto=format&fit=crop"
              />
            </div>

            <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
              <RoundedTriangle
                id="decor-triangle-1"
                className="w-[35rem] h-[35rem] -top-20 -left-32 opacity-40 blur-xl"
                colorClass="text-orange-500"
              />

              <RoundedTriangle
                id="decor-triangle-2"
                className="w-[25rem] h-[25rem] -bottom-10 -right-16 opacity-50 blur-lg"
                colorClass="text-red-600"
              />
            </div>

            <div className="relative z-20 flex flex-col items-center justify-center text-center px-8 w-full">
              <span className="font-luxury text-7xl md:text-8xl font-bold tracking-[0.15em] text-white drop-shadow-2xl mb-6">
                MEGAMART
              </span>

              <h2 className="font-bold text-2xl text-white drop-shadow-md mb-4">
                Chào mừng bạn đến với
              </h2>

              <p className="text-lg text-white/90 italic drop-shadow-md leading-relaxed">
                "Sự tinh tế đỉnh cao nằm ở sự đơn giản."
              </p>

              <div className="mt-8 w-12 h-[2px] bg-orange-400 mx-auto rounded-full shadow-[0_0_10px_rgba(249,115,22,0.8)]"></div>
            </div>
          </div>

          {/* Right Side: Form Container */}
          <div className="relative w-full md:w-1/2 bg-white flex items-center justify-center p-6 sm:p-12 overflow-hidden">
            <AuthBackground />

            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
              <RoundedTriangle
                id="decor-triangle-3"
                className="w-80 h-80 top-[-5%] right-[-10%] opacity-20 blur-2xl"
                colorClass="text-orange-400"
              />

              <RoundedTriangle
                id="decor-triangle-4"
                className="w-64 h-64 bottom-[10%] left-[-10%] opacity-15 blur-2xl"
                colorClass="text-red-500"
              />
            </div>

            <div className="relative z-10 w-full max-w-[480px] bg-white/95 backdrop-blur-xl p-[8px] sm:p-12 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-orange-50">
              <div className="md:hidden mb-8 text-center">
                <span className="font-luxury text-4xl font-bold tracking-widest text-orange-600">
                  MEGAMART
                </span>
              </div>

              <div className="flex gap-8 mb-10 border-b border-gray-200 justify-center">
                <button
                  className={`pb-3 text-lg transition-all border-b-2 font-semibold hover:text-orange-600 ${
                    isLogin
                      ? 'border-orange-600 text-orange-600'
                      : 'text-gray-400 border-transparent'
                  }`}
                  type="button"
                  onClick={() => setIsLogin(true)}
                >
                  Đăng nhập
                </button>

                <button
                  className={`pb-3 text-lg transition-all border-b-2 font-semibold hover:text-orange-600 ${
                    !isLogin
                      ? 'border-orange-600 text-orange-600'
                      : 'text-gray-400 border-transparent'
                  }`}
                  type="button"
                  onClick={() => setIsLogin(false)}
                >
                  Đăng ký
                </button>
              </div>

              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-3 text-gray-900">
                  {isLogin ? 'Mừng bạn trở lại' : 'Tạo tài khoản mới'}
                </h1>

                <p className="text-gray-500 text-sm">
                  {isLogin
                    ? 'Vui lòng nhập thông tin để truy cập tài khoản của bạn.'
                    : 'Điền thông tin dưới đây để trở thành thành viên của MEGAMART.'}
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-500 block uppercase font-bold tracking-wider mb-2">
                      Họ và tên
                    </label>

                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-12 px-4 rounded-lg bg-gray-50 border border-gray-200 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-800 placeholder:text-gray-400"
                      placeholder="Nhập họ và tên của bạn"
                      type="text"
                    />
                  </div>
                )}

                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 block uppercase font-bold tracking-wider mb-2">
                    Email
                  </label>

                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 px-4 rounded-lg bg-gray-50 border border-gray-200 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-800 placeholder:text-gray-400"
                    placeholder="email@vi-du.com"
                    type="email"
                  />
                </div>

                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs text-gray-500 block uppercase font-bold tracking-wider">
                      Mật khẩu
                    </label>

                    {isLogin && (
                      <a
                        className="text-sm text-orange-600 hover:text-orange-500 hover:underline font-medium"
                        href="#"
                        onClick={(e) => e.preventDefault()}
                      >
                        Quên mật khẩu?
                      </a>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-12 px-4 rounded-lg bg-gray-50 border border-gray-200 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-800 placeholder:text-gray-400 pr-12"
                      placeholder="••••••••"
                      type={isPasswordVisible ? 'text' : 'password'}
                    />

                    <button
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600 transition-colors"
                      type="button"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    >
                      {isPasswordVisible ? (
                        <EyeInvisibleOutlined className="text-lg" />
                      ) : (
                        <EyeOutlined className="text-lg" />
                      )}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-500 block uppercase font-bold tracking-wider mb-2">
                      Xác nhận mật khẩu
                    </label>

                    <div className="relative">
                      <input
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-12 px-4 rounded-lg bg-gray-50 border border-gray-200 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20 outline-none transition-all text-gray-800 placeholder:text-gray-400 pr-12"
                        placeholder="••••••••"
                        type={isConfirmPasswordVisible ? 'text' : 'password'}
                      />

                      <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600 transition-colors"
                        type="button"
                        onClick={() =>
                          setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                        }
                      >
                        {isConfirmPasswordVisible ? (
                          <EyeInvisibleOutlined className="text-lg" />
                        ) : (
                          <EyeOutlined className="text-lg" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {isLogin && (
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                      id="remember"
                      type="checkbox"
                    />

                    <label
                      className="text-sm text-gray-600 cursor-pointer select-none"
                      htmlFor="remember"
                    >
                      Ghi nhớ đăng nhập
                    </label>
                  </div>
                )}

                <Button
                  htmlType="submit"
                  type="primary"
                  size="large"
                  loading={loading}
                  className="h-14 w-full bg-gradient-to-r from-orange-600 to-red-500 text-white rounded-xl text-lg font-bold shadow-md shadow-orange-600/30 hover:from-orange-500 hover:to-red-400 hover:shadow-lg active:scale-[0.98] transition-all"
                >
                  {isLogin ? 'Đăng nhập' : 'Đăng ký'}
                </Button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>

                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 font-semibold text-gray-400 tracking-wider">
                    Hoặc tiếp tục với
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  className="h-12 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-orange-50 hover:border-orange-200 transition-all active:scale-95 shadow-sm"
                  type="button"
                >
                  <img
                    alt="Google"
                    className="w-5 h-5"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBaILOg5XACnvZdBwIJus-GED00TAIm-OhIxVcbFRsMKbthzixb51arDN3tUw5ssBvBeg-Qzz8KLsOqPNfoGlGddgMrnjKmNeW8E_DpT5n6bkFIzPqsY9l8GaAf_H8XAYIzHmyHkc3bSdvzpU2eO5M_yzPiRqjSNWz8YxbJ4u6Q4UEQLP3bNpSeLl8YBGF7zYe3Z8Wzm-LnC6PG0Eyj6FYanDRLw03ldg6BBlef46vlyGzBUB5WKEaUOcwbKp-jwW-fxoD9KOHe9t17"
                  />

                  <span>Google</span>
                </button>

                <button
                  className="h-12 flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-orange-50 hover:border-orange-200 transition-all active:scale-95 shadow-sm"
                  type="button"
                >
                  <svg
                    className="w-5 h-5 text-[#1877F2]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>

                  <span>Facebook</span>
                </button>
              </div>

              <p className="mt-8 text-center text-xs text-gray-500">
                Bằng việc tiếp tục, bạn đồng ý với{' '}
                <a
                  className="text-orange-600 hover:text-orange-500 font-medium underline underline-offset-2"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  Điều khoản dịch vụ
                </a>{' '}
                và{' '}
                <a
                  className="text-orange-600 hover:text-orange-500 font-medium underline underline-offset-2"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  Chính sách bảo mật
                </a>
                .
              </p>
            </div>
          </div>
        </main>

        <footer className="bg-white w-full border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
            <div className="flex flex-col gap-2 items-center md:items-start max-w-xs text-center md:text-left">
              <span className="font-luxury text-2xl font-bold tracking-widest text-orange-600">
                MEGAMART
              </span>

              <p className="text-[1rem] text-gray-500 leading-relaxed">
                Trải nghiệm mua sắm đẳng cấp với những bộ sản phẩm được tuyển
                chọn kỹ lưỡng.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-8 sm:gap-16 text-center md:text-left">
              <div className="flex flex-col gap-2">
                <h4 className="text-[1.1rem] text-gray-900 font-bold uppercase tracking-widest mb-1">
                  Khám phá
                </h4>

                <a
                  className="text-[1rem] text-gray-500 hover:text-orange-600 transition-colors"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  Về chúng tôi
                </a>

                <a
                  className="text-[1rem] text-gray-500 hover:text-orange-600 transition-colors"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  Phát triển bền vững
                </a>
              </div>

              <div className="flex flex-col gap-2">
                <h4 className="text-[1.1rem] text-gray-900 font-bold uppercase tracking-widest mb-1">
                  Hỗ trợ
                </h4>

                <a
                  className="text-[1rem] text-gray-500 hover:text-orange-600 transition-colors"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  Giao hàng & Trả hàng
                </a>

                <a
                  className="text-[1rem] text-gray-500 hover:text-orange-600 transition-colors"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  Liên hệ
                </a>
              </div>

              <div className="flex flex-col gap-2">
                <h4 className="text-[1.1rem] text-gray-900 font-bold uppercase tracking-widest mb-1">
                  Pháp lý
                </h4>

                <a
                  className="text-[1rem] text-gray-500 hover:text-orange-600 transition-colors"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  Chính sách bảo mật
                </a>

                <a
                  className="text-[1rem] text-gray-500 hover:text-orange-600 transition-colors"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  Điều khoản dịch vụ
                </a>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-6 pb-4">
            <p className="text-[11px] text-center text-gray-400">
              © 2024 MEGAMART Minimalism. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default AuthPage;
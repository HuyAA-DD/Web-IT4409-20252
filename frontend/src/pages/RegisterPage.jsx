function RegisterPage() {
  return (
    <div className="container page auth-page">
      <div className="auth-card">
        <h1>Đăng ký</h1>

        <p>Form đăng ký sẽ được code ở bước Auth flow.</p>

        <form className="form">
          <input type="text" placeholder="Họ tên" disabled />
          <input type="email" placeholder="Email" disabled />
          <input type="password" placeholder="Mật khẩu" disabled />

          <button type="button" className="btn btn-primary" disabled>
            Đăng ký
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
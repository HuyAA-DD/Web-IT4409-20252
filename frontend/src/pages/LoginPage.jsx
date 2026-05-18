function LoginPage() {
  return (
    <div className="container page auth-page">
      <div className="auth-card">
        <h1>Đăng nhập</h1>

        <p>Form đăng nhập sẽ được code ở bước Auth flow.</p>

        <form className="form">
          <input type="email" placeholder="Email" disabled />
          <input type="password" placeholder="Mật khẩu" disabled />

          <button type="button" className="btn btn-primary" disabled>
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
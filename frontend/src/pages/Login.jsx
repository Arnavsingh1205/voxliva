import LoginForm from "../components/LoginForm";

function Login({
  onLogin,
  onSignup,
  loading = false,
}) {
  return (
    <main className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          <div className="logo">
            Vox<span>liva</span>
          </div>

          <p>
            Speak English. Build Confidence.
          </p>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <h1>Welcome Back</h1>

            <p>
              Login to continue your English
              speaking practice.
            </p>
          </div>

          <LoginForm
            onSubmit={onLogin}
            onSignup={onSignup}
            loading={loading}
          />
        </div>
      </div>
    </main>
  );
}

export default Login;
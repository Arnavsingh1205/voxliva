import SignupForm from "../components/SignupForm";

function Signup({
  onSignup,
  onLogin,
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
            <h1>Create Account</h1>

            <p>
              Create your Voxliva account and start
              practicing English.
            </p>
          </div>

          <SignupForm
            onSubmit={onSignup}
            onLogin={onLogin}
            loading={loading}
          />
        </div>
      </div>
    </main>
  );
}

export default Signup;
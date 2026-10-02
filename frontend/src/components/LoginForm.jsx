import { useState } from "react";

function LoginForm({
  onSubmit,
  onSignup,
  loading = false,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    onSubmit?.({
      email: email.trim(),
      password,
    });
  };

  return (
    <form
      className="auth-form"
      onSubmit={handleSubmit}
    >
      <div className="auth-field">
        <label htmlFor="login-email">
          Email
        </label>

        <input
          id="login-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          required
          autoComplete="email"
        />
      </div>

      <div className="auth-field">
        <label htmlFor="login-password">
          Password
        </label>

        <input
          id="login-password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          required
          autoComplete="current-password"
        />
      </div>

      <button
        type="submit"
        className="auth-submit"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <div className="auth-switch">
        <span>Don't have an account?</span>

        <button
          type="button"
          className="auth-link"
          onClick={onSignup}
          disabled={loading}
        >
          Sign Up
        </button>
      </div>
    </form>
  );
}

export default LoginForm;
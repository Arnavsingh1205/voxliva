import { useState } from "react";

function SignupForm({
  onSubmit,
  onLogin,
  loading = false,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      return;
    }

    onSubmit?.({
      name: name.trim(),
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
        <label htmlFor="signup-name">
          Full Name
        </label>

        <input
          id="signup-name"
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          required
          autoComplete="name"
        />
      </div>

      <div className="auth-field">
        <label htmlFor="signup-email">
          Email
        </label>

        <input
          id="signup-email"
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
        <label htmlFor="signup-password">
          Password
        </label>

        <input
          id="signup-password"
          type="password"
          placeholder="Create a password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>

      <div className="auth-field">
        <label htmlFor="signup-confirm-password">
          Confirm Password
        </label>

        <input
          id="signup-confirm-password"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(event) =>
            setConfirmPassword(event.target.value)
          }
          required
          minLength={6}
          autoComplete="new-password"
        />
      </div>

      {password &&
        confirmPassword &&
        password !== confirmPassword && (
          <p className="auth-error">
            Passwords do not match.
          </p>
        )}

      <button
        type="submit"
        className="auth-submit"
        disabled={
          loading ||
          !name ||
          !email ||
          !password ||
          !confirmPassword ||
          password !== confirmPassword
        }
      >
        {loading ? "Creating account..." : "Sign Up"}
      </button>

      <div className="auth-switch">
        <span>Already have an account?</span>

        <button
          type="button"
          className="auth-link"
          onClick={onLogin}
          disabled={loading}
        >
          Login
        </button>
      </div>
    </form>
  );
}

export default SignupForm;
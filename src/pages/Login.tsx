import { useState, type FormEvent } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { loginMember } from "../firebase/members";
import { Button } from "../components/ui/Button";
import "./AuthForm.scss";

function friendlyError(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "That email and password combination doesn't match an account.";
      case "auth/invalid-email":
        return "That doesn't look like a valid email address.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a moment and try again.";
      default:
        return "Something went wrong logging in. Please try again.";
    }
  }
  return "Something went wrong logging in. Please try again.";
}

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const redirectState = location.state as { from?: { pathname?: string } } | null;
  const redirectTo = redirectState?.from?.pathname ?? "/account";

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await loginMember(email.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-page__inner">
        <div className="auth-card">
          <span className="auth-card__eyebrow">Membership</span>
          <h1>Log in</h1>
          <p className="auth-card__lede">Welcome back. Log in with the email and password you registered with.</p>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            {error && (
              <p className="auth-card__error" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" disabled={submitting}>
              {submitting ? "Logging in..." : "Log in"}
            </Button>
          </form>

          <p className="auth-card__footer">
            Don't have an account yet? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

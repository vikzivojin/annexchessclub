import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { registerMember } from "../firebase/members";
import { Button } from "../components/ui/Button";
import { GENDER_OPTIONS } from "../data/profile";
import type { Gender } from "../firebase/types";
import "./AuthForm.scss";

function friendlyError(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/email-already-in-use":
        return "An account already exists with that email. Try logging in instead.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/invalid-email":
        return "That doesn't look like a valid email address.";
      default:
        return "Something went wrong creating your account. Please try again.";
    }
  }
  return "Something went wrong creating your account. Please try again.";
}

const today = new Date().toISOString().slice(0, 10);

export function Register() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [cfcId, setCfcId] = useState("");
  const [fideId, setFideId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!gender) {
      setError("Please select a gender.");
      return;
    }

    setSubmitting(true);
    try {
      await registerMember({
        displayName: displayName.trim(),
        email: email.trim(),
        password,
        gender,
        dateOfBirth,
        cfcId: cfcId.trim() || undefined,
        fideId: fideId.trim() || undefined,
      });
      navigate("/account");
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
          <h1>Create your account</h1>
          <p className="auth-card__lede">
            Register with the email you want to use for the club. Your account is active right away; joining as a
            paying member is a separate step the club will confirm with you.
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="displayName">Full name</label>
            <input
              id="displayName"
              type="text"
              autoComplete="name"
              required
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />

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
              autoComplete="new-password"
              minLength={6}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              required
              value={gender}
              onChange={(event) => setGender(event.target.value as Gender)}
            >
              <option value="" disabled>
                Select one
              </option>
              {GENDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label htmlFor="dateOfBirth">Date of birth</label>
            <input
              id="dateOfBirth"
              type="date"
              required
              max={today}
              value={dateOfBirth}
              onChange={(event) => setDateOfBirth(event.target.value)}
            />

            <label htmlFor="cfcId">CFC ID (optional)</label>
            <input
              id="cfcId"
              type="text"
              value={cfcId}
              onChange={(event) => setCfcId(event.target.value)}
            />

            <label htmlFor="fideId">FIDE ID (optional)</label>
            <input
              id="fideId"
              type="text"
              value={fideId}
              onChange={(event) => setFideId(event.target.value)}
            />

            {error && (
              <p className="auth-card__error" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="auth-card__footer">
            Already a member? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

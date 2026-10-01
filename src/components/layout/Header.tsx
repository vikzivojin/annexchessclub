import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import logo from "../../assets/logo.png";
import "./Header.scss";

const navLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About" },
  { to: "/schedule", label: "Schedule" },
  { to: "/classes", label: "Classes" },
  { to: "/membership", label: "Membership" },
  { to: "/contact", label: "Contact" },
];

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, isAdmin } = useAuth();

  const accountLabel = profile?.displayName?.split(" ")[0] || "Account";

  // Close the mobile menu whenever the viewport grows back to desktop size.
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 780) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="header">
      <div className="header__bar">
        <NavLink to="/" className="header__brand" onClick={() => setIsMenuOpen(false)}>
          <span className="header__brand-mark" aria-hidden="true">
            <img src={logo} alt="" width="40" height="40" />
          </span>
          <span className="header__brand-text">
            <span className="header__brand-name">Annex Chess Club</span>
            <span className="header__brand-motto">Chess for everyone</span>
          </span>
        </NavLink>

        <nav className="header__nav header__nav--desktop" aria-label="Primary">
          <ul>
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) => (isActive ? "is-active" : undefined)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header__auth header__auth--desktop">
          {user ? (
            <>
              {isAdmin && (
                <NavLink to="/admin" className="header__auth-link">
                  Admin
                </NavLink>
              )}
              <NavLink to="/account" className="header__cta">
                {accountLabel}
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/login" className="header__auth-link">
                Log in
              </NavLink>
              <NavLink to="/register" className="header__cta">
                Join the club
              </NavLink>
            </>
          )}
        </div>

        <button
          type="button"
          className="header__menu-toggle"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <nav
        className={`header__nav header__nav--mobile ${isMenuOpen ? "is-open" : ""}`}
        aria-label="Primary"
        aria-hidden={!isMenuOpen}
      >
        <ul>
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.end}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) => (isActive ? "is-active" : undefined)}
              >
                {link.label}
              </NavLink>
            </li>
          ))}
          {user ? (
            <>
              {isAdmin && (
                <li>
                  <NavLink to="/admin" onClick={() => setIsMenuOpen(false)}>
                    Admin
                  </NavLink>
                </li>
              )}
              <li>
                <NavLink
                  to="/account"
                  onClick={() => setIsMenuOpen(false)}
                  className="header__cta header__cta--mobile"
                >
                  {accountLabel}
                </NavLink>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/login" onClick={() => setIsMenuOpen(false)}>
                  Log in
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="header__cta header__cta--mobile"
                >
                  Join the club
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

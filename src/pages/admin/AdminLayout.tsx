import { NavLink, Outlet } from "react-router-dom";
import "./AdminLayout.scss";

const adminLinks = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/members", label: "Members" },
  { to: "/admin/schedule", label: "Schedule" },
  { to: "/admin/announcements", label: "Announcements" },
];

export function AdminLayout() {
  return (
    <div className="admin">
      <div className="admin__inner">
        <aside className="admin__sidebar">
          <span className="admin__sidebar-eyebrow">Admin portal</span>
          <nav aria-label="Admin">
            <ul>
              {adminLinks.map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to} end={link.end} className={({ isActive }) => (isActive ? "is-active" : undefined)}>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <div className="admin__content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import * as AuthService from "../services/auth.service";

interface User {
  id: string;
  name: string;
  surname: string;
  username: string;
  email: string;
  roles: string[];
}

const roleLabels: { [key: string]: { label: string; color: string } } = {
  ROLE_USER:      { label: "User",          color: "#1f6580" },
  ROLE_MODERATOR: { label: "Moderator",     color: "#f59e0b" },
  ROLE_ADMIN:     { label: "Administrator", color: "#6366f1" },
};

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (AuthService.isLoggedIn()) {
      setUser(AuthService.getCurrentUser());
    }
  }, []);

  if (!user) return <h2 className="text-center mt-5">Unauthorized</h2>;

  const initials = [user.name, user.surname]
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase())
    .join("") || user.username.charAt(0).toUpperCase();

  const displayName = [user.name, user.surname].filter(Boolean).join(" ") || user.username;

  const infoRows = [
    { label: "Full name",  value: displayName },
    { label: "Username",   value: user.username },
    { label: "Email",      value: user.email },
  ];

  return (
    <>
      <style>{`
        .profile-page {
          min-height: calc(100vh - 120px);
          background: linear-gradient(135deg, #f0f5f8 0%, #f5f7fb 100%);
          padding: 48px 16px 64px;
        }
        .profile-card {
          background: #fff;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 20px;
          max-width: 520px;
          margin: 0 auto;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(2,6,23,0.07);
        }
        .profile-card-hero {
          background: linear-gradient(135deg, #e8f2f6 0%, #f0f5f8 100%);
          padding: 36px 32px 28px;
          display: flex;
          flex-direction: column;
          align-items: center;
          border-bottom: 1px solid var(--border, #e5e7eb);
        }
        .profile-avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: var(--brand, #1f6580);
          color: #fff;
          font-size: 26px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          letter-spacing: -1px;
          box-shadow: 0 4px 16px rgba(31,101,128,0.3);
          flex-shrink: 0;
        }
        .profile-name {
          font-size: 20px;
          font-weight: 800;
          color: var(--text, #0f172a);
          margin: 0 0 6px;
          text-align: center;
        }
        .profile-roles {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: center;
        }
        .profile-role-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          border: 1.5px solid;
        }
        .profile-role-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .profile-card-body {
          padding: 0;
        }
        .profile-row {
          display: flex;
          align-items: center;
          padding: 15px 28px;
          border-bottom: 1px solid var(--border, #e5e7eb);
          gap: 16px;
        }
        .profile-row:last-child { border-bottom: none; }
        .profile-row-label {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--text-muted, #475569);
          min-width: 96px;
          flex-shrink: 0;
        }
        .profile-row-value {
          font-size: 14px;
          font-weight: 500;
          color: var(--text, #0f172a);
          word-break: break-all;
        }
        .profile-actions {
          max-width: 520px;
          margin: 16px auto 0;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .profile-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 18px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          border: 1.5px solid var(--border, #e5e7eb);
          background: #fff;
          color: var(--text, #0f172a);
          transition: border-color 0.2s, color 0.2s, background 0.2s;
        }
        .profile-action-btn:hover {
          border-color: var(--brand, #1f6580);
          color: var(--brand-dark, #185569);
          background: #f0f5f8;
        }
        .profile-action-btn svg { flex-shrink: 0; }
      `}</style>

      <div className="profile-page">

        {/* Profile card */}
        <div className="profile-card">

          {/* Hero: avatar + name + roles */}
          <div className="profile-card-hero">
            <div className="profile-avatar" aria-hidden="true">{initials}</div>
            <h1 className="profile-name">{displayName}</h1>
            <div className="profile-roles">
              {user.roles.map((role) => {
                const meta = roleLabels[role] ?? { label: role, color: "#6b7280" };
                return (
                  <span
                    key={role}
                    className="profile-role-chip"
                    style={{ color: meta.color, borderColor: meta.color, background: `${meta.color}14` }}
                  >
                    <span className="profile-role-dot" style={{ background: meta.color }} />
                    {meta.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Info rows */}
          <div className="profile-card-body">
            {infoRows.map(({ label, value }) => (
              <div className="profile-row" key={label}>
                <span className="profile-row-label">{label}</span>
                <span className="profile-row-value">{value || "—"}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Quick actions */}
        <div className="profile-actions">
          <NavLink className="profile-action-btn" to="/change-password">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Change password
          </NavLink>
          <NavLink className="profile-action-btn" to="/my-dashboards">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            My dashboards
          </NavLink>
        </div>

      </div>
    </>
  );
};

export default Profile;

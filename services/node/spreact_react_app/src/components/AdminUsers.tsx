import React, { useEffect, useState } from "react";
import Unauthorized from './Unauthorized';
import * as AuthService from "../services/auth.service";
import * as UserService from "../services/user.service";

const CHARSET_UPPER   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const CHARSET_LOWER   = 'abcdefghijklmnopqrstuvwxyz';
const CHARSET_DIGITS  = '0123456789';
const CHARSET_SYMBOLS = '!@#$%^&*()-_=+[]{}|;:,.<>?';
const CHARSET_ALL     = CHARSET_UPPER + CHARSET_LOWER + CHARSET_DIGITS + CHARSET_SYMBOLS;

const generatePassword = (): string => {
    const pick = (s: string) => s[Math.floor(Math.random() * s.length)];
    const base = [pick(CHARSET_UPPER), pick(CHARSET_LOWER), pick(CHARSET_DIGITS), pick(CHARSET_SYMBOLS)];
    for (let i = 0; i < 8; i++) base.push(pick(CHARSET_ALL));
    return base.sort(() => Math.random() - 0.5).join('');
};

const passwordStrength = (pw: string): { score: number; label: string; color: string } => {
    if (!pw) return { score: 0, label: '', color: '#e5e7eb' };
    let score = 0;
    if (pw.length >= 8)  score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { score, label: 'Weak',   color: '#dc2626' };
    if (score <= 3) return { score, label: 'Fair',   color: '#f59e0b' };
    if (score === 4) return { score, label: 'Good',   color: '#16a34a' };
    return             { score, label: 'Strong', color: '#0e7490' };
};

interface User {
    id: string;
    name: string;
    surname: string;
    username: string;
    email: string;
    roles: { id: string; label: string }[];
}

const ALL_ROLES = ["ROLE_USER", "ROLE_MODERATOR", "ROLE_ADMIN"];

const ROLE_META: Record<string, { label: string; color: string }> = {
    ROLE_USER:      { label: "User",      color: "#1f6580" },
    ROLE_MODERATOR: { label: "Moderator", color: "#f59e0b" },
    ROLE_ADMIN:     { label: "Admin",     color: "#6366f1" },
};

const IconClose = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [editRolesUser, setEditRolesUser] = useState<User | null>(null);
    const [editRoles, setEditRoles] = useState<string[]>([]);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);
    const [pwUser, setPwUser] = useState<User | null>(null);
    const [pwValue, setPwValue] = useState('');
    const [pwVisible, setPwVisible] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const currentUser = AuthService.getCurrentUser();
    const isAuthorized = currentUser?.roles?.includes("ROLE_ADMIN") || currentUser?.roles?.includes("ROLE_MODERATOR");

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const refreshUsers = async () => {
        const res = await UserService.getAllUsers();
        setUsers(res.data);
    };

    useEffect(() => {
        const fetchUsers = async () => {
            if (!isAuthorized) { setLoading(false); return; }
            try {
                const res = await UserService.getAllUsers();
                setUsers(res.data);
            } catch {
                showToast("Failed to load users", "error");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [isAuthorized]);

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "320px" }}>
            <div className="spinner" aria-label="Loading users" />
        </div>
    );
    if (!isAuthorized) return <Unauthorized />;

    const applyNameEdit = async () => {
        if (!editUser) return;
        try {
            await UserService.updateUserNames(editUser.id, { name: editUser.name, surname: editUser.surname });
            showToast("Name & surname updated successfully", "success");
            setEditUser(null);
            await refreshUsers();
        } catch {
            showToast("Failed to update name & surname", "error");
        }
    };

    const applyRolesEdit = async () => {
        if (!editRolesUser) return;
        try {
            await UserService.updateUserRoles(editRolesUser.id, editRoles);
            showToast("Roles updated successfully", "success");
            setEditRolesUser(null);
            setEditRoles([]);
            await refreshUsers();
        } catch {
            showToast("Failed to update roles", "error");
        }
    };

    const handlePasswordReset = async () => {
        if (!pwUser || !pwValue.trim()) return;
        try {
            await UserService.updateUserPassword(pwUser.id, pwValue);
            showToast("Password updated successfully", "success");
            setPwUser(null);
            setPwValue('');
            setPwVisible(false);
        } catch {
            showToast("Failed to update password", "error");
        }
    };

    const handleDelete = async () => {
        if (!deleteUser) return;
        try {
            await UserService.deleteUser(deleteUser.id);
            showToast("User deleted successfully", "success");
            setDeleteUser(null);
            await refreshUsers();
        } catch {
            showToast("Failed to delete user", "error");
        }
    };

    return (
        <>
            <style>{`
                .au-page { padding: 32px 0 48px; }

                /* Header */
                .au-header { margin-bottom: 24px; display: flex; align-items: center; gap: 14px; }
                .au-header-icon { width: 44px; height: 44px; border-radius: 12px; background: #e8f2f6; color: var(--brand-dark, #185569); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .au-header-title { font-size: 22px; font-weight: 800; color: var(--text, #0f172a); margin: 0 0 2px; }
                .au-header-sub { font-size: 15px; color: var(--text-muted, #475569); margin: 0; }

                /* Table card */
                .au-table-card { background: #fff; border: 1px solid var(--border, #e5e7eb); border-radius: 14px; overflow: hidden; }
                .au-table-scroll { overflow-x: auto; }
                .au-table { width: 100%; border-collapse: collapse; min-width: 720px; }
                .au-table thead th { background: var(--muted, #f5f7fb); font-size: 13px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: var(--text-muted, #475569); padding: 12px 18px; border-bottom: 1px solid var(--border, #e5e7eb); white-space: nowrap; }
                .au-table tbody tr { transition: background 0.15s; }
                .au-table tbody tr:hover { background: #f0f5f8; }
                .au-table tbody td { font-size: 15px; padding: 14px 18px; color: var(--text, #0f172a); border-bottom: 1px solid var(--border, #e5e7eb); vertical-align: middle; }
                .au-table tbody tr:last-child td { border-bottom: none; }
                .au-cell-muted { color: var(--text-muted, #475569); font-size: 15px; }

                /* Role chip */
                .au-chip { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 20px; font-size: 13px; font-weight: 600; border: 1.5px solid; margin: 2px 3px 2px 0; white-space: nowrap; }
                .au-chip-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

                /* Action buttons */
                .au-actions { display: flex; gap: 6px; justify-content: flex-end; flex-wrap: nowrap; }
                .au-btn { display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: 7px; font-size: 14px; font-weight: 600; cursor: pointer; border: 1.5px solid; transition: background 0.15s, border-color 0.15s, color 0.15s; white-space: nowrap; line-height: 1.4; }
                .au-btn-edit { background: #fff; border-color: var(--border, #e5e7eb); color: var(--text, #0f172a); }
                .au-btn-edit:hover { background: #f0f5f8; border-color: var(--brand, #1f6580); color: var(--brand-dark, #185569); }
                .au-btn-delete { background: #fff; border-color: #fecaca; color: #dc2626; }
                .au-btn-delete:hover { background: #fef2f2; border-color: #dc2626; }

                /* Modal overlay */
                .au-overlay { position: fixed; inset: 0; background: rgba(2,6,23,0.45); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 16px; }
                .au-modal { background: #fff; border-radius: 16px; width: 100%; max-width: 440px; box-shadow: 0 20px 60px rgba(2,6,23,0.2); }
                .au-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px 14px; border-bottom: 1px solid var(--border, #e5e7eb); }
                .au-modal-title { font-size: 16px; font-weight: 700; color: var(--text, #0f172a); margin: 0; }
                .au-modal-close { background: none; border: none; color: var(--text-muted, #475569); cursor: pointer; padding: 4px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
                .au-modal-close:hover { background: var(--muted, #f5f7fb); color: var(--text, #0f172a); }
                .au-modal-body { padding: 18px 20px; }
                .au-modal-footer { padding: 12px 20px 18px; display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid var(--border, #e5e7eb); }
                .au-field { margin-bottom: 14px; }
                .au-field:last-child { margin-bottom: 0; }
                .au-field-label { font-size: 13px; font-weight: 600; color: var(--text, #0f172a); margin-bottom: 5px; display: block; }

                /* Modal action buttons */
                .au-btn-cancel { background: #fff; border: 1.5px solid var(--border, #e5e7eb); color: var(--text, #0f172a); padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
                .au-btn-cancel:hover { background: var(--muted, #f5f7fb); }
                .au-btn-apply { background: var(--brand, #1f6580); border: 1.5px solid var(--brand, #1f6580); color: #fff; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
                .au-btn-apply:hover { background: var(--brand-dark, #185569); border-color: var(--brand-dark, #185569); }
                .au-btn-confirm-delete { background: #dc2626; border: 1.5px solid #dc2626; color: #fff; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
                .au-btn-confirm-delete:hover { background: #b91c1c; border-color: #b91c1c; }

                /* Role checkbox list */
                .au-role-list { display: flex; flex-direction: column; gap: 8px; }
                .au-role-option { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1.5px solid var(--border, #e5e7eb); border-radius: 8px; cursor: pointer; transition: border-color 0.15s, background 0.15s; user-select: none; }
                .au-role-option:hover { border-color: var(--brand, #1f6580); background: #f0f5f8; }
                .au-role-option.selected { border-color: var(--brand, #1f6580); background: #e8f2f6; }
                .au-role-option input[type="checkbox"] { accent-color: var(--brand, #1f6580); width: 15px; height: 15px; cursor: pointer; flex-shrink: 0; }

                /* Delete warning */
                .au-delete-warning { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 12px 14px; font-size: 15px; color: #991b1b; line-height: 1.55; }
                .au-delete-warning strong { color: #7f1d1d; }

                /* Toast */
                .au-toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 2000; padding: 11px 18px; border-radius: 10px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 16px rgba(2,6,23,0.15); display: flex; align-items: center; gap: 8px; min-width: 260px; max-width: 90vw; animation: au-slide-down 0.2s ease; }
                .au-toast-success { background: #f0fdf4; border: 1px solid #86efac; color: #15803d; }
                .au-toast-error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }
                @keyframes au-slide-down { from { opacity: 0; transform: translateX(-50%) translateY(-8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

                /* Key (password) button */
                .au-btn-key { background: #fff; border-color: #d1fae5; color: #059669; }
                .au-btn-key:hover { background: #ecfdf5; border-color: #059669; }

                /* Password field wrapper */
                .au-pw-wrap { position: relative; display: flex; align-items: center; }
                .au-pw-wrap input { padding-right: 40px; }
                .au-pw-toggle { position: absolute; right: 10px; background: none; border: none; cursor: pointer; color: var(--text-muted, #475569); padding: 0; display: flex; align-items: center; }
                .au-pw-toggle:hover { color: var(--text, #0f172a); }

                /* Generate button */
                .au-btn-generate { display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: 7px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1.5px solid var(--border, #e5e7eb); background: #fff; color: var(--text, #0f172a); transition: background 0.15s; margin-top: 8px; }
                .au-btn-generate:hover { background: #f0f5f8; border-color: var(--brand, #1f6580); color: var(--brand-dark, #185569); }

                /* Strength bar */
                .au-strength { margin-top: 10px; }
                .au-strength-bar { height: 5px; border-radius: 3px; background: #e5e7eb; overflow: hidden; }
                .au-strength-fill { height: 100%; border-radius: 3px; transition: width 0.25s, background 0.25s; }
                .au-strength-label { font-size: 12px; font-weight: 600; margin-top: 4px; }

                /* Empty state */
                .au-empty { text-align: center; padding: 48px 24px; color: var(--text-muted, #475569); font-size: 15px; }

                @media (prefers-reduced-motion: reduce) {
                    .au-table tbody tr, .au-btn, .au-modal-close, .au-btn-cancel, .au-btn-apply, .au-btn-confirm-delete, .au-role-option { transition: none; }
                    .au-toast { animation: none; }
                }
            `}</style>

            <div className="container au-page">

                {/* Page header */}
                <div className="au-header">
                    <div className="au-header-icon" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                    </div>
                    <div>
                        <h1 className="au-header-title">User Management</h1>
                        <p className="au-header-sub">{users.length} registered {users.length === 1 ? "user" : "users"}</p>
                    </div>
                </div>

                {/* Users table */}
                <div className="au-table-card">
                    <div className="au-table-scroll">
                        <table className="au-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Surname</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Roles</th>
                                    <th style={{ textAlign: "right" }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="au-empty">No users found.</td>
                                    </tr>
                                ) : users.map(u => (
                                    <tr key={u.id}>
                                        <td>{u.name}</td>
                                        <td>{u.surname}</td>
                                        <td className="au-cell-muted">{u.username}</td>
                                        <td className="au-cell-muted">{u.email}</td>
                                        <td>
                                            {u.roles.map(r => {
                                                const meta = ROLE_META[r.label] ?? { label: r.label, color: "#6b7280" };
                                                return (
                                                    <span key={r.id} className="au-chip" style={{ color: meta.color, borderColor: meta.color, background: `${meta.color}14` }}>
                                                        <span className="au-chip-dot" style={{ background: meta.color }} />
                                                        {meta.label}
                                                    </span>
                                                );
                                            })}
                                        </td>
                                        <td>
                                            <div className="au-actions">
                                                <button
                                                    className="au-btn au-btn-edit"
                                                    onClick={() => setEditUser(u)}
                                                    aria-label={`Edit name for ${u.username}`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                    </svg>
                                                    Edit Name
                                                </button>
                                                <button
                                                    className="au-btn au-btn-edit"
                                                    onClick={() => { setEditRolesUser(u); setEditRoles(u.roles.map(r => r.label)); }}
                                                    aria-label={`Edit roles for ${u.username}`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                                    </svg>
                                                    Edit Roles
                                                </button>
                                                <button
                                                    className="au-btn au-btn-key"
                                                    onClick={() => { setPwUser(u); setPwValue(''); setPwVisible(false); }}
                                                    aria-label={`Reset password for ${u.username}`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                                                        <circle cx="7.5" cy="15.5" r="5.5"/>
                                                        <path d="M21 2l-9.6 9.6"/>
                                                        <path d="M15.5 7.5L17 6l3 3-1.5 1.5"/>
                                                    </svg>
                                                    Password
                                                </button>
                                                <button
                                                    className="au-btn au-btn-delete"
                                                    onClick={() => setDeleteUser(u)}
                                                    aria-label={`Delete user ${u.username}`}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                                                        <polyline points="3 6 5 6 21 6"/>
                                                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                                        <path d="M10 11v6"/><path d="M14 11v6"/>
                                                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                                    </svg>
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Edit Name Modal */}
            {editUser && (
                <div className="au-overlay" onClick={() => setEditUser(null)} role="dialog" aria-modal="true" aria-labelledby="au-name-title">
                    <div className="au-modal" onClick={e => e.stopPropagation()}>
                        <div className="au-modal-header">
                            <h2 id="au-name-title" className="au-modal-title">Edit Name & Surname</h2>
                            <button className="au-modal-close" onClick={() => setEditUser(null)} aria-label="Close dialog"><IconClose /></button>
                        </div>
                        <div className="au-modal-body">
                            <div className="au-field">
                                <label className="au-field-label" htmlFor="au-edit-name">Name</label>
                                <input
                                    id="au-edit-name"
                                    className="form-control"
                                    type="text"
                                    value={editUser.name}
                                    onChange={e => setEditUser({ ...editUser, name: e.target.value })}
                                />
                            </div>
                            <div className="au-field">
                                <label className="au-field-label" htmlFor="au-edit-surname">Surname</label>
                                <input
                                    id="au-edit-surname"
                                    className="form-control"
                                    type="text"
                                    value={editUser.surname}
                                    onChange={e => setEditUser({ ...editUser, surname: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="au-modal-footer">
                            <button className="au-btn-cancel" onClick={() => setEditUser(null)}>Cancel</button>
                            <button className="au-btn-apply" onClick={applyNameEdit}>Apply</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Roles Modal */}
            {editRolesUser && (
                <div className="au-overlay" onClick={() => setEditRolesUser(null)} role="dialog" aria-modal="true" aria-labelledby="au-roles-title">
                    <div className="au-modal" onClick={e => e.stopPropagation()}>
                        <div className="au-modal-header">
                            <h2 id="au-roles-title" className="au-modal-title">Edit Roles — {editRolesUser.username}</h2>
                            <button className="au-modal-close" onClick={() => setEditRolesUser(null)} aria-label="Close dialog"><IconClose /></button>
                        </div>
                        <div className="au-modal-body">
                            <div className="au-role-list" role="group" aria-label="Select roles">
                                {ALL_ROLES.map(role => {
                                    const meta = ROLE_META[role] ?? { label: role, color: "#6b7280" };
                                    const checked = editRoles.includes(role);
                                    return (
                                        <label key={role} className={`au-role-option${checked ? " selected" : ""}`}>
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => setEditRoles(prev =>
                                                    checked ? prev.filter(r => r !== role) : [...prev, role]
                                                )}
                                            />
                                            <span className="au-chip" style={{ color: meta.color, borderColor: meta.color, background: `${meta.color}14` }}>
                                                <span className="au-chip-dot" style={{ background: meta.color }} />
                                                {meta.label}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="au-modal-footer">
                            <button className="au-btn-cancel" onClick={() => setEditRolesUser(null)}>Cancel</button>
                            <button className="au-btn-apply" onClick={applyRolesEdit}>Apply</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteUser && (
                <div className="au-overlay" onClick={() => setDeleteUser(null)} role="dialog" aria-modal="true" aria-labelledby="au-delete-title">
                    <div className="au-modal" onClick={e => e.stopPropagation()}>
                        <div className="au-modal-header">
                            <h2 id="au-delete-title" className="au-modal-title">Delete User</h2>
                            <button className="au-modal-close" onClick={() => setDeleteUser(null)} aria-label="Close dialog"><IconClose /></button>
                        </div>
                        <div className="au-modal-body">
                            <div className="au-delete-warning">
                                This action cannot be undone. User <strong>{deleteUser.username}</strong> will be permanently removed.
                            </div>
                        </div>
                        <div className="au-modal-footer">
                            <button className="au-btn-cancel" onClick={() => setDeleteUser(null)}>Cancel</button>
                            <button className="au-btn-confirm-delete" onClick={handleDelete}>Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {pwUser && (() => {
                const str = passwordStrength(pwValue);
                const barWidth = str.score ? `${(str.score / 5) * 100}%` : '0%';
                return (
                    <div className="au-overlay" onClick={() => setPwUser(null)} role="dialog" aria-modal="true" aria-labelledby="au-pw-title">
                        <div className="au-modal" onClick={e => e.stopPropagation()}>
                            <div className="au-modal-header">
                                <h2 id="au-pw-title" className="au-modal-title">Reset Password — {pwUser.username}</h2>
                                <button className="au-modal-close" onClick={() => setPwUser(null)} aria-label="Close dialog"><IconClose /></button>
                            </div>
                            <div className="au-modal-body">
                                <div className="au-field">
                                    <label className="au-field-label" htmlFor="au-pw-input">New Password</label>
                                    <div className="au-pw-wrap">
                                        <input
                                            id="au-pw-input"
                                            className="form-control"
                                            type={pwVisible ? 'text' : 'password'}
                                            value={pwValue}
                                            onChange={e => setPwValue(e.target.value)}
                                            autoComplete="new-password"
                                            placeholder="Enter new password"
                                        />
                                        <button className="au-pw-toggle" type="button" onClick={() => setPwVisible(v => !v)} aria-label={pwVisible ? 'Hide password' : 'Show password'}>
                                            {pwVisible ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                                                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                                                    <line x1="1" y1="1" x2="23" y2="23"/>
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                    <circle cx="12" cy="12" r="3"/>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {pwValue && (
                                        <div className="au-strength">
                                            <div className="au-strength-bar">
                                                <div className="au-strength-fill" style={{ width: barWidth, background: str.color }} />
                                            </div>
                                            <div className="au-strength-label" style={{ color: str.color }}>{str.label}</div>
                                        </div>
                                    )}
                                </div>
                                <button
                                    className="au-btn-generate"
                                    type="button"
                                    onClick={() => { setPwValue(generatePassword()); setPwVisible(true); }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                                        <circle cx="7.5" cy="15.5" r="5.5"/><path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5L17 6l3 3-1.5 1.5"/>
                                    </svg>
                                    Generate password
                                </button>
                            </div>
                            <div className="au-modal-footer">
                                <button className="au-btn-cancel" onClick={() => setPwUser(null)}>Cancel</button>
                                <button className="au-btn-apply" onClick={handlePasswordReset} disabled={!pwValue.trim()}>Apply</button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Toast notification */}
            {toast && (
                <div className={`au-toast au-toast-${toast.type}`} role="alert" aria-live="polite">
                    {toast.type === "success" ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                    )}
                    {toast.message}
                </div>
            )}
        </>
    );
};

export default AdminUsers;

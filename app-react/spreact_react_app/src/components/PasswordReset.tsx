import React, { useState } from "react";
import { updatePassword } from "../services/auth.service";

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
);

const ChangePasswordForm: React.FC = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (newPassword !== confirmPassword) {
            setError("New password and confirmation do not match.");
            return;
        }

        setLoading(true);
        try {
            const res = await updatePassword(oldPassword, newPassword);
            setMessage(res.data.message || "Password updated successfully!");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{`
                .cp-page {
                    min-height: calc(100vh - 120px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #f0f5f8 0%, #f5f7fb 100%);
                    padding: 40px 16px;
                }
                .cp-card {
                    background: #fff;
                    border: 1px solid var(--border, #e5e7eb);
                    border-radius: 20px;
                    padding: 40px 36px;
                    width: 100%;
                    max-width: 420px;
                    box-shadow: 0 8px 32px rgba(2,6,23,0.08);
                }
                .cp-icon {
                    width: 52px;
                    height: 52px;
                    border-radius: 14px;
                    background: #e8f2f6;
                    color: var(--brand-dark, #185569);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                }
                .cp-title {
                    font-size: 22px;
                    font-weight: 800;
                    color: var(--text, #0f172a);
                    text-align: center;
                    margin-bottom: 4px;
                }
                .cp-subtitle {
                    font-size: 14px;
                    color: var(--text-muted, #475569);
                    text-align: center;
                    margin-bottom: 28px;
                }
                .cp-field { margin-bottom: 18px; }
                .cp-label {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text, #0f172a);
                    margin-bottom: 6px;
                    display: block;
                }
                .cp-input-wrap { position: relative; }
                .cp-input {
                    width: 100%;
                    border: 1.5px solid var(--border, #e5e7eb);
                    border-radius: 10px;
                    padding: 10px 42px 10px 14px;
                    font-size: 14px;
                    color: var(--text, #0f172a);
                    background: #fff;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    outline: none;
                }
                .cp-input:focus {
                    border-color: var(--brand, #1f6580);
                    box-shadow: 0 0 0 3px rgba(31,101,128,0.15);
                }
                .cp-eye {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    padding: 4px;
                    cursor: pointer;
                    color: var(--text-muted, #475569);
                    display: flex;
                    align-items: center;
                    border-radius: 4px;
                    transition: color 0.15s;
                }
                .cp-eye:hover { color: var(--brand, #1f6580); }
                .cp-divider {
                    border: none;
                    border-top: 1px solid var(--border, #e5e7eb);
                    margin: 24px 0 20px;
                }
                .cp-submit {
                    width: 100%;
                    padding: 11px;
                    background: var(--brand, #1f6580);
                    color: #fff;
                    border: none;
                    border-radius: 10px;
                    font-size: 15px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: background 0.2s, box-shadow 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                .cp-submit:hover:not(:disabled) {
                    background: var(--brand-dark, #185569);
                    box-shadow: 0 4px 14px rgba(31,101,128,0.3);
                }
                .cp-submit:disabled { opacity: 0.6; cursor: not-allowed; }
                .cp-spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255,255,255,0.4);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: cp-spin 0.7s linear infinite;
                    flex-shrink: 0;
                }
                @keyframes cp-spin { to { transform: rotate(360deg); } }
                .cp-alert-success {
                    background: #f0fdf4;
                    border: 1px solid #86efac;
                    color: #15803d;
                    border-radius: 10px;
                    padding: 10px 14px;
                    font-size: 13px;
                    margin-top: 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .cp-alert-error {
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #dc2626;
                    border-radius: 10px;
                    padding: 10px 14px;
                    font-size: 13px;
                    margin-top: 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                @media (prefers-reduced-motion: reduce) {
                    .cp-input, .cp-submit, .cp-eye { transition: none; }
                    .cp-spinner { animation: none; }
                }
            `}</style>

            <div className="cp-page">
                <div className="cp-card">

                    <div className="cp-icon" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                    </div>

                    <h1 className="cp-title">Change Password</h1>
                    <p className="cp-subtitle">Enter your current password, then choose a new one</p>

                    <form onSubmit={handleSubmit} noValidate>

                        <div className="cp-field">
                            <label className="cp-label" htmlFor="cp-old">Current Password</label>
                            <div className="cp-input-wrap">
                                <input
                                    id="cp-old"
                                    type={showOld ? "text" : "password"}
                                    className="cp-input"
                                    value={oldPassword}
                                    onChange={e => setOldPassword(e.target.value)}
                                    autoComplete="current-password"
                                    required
                                />
                                <button type="button" className="cp-eye" onClick={() => setShowOld(v => !v)} aria-label={showOld ? "Hide current password" : "Show current password"}>
                                    {showOld ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>

                        <hr className="cp-divider" />

                        <div className="cp-field">
                            <label className="cp-label" htmlFor="cp-new">New Password</label>
                            <div className="cp-input-wrap">
                                <input
                                    id="cp-new"
                                    type={showNew ? "text" : "password"}
                                    className="cp-input"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    autoComplete="new-password"
                                    required
                                />
                                <button type="button" className="cp-eye" onClick={() => setShowNew(v => !v)} aria-label={showNew ? "Hide new password" : "Show new password"}>
                                    {showNew ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>

                        <div className="cp-field">
                            <label className="cp-label" htmlFor="cp-confirm">Confirm New Password</label>
                            <div className="cp-input-wrap">
                                <input
                                    id="cp-confirm"
                                    type={showConfirm ? "text" : "password"}
                                    className="cp-input"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                    required
                                />
                                <button type="button" className="cp-eye" onClick={() => setShowConfirm(v => !v)} aria-label={showConfirm ? "Hide confirmation password" : "Show confirmation password"}>
                                    {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="cp-submit" disabled={loading}>
                            {loading && <span className="cp-spinner" aria-hidden="true" />}
                            {loading ? "Updating…" : "Update Password"}
                        </button>

                        {message && (
                            <div className="cp-alert-success" role="alert">
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                {message}
                            </div>
                        )}

                        {error && (
                            <div className="cp-alert-error" role="alert">
                                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                                {error}
                            </div>
                        )}

                    </form>
                </div>
            </div>
        </>
    );
};

export default ChangePasswordForm;

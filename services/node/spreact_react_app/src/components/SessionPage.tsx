import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Unauthorized from './Unauthorized';
import { getCurrentUser } from '../services/auth.service';
import axios from 'axios';
import authHeader from '../services/auth-header';

const isProduction = import.meta.env.MODE === 'production';
const host = import.meta.env.VITE_AUTHENTICATION_HOST;
const REFRESH_URL = isProduction
    ? '/api/v1/auth/refresh'
    : `http://${host}:8081/api/v1/auth/refresh`;

const ROLE_META: Record<string, { label: string; color: string }> = {
    ROLE_USER:      { label: 'User',      color: '#1f6580' },
    ROLE_MODERATOR: { label: 'Moderator', color: '#f59e0b' },
    ROLE_ADMIN:     { label: 'Admin',     color: '#6366f1' },
};

const getExpiry = (): number | null => {
    try {
        const raw = localStorage.getItem('user');
        if (!raw) return null;
        const token = JSON.parse(raw)?.token;
        if (!token) return null;
        return JSON.parse(atob(token.split('.')[1]))?.exp ?? null;
    } catch { return null; }
};

const formatRemaining = (ms: number): string => {
    if (ms <= 0) return 'Expired';
    const totalSec = Math.floor(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
    if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`;
    return `${s}s`;
};

const SessionPage: React.FC = () => {
    const navigate = useNavigate();
    const currentUser = getCurrentUser();
    const [remaining, setRemaining] = useState<string>('');
    const [expiryDate, setExpiryDate] = useState<string>('');
    const [extending, setExtending] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    if (!currentUser) return <Unauthorized />;

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        const tick = () => {
            const exp = getExpiry();
            if (!exp) { setRemaining('No session'); return; }
            const ms = exp * 1000 - Date.now();
            setRemaining(formatRemaining(ms));
            setExpiryDate(new Date(exp * 1000).toLocaleString('en-GB', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit',
            }));
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, []);

    const handleExtend = async () => {
        setExtending(true);
        try {
            const res = await axios.post(REFRESH_URL, {}, { headers: authHeader() });
            const stored = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...stored, token: res.data.token }));
            showToast('Session extended by 1 hour', 'success');
        } catch {
            showToast('Failed to extend session', 'error');
        } finally {
            setExtending(false);
        }
    };

    const isExpiringSoon = remaining.includes('m') === false && remaining !== 'No session' && remaining !== 'Expired';
    const isExpired = remaining === 'Expired';

    return (
        <>
            <style>{`
                .sp-page { padding: 32px 0 56px; }
                .sp-header { margin-bottom: 28px; display: flex; align-items: center; gap: 14px; }
                .sp-header-icon { width: 44px; height: 44px; border-radius: 12px; background: #e8f2f6; color: var(--brand-dark, #185569); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .sp-header-title { font-size: 22px; font-weight: 800; color: var(--text, #0f172a); margin: 0 0 2px; }
                .sp-header-sub { font-size: 15px; color: var(--text-muted, #475569); margin: 0; }

                .sp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                @media (max-width: 640px) { .sp-grid { grid-template-columns: 1fr; } }

                .sp-card { background: #fff; border: 1px solid var(--border, #e5e7eb); border-radius: 14px; padding: 22px 24px; }
                .sp-card-title { font-size: 13px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: var(--text-muted, #475569); margin: 0 0 16px; }

                .sp-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border, #e5e7eb); }
                .sp-row:last-child { border-bottom: none; }
                .sp-label { font-size: 14px; color: var(--text-muted, #475569); }
                .sp-value { font-size: 14px; font-weight: 600; color: var(--text, #0f172a); text-align: right; }

                .sp-chip { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 20px; font-size: 13px; font-weight: 600; border: 1.5px solid; margin: 2px 3px 2px 0; }
                .sp-chip-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

                .sp-timer { font-size: 32px; font-weight: 800; font-variant-numeric: tabular-nums; text-align: center; padding: 16px 0 8px; }
                .sp-timer-label { font-size: 13px; color: var(--text-muted, #475569); text-align: center; margin-bottom: 20px; }

                .sp-btn-extend { width: 100%; padding: 11px; border-radius: 9px; border: none; background: var(--brand, #1f6580); color: #fff; font-size: 15px; font-weight: 700; cursor: pointer; transition: background 0.15s; display: flex; align-items: center; justify-content: center; gap: 8px; }
                .sp-btn-extend:hover:not(:disabled) { background: var(--brand-dark, #185569); }
                .sp-btn-extend:disabled { opacity: 0.6; cursor: not-allowed; }

                .sp-btn-logout { width: 100%; padding: 9px; border-radius: 9px; border: 1.5px solid #fecaca; background: #fff; color: #dc2626; font-size: 14px; font-weight: 600; cursor: pointer; margin-top: 10px; transition: background 0.15s; }
                .sp-btn-logout:hover { background: #fef2f2; }

                .sp-toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 2000; padding: 11px 18px; border-radius: 10px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 16px rgba(2,6,23,0.15); display: flex; align-items: center; gap: 8px; min-width: 260px; max-width: 90vw; animation: sp-slide 0.2s ease; }
                .sp-toast-success { background: #f0fdf4; border: 1px solid #86efac; color: #15803d; }
                .sp-toast-error   { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }
                @keyframes sp-slide { from { opacity: 0; transform: translateX(-50%) translateY(-8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
            `}</style>

            <div className="container sp-page">
                <div className="sp-header">
                    <div className="sp-header-icon" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                    </div>
                    <div>
                        <h1 className="sp-header-title">Session Management</h1>
                        <p className="sp-header-sub">View your account details and manage your active session</p>
                    </div>
                </div>

                <div className="sp-grid">
                    {/* Profile card */}
                    <div className="sp-card">
                        <p className="sp-card-title">Account Info</p>
                        <div className="sp-row">
                            <span className="sp-label">Name</span>
                            <span className="sp-value">{currentUser.name} {currentUser.surname}</span>
                        </div>
                        <div className="sp-row">
                            <span className="sp-label">Username</span>
                            <span className="sp-value">{currentUser.username}</span>
                        </div>
                        <div className="sp-row">
                            <span className="sp-label">Email</span>
                            <span className="sp-value">{currentUser.email}</span>
                        </div>
                        <div className="sp-row">
                            <span className="sp-label">Roles</span>
                            <span className="sp-value">
                                {(currentUser.roles ?? []).map((r: string) => {
                                    const meta = ROLE_META[r] ?? { label: r, color: '#6b7280' };
                                    return (
                                        <span key={r} className="sp-chip" style={{ color: meta.color, borderColor: meta.color, background: `${meta.color}14` }}>
                                            <span className="sp-chip-dot" style={{ background: meta.color }} />
                                            {meta.label}
                                        </span>
                                    );
                                })}
                            </span>
                        </div>
                    </div>

                    {/* Session card */}
                    <div className="sp-card">
                        <p className="sp-card-title">Active Session</p>
                        <div className="sp-timer" style={{ color: isExpired ? '#dc2626' : isExpiringSoon ? '#f59e0b' : 'var(--brand-dark, #185569)' }}>
                            {remaining}
                        </div>
                        <p className="sp-timer-label">
                            {isExpired ? 'Your session has expired' : `Expires at ${expiryDate}`}
                        </p>
                        <button className="sp-btn-extend" onClick={handleExtend} disabled={extending}>
                            {extending ? (
                                <div className="spinner" style={{ width: 16, height: 16 }} />
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                                    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                                </svg>
                            )}
                            Extend session by 1 hour
                        </button>
                        <button className="sp-btn-logout" onClick={() => {
                            localStorage.removeItem('user');
                            localStorage.removeItem('oncodir_token');
                            localStorage.removeItem('oncodir_token_ts');
                            navigate('/login');
                        }}>
                            Sign out
                        </button>
                    </div>
                </div>
            </div>

            {toast && (
                <div className={`sp-toast sp-toast-${toast.type}`} role="alert">
                    {toast.type === 'success'
                        ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                        : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    }
                    {toast.message}
                </div>
            )}
        </>
    );
};

export default SessionPage;

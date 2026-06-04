import React, { useEffect, useState } from 'react';
import Unauthorized from './Unauthorized';
import { getCurrentUser } from '../services/auth.service';
import { getAuditLogs, restoreComment, deleteAuditEntry } from '../services/user.service';

interface AuditEntry {
    id: number;
    timestamp: string;
    action: string;
    performedBy: string;
    target: string | null;
    details: string | null;
}

const ACTION_META: Record<string, { label: string; color: string; bg: string }> = {
    USER_LOGIN:        { label: 'Login',             color: '#1f6580', bg: '#e8f2f6' },
    USER_REGISTER:     { label: 'Register',          color: '#7c3aed', bg: '#ede9fe' },
    USER_APPROVED:     { label: 'Approved',          color: '#16a34a', bg: '#dcfce7' },
    USER_REJECTED:     { label: 'Rejected',          color: '#dc2626', bg: '#fee2e2' },
    USER_DELETED:      { label: 'Deleted',           color: '#dc2626', bg: '#fee2e2' },
    ROLE_CHANGED:      { label: 'Role Changed',      color: '#f59e0b', bg: '#fef3c7' },
    PASSWORD_RESET:    { label: 'Password Reset',    color: '#0e7490', bg: '#cffafe' },
    COMMENT_DELETED:   { label: 'Comment Deleted',   color: '#6b7280', bg: '#f3f4f6' },
    COMMENT_RESTORED:  { label: 'Comment Restored',  color: '#16a34a', bg: '#dcfce7' },
};

const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    });

const ROLE_LABEL: Record<string, string> = {
    ROLE_ADMIN: 'Admin', ADMIN: 'Admin',
    ROLE_MODERATOR: 'Moderator', MODERATOR: 'Moderator',
    ROLE_USER: 'User', USER: 'User',
};
const formatRoleName = (r: string) => ROLE_LABEL[r.trim().toUpperCase()] ?? r.trim();

const formatRoleList = (s: string) => s.split(',').map(formatRoleName).join(', ');

const formatDetails = (action: string, details: string | null): string => {
    if (!details) return '—';
    if (action === 'ROLE_CHANGED') {
        const parts = details.split('->');
        if (parts.length === 2) return `${formatRoleList(parts[0])} → ${formatRoleList(parts[1])}`;
        return formatRoleList(details);
    }
    if (action === 'COMMENT_DELETED' || action === 'COMMENT_RESTORED') {
        try {
            const p = JSON.parse(details);
            const c = p.content ?? p.restoredComment?.content;
            return c ?? details;
        } catch { return details; }
    }
    return details;
};

const AuditLog: React.FC = () => {
    const [entries, setEntries] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [restoringId, setRestoringId] = useState<number | null>(null);
    const [deletingAuditId, setDeletingAuditId] = useState<number | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [restoreError, setRestoreError] = useState<string | null>(null);

    const currentUser = getCurrentUser();
    const roles = currentUser?.roles ?? [];
    if (!roles.includes('ROLE_MODERATOR')) {
        return <Unauthorized />;
    }

    const handleDeleteAudit = async (id: number) => {
        setDeletingAuditId(id);
        setRestoreError(null);
        try {
            await deleteAuditEntry(id);
            setEntries(prev => prev.filter(e => e.id !== id));
            setConfirmDeleteId(null);
        } catch (err: any) {
            setRestoreError(err?.response?.data?.error ?? 'Delete failed. Please try again.');
        } finally {
            setDeletingAuditId(null);
        }
    };

    const handleRestore = async (entry: AuditEntry) => {
        if (!entry.details) return;
        setRestoringId(entry.id);
        setRestoreError(null);
        try {
            await restoreComment(entry.details, entry.id);
            const res = await getAuditLogs();
            setEntries(Array.isArray(res.data) ? res.data : []);
        } catch (err: any) {
            setRestoreError(err?.response?.data?.error ?? 'Restore failed. Please try again.');
        } finally {
            setRestoringId(null);
        }
    };

    useEffect(() => {
        getAuditLogs()
            .then(res => setEntries(Array.isArray(res.data) ? res.data : []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const filtered = filter ? entries.filter(e => e.action === filter) : entries;
    const showTargetCol = filtered.some(e => !!e.target);
    const showDetailsCol = filtered.some(e => !!e.details);
    const showActionsCol = filter === 'COMMENT_DELETED' && filtered.some(e => !!e.details);
    const colSpan = 3 + (showTargetCol ? 1 : 0) + (showDetailsCol ? 1 : 0) + (showActionsCol ? 1 : 0);

    return (
        <>
            <style>{`
                .al-page { padding: 32px 0 56px; }
                .al-header { margin-bottom: 24px; display: flex; align-items: center; gap: 14px; }
                .al-header-icon { width: 44px; height: 44px; border-radius: 12px; background: #e8f2f6; color: var(--brand-dark, #185569); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .al-header-title { font-size: 22px; font-weight: 800; color: var(--text, #0f172a); margin: 0 0 2px; }
                .al-header-sub { font-size: 15px; color: var(--text-muted, #475569); margin: 0; }

                .al-toolbar { margin-bottom: 16px; }
                .al-filter-group { display: flex; gap: 6px; flex-wrap: wrap; }
                .al-filter-chip { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1.5px solid var(--border, #e5e7eb); background: #fff; color: var(--text-muted, #475569); transition: all 0.15s; }
                .al-filter-chip:hover, .al-filter-chip.active { border-color: var(--brand, #1f6580); background: #e8f2f6; color: var(--brand-dark, #185569); }

                .al-table-card { background: #fff; border: 1px solid var(--border, #e5e7eb); border-radius: 14px; overflow: hidden; }
                .al-table-scroll { overflow-x: auto; }
                .al-table { width: 100%; border-collapse: collapse; min-width: 680px; }
                .al-table thead th { background: var(--muted, #f5f7fb); font-size: 13px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: var(--text-muted, #475569); padding: 12px 18px; border-bottom: 1px solid var(--border, #e5e7eb); white-space: nowrap; }
                .al-table tbody tr { transition: background 0.15s; }
                .al-table tbody tr:hover { background: #f0f5f8; }
                .al-table tbody td { font-size: 14px; padding: 12px 18px; color: var(--text, #0f172a); border-bottom: 1px solid var(--border, #e5e7eb); vertical-align: middle; }
                .al-table tbody tr:last-child td { border-bottom: none; }

                .al-badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 20px; font-size: 12px; font-weight: 700; white-space: nowrap; }
                .al-muted { color: var(--text-muted, #475569); font-size: 13px; }
                .al-date { color: var(--text-muted, #475569); font-size: 13px; font-variant-numeric: tabular-nums; white-space: nowrap; }

                .al-loading { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 56px 24px; color: var(--text-muted, #475569); font-size: 15px; }
                .al-empty { text-align: center; padding: 56px 24px; color: var(--text-muted, #475569); font-size: 15px; }
                .al-btn-restore { background: none; border: 1.5px solid #bbf7d0; color: #16a34a; border-radius: 7px; padding: 4px 10px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; transition: background 0.15s; white-space: nowrap; }
                .al-btn-restore:hover { background: #dcfce7; }
                .al-btn-restore:disabled { opacity: 0.5; cursor: default; }
                .al-btn-delete-audit { background: none; border: 1.5px solid #fecaca; color: #dc2626; border-radius: 7px; padding: 5px 10px; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 600; transition: background 0.15s; white-space: nowrap; margin-left: 6px; }
                .al-btn-delete-audit:hover { background: #fef2f2; }
                .al-btn-delete-audit:disabled { opacity: 0.5; cursor: default; }
                .al-btn-confirm { background: #dc2626; border: 1.5px solid #dc2626; color: #fff; border-radius: 7px; padding: 5px 10px; cursor: pointer; font-size: 13px; font-weight: 600; transition: background 0.15s; margin-left: 4px; }
                .al-btn-confirm:hover { background: #b91c1c; }
                .al-btn-cancel-sm { background: none; border: 1.5px solid var(--border, #e5e7eb); color: var(--text-muted, #475569); border-radius: 7px; padding: 5px 10px; cursor: pointer; font-size: 13px; font-weight: 600; transition: background 0.15s; margin-left: 4px; }
                .al-btn-cancel-sm:hover { background: var(--muted, #f5f7fb); }
                .al-error { margin-bottom: 12px; padding: 10px 16px; background: #fee2e2; border: 1px solid #fecaca; border-radius: 8px; color: #dc2626; font-size: 14px; }

                @media (prefers-reduced-motion: reduce) { .al-table tbody tr { transition: none; } }
            `}</style>

            <div className="container al-page">
                <div className="al-header">
                    <div className="al-header-icon" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                        </svg>
                    </div>
                    <div>
                        <h1 className="al-header-title">Audit Log</h1>
                        <p className="al-header-sub">
                            {loading ? 'Loading…' : `${filtered.length} ${filtered.length === 1 ? 'event' : 'events'}`}
                        </p>
                    </div>
                </div>

                <div className="al-toolbar">
                    <div className="al-filter-group">
                        <button
                            className={`al-filter-chip${filter === '' ? ' active' : ''}`}
                            onClick={() => setFilter('')}
                        >
                            See All
                        </button>
                        {Object.entries(ACTION_META).map(([key, meta]) => (
                            <button
                                key={key}
                                className={`al-filter-chip${filter === key ? ' active' : ''}`}
                                onClick={() => setFilter(f => f === key ? '' : key)}
                            >
                                {meta.label}
                            </button>
                        ))}
                    </div>
                </div>

                {restoreError && (
                    <div className="al-error">{restoreError}</div>
                )}

                <div className="al-table-card">
                    {loading ? (
                        <div className="al-loading">
                            <div className="spinner" aria-label="Loading audit log" />
                            <span>Loading events…</span>
                        </div>
                    ) : (
                        <div className="al-table-scroll">
                            <table className="al-table">
                                <thead>
                                    <tr>
                                        <th>Timestamp</th>
                                        <th>Action</th>
                                        <th>Performed By</th>
                                        {showTargetCol && <th>Target</th>}
                                        {showDetailsCol && <th>Details</th>}
                                        {showActionsCol && <th style={{ textAlign: 'right' }}>Actions</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr><td colSpan={colSpan} className="al-empty">No events found.</td></tr>
                                    ) : filtered.map(e => {
                                        const meta = ACTION_META[e.action] ?? { label: e.action, color: '#6b7280', bg: '#f3f4f6' };
                                        const canRestore = e.action === 'COMMENT_DELETED' && !!e.details;
                                        return (
                                            <tr key={e.id}>
                                                <td className="al-date">{formatDate(e.timestamp)}</td>
                                                <td>
                                                    <span className="al-badge" style={{ color: meta.color, background: meta.bg }}>
                                                        {meta.label}
                                                    </span>
                                                </td>
                                                <td>{e.performedBy ?? <span className="al-muted">—</span>}</td>
                                                {showTargetCol && <td>{e.target ?? <span className="al-muted">—</span>}</td>}
                                                {showDetailsCol && <td className="al-muted">{formatDetails(e.action, e.details)}</td>}
                                                {showActionsCol && (
                                                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                                        {canRestore && (
                                                            <>
                                                                <button
                                                                    className="al-btn-restore"
                                                                    disabled={restoringId === e.id || deletingAuditId === e.id}
                                                                    onClick={() => handleRestore(e)}
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                                                                        <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.86"/>
                                                                    </svg>
                                                                    {restoringId === e.id ? 'Restoring…' : 'Restore'}
                                                                </button>
                                                                {confirmDeleteId === e.id ? (
                                                                    <>
                                                                        <span style={{ fontSize: '13px', color: '#dc2626', marginLeft: '6px' }}>Delete?</span>
                                                                        <button className="al-btn-confirm" disabled={deletingAuditId === e.id} onClick={() => handleDeleteAudit(e.id)}>Yes</button>
                                                                        <button className="al-btn-cancel-sm" onClick={() => setConfirmDeleteId(null)}>No</button>
                                                                    </>
                                                                ) : (
                                                                    <button
                                                                        className="al-btn-delete-audit"
                                                                        disabled={restoringId === e.id}
                                                                        onClick={() => setConfirmDeleteId(e.id)}
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                                                                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
                                                                        </svg>
                                                                        Delete
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AuditLog;

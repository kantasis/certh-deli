import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../services/auth.service';
import { submitComment } from '../services/comments-submit';

const MAX_CHARS = 500;

const Comments: React.FC = () => {
    const [text, setText] = useState('');
    const [username, setUsername] = useState<string>('Guest');
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (currentUser?.username) {
            setUsername(currentUser.username);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!text.trim()) {
            setAlert({ text: 'Comment cannot be empty.', type: 'error' });
            setTimeout(() => setAlert(null), 4000);
            return;
        }

        let currentPage = window.location.pathname.replace('/', '');
        if (currentPage === 'LIT03') {
            const lit03Panel = localStorage.getItem('lit03Panel') || 'Unknown Panel';
            currentPage = `LIT03-${lit03Panel}`;
        }

        setLoading(true);
        try {
            await submitComment(text, username, currentPage);
            setText('');
            setAlert({ text: 'Comment submitted successfully.', type: 'success' });
            setTimeout(() => setAlert(null), 4000);
        } catch {
            setAlert({ text: 'Failed to submit. Please try again.', type: 'error' });
            setTimeout(() => setAlert(null), 4000);
        } finally {
            setLoading(false);
        }
    };

    const initials = username.charAt(0).toUpperCase();
    const charsLeft = MAX_CHARS - text.length;
    const overLimit = charsLeft < 0;

    return (
        <>
            <style>{`
                .cm-card {
                    background: var(--bg, #fff);
                    border: 1px solid var(--border, #e5e7eb);
                    border-radius: 14px;
                    padding: 16px;
                }
                .cm-header {
                    display: flex;
                    align-items: center;
                    gap: 9px;
                    margin-bottom: 14px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid var(--border, #e5e7eb);
                }
                .cm-icon-wrap {
                    width: 28px;
                    height: 28px;
                    border-radius: 8px;
                    background: #e8f2f6;
                    color: var(--brand-dark, #185569);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .cm-title {
                    font-size: 15px;
                    font-weight: 700;
                    color: var(--text, #0f172a);
                    margin: 0;
                }
                .cm-user-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 10px;
                }
                .cm-avatar {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: var(--brand, #1f6580);
                    color: #fff;
                    font-size: 13px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .cm-username {
                    font-size: 14px;
                    color: var(--text-muted, #475569);
                    font-weight: 500;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .cm-textarea {
                    width: 100%;
                    border: 1.5px solid var(--border, #e5e7eb);
                    border-radius: 9px;
                    padding: 9px 11px;
                    font-size: 15px;
                    color: var(--text, #0f172a);
                    background: #fff;
                    resize: vertical;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    font-family: inherit;
                    line-height: 1.5;
                    min-height: 80px;
                }
                .cm-textarea:focus {
                    border-color: var(--brand, #1f6580);
                    box-shadow: 0 0 0 3px rgba(31,101,128,0.15);
                }
                .cm-textarea.over-limit {
                    border-color: #dc2626;
                }
                .cm-textarea.over-limit:focus {
                    box-shadow: 0 0 0 3px rgba(220,38,38,0.15);
                }
                .cm-footer-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: 8px;
                    gap: 8px;
                }
                .cm-char-count {
                    font-size: 13px;
                    color: var(--text-muted, #475569);
                    flex-shrink: 0;
                }
                .cm-char-count.warn { color: #f59e0b; }
                .cm-char-count.over { color: #dc2626; font-weight: 600; }
                .cm-submit {
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    padding: 7px 13px;
                    background: var(--brand, #1f6580);
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: background 0.2s;
                    white-space: nowrap;
                    flex-shrink: 0;
                }
                .cm-submit:hover:not(:disabled) { background: var(--brand-dark, #185569); }
                .cm-submit:disabled { opacity: 0.55; cursor: not-allowed; }
                .cm-spinner {
                    width: 12px;
                    height: 12px;
                    border: 1.5px solid rgba(255,255,255,0.4);
                    border-top-color: #fff;
                    border-radius: 50%;
                    animation: cm-spin 0.7s linear infinite;
                }
                @keyframes cm-spin { to { transform: rotate(360deg); } }
                .cm-alert {
                    display: flex;
                    align-items: flex-start;
                    gap: 6px;
                    padding: 8px 10px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    margin-top: 10px;
                    line-height: 1.4;
                }
                .cm-alert-success {
                    background: #f0fdf4;
                    border: 1px solid #86efac;
                    color: #15803d;
                }
                .cm-alert-error {
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #dc2626;
                }
                @media (prefers-reduced-motion: reduce) {
                    .cm-textarea, .cm-submit { transition: none; }
                    .cm-spinner { animation: none; }
                }
            `}</style>

            <div className="cm-card">
                <div className="cm-header">
                    <div className="cm-icon-wrap" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                    </div>
                    <span className="cm-title">Leave a Comment</span>
                </div>

                <div className="cm-user-row">
                    <div className="cm-avatar" aria-hidden="true">{initials}</div>
                    <span className="cm-username">{username}</span>
                </div>

                <form onSubmit={handleSubmit}>
                    <label htmlFor="cm-textarea" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
                        Comment
                    </label>
                    <textarea
                        id="cm-textarea"
                        className={`cm-textarea${overLimit ? ' over-limit' : ''}`}
                        value={text}
                        onChange={e => setText(e.target.value.slice(0, MAX_CHARS + 20))}
                        placeholder="Share your thoughts on this chart…"
                        rows={3}
                    />

                    <div className="cm-footer-row">
                        <span className={`cm-char-count${charsLeft <= 50 && !overLimit ? ' warn' : ''}${overLimit ? ' over' : ''}`}>
                            {overLimit ? `${Math.abs(charsLeft)} over limit` : `${charsLeft} left`}
                        </span>
                        <button
                            type="submit"
                            className="cm-submit"
                            disabled={loading || overLimit || !text.trim()}
                        >
                            {loading
                                ? <><span className="cm-spinner" aria-hidden="true" /> Submitting…</>
                                : <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                                        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                                    </svg>
                                    Submit
                                </>
                            }
                        </button>
                    </div>

                    {alert && (
                        <div className={`cm-alert cm-alert-${alert.type}`} role="alert" aria-live="polite">
                            {alert.type === 'success' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
                                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                            )}
                            {alert.text}
                        </div>
                    )}
                </form>
            </div>
        </>
    );
};

export default Comments;

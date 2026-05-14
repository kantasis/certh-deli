import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getUserRole } from '../services/auth.service';

const isProduction = import.meta.env.MODE === 'production';
const host = import.meta.env.VITE_AUTHENTICATION_HOST;

const API_URL = isProduction
    ? '/all-comments'
    : `http://${host}:8435/comments`;

interface Comment {
    id: number;
    content: string;
    username: string;
    created_at: string;
    page_name: string;
}

const formatPageName = (name: string) =>
    name
        .split('-')
        .map(w => w.toUpperCase() === 'CRC' ? 'CRC' : w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');

const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    });

const Comments: React.FC = () => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);

    const userRole = getUserRole();
    if (userRole !== 'ROLE_ADMIN' && userRole !== 'ROLE_MODERATOR') {
        return <h2 className="text-center mt-5">Unauthorized</h2>;
    }

    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await axios.get(API_URL);
                setComments(Array.isArray(response.data) ? response.data : []);
            } catch {
                // silent — table will show empty state
            } finally {
                setLoading(false);
            }
        };
        fetchComments();
    }, []);

    return (
        <>
            <style>{`
                .pc-page { padding: 32px 0 56px; }

                /* Header */
                .pc-header { margin-bottom: 24px; display: flex; align-items: center; gap: 14px; }
                .pc-header-icon { width: 44px; height: 44px; border-radius: 12px; background: #e8f2f6; color: var(--brand-dark, #185569); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .pc-header-title { font-size: 22px; font-weight: 800; color: var(--text, #0f172a); margin: 0 0 2px; }
                .pc-header-sub { font-size: 15px; color: var(--text-muted, #475569); margin: 0; }

                /* Table card */
                .pc-table-card { background: #fff; border: 1px solid var(--border, #e5e7eb); border-radius: 14px; overflow: hidden; }
                .pc-table-scroll { overflow-x: auto; }
                .pc-table { width: 100%; border-collapse: collapse; min-width: 680px; }

                /* Head */
                .pc-table thead th { background: var(--muted, #f5f7fb); font-size: 13px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: var(--text-muted, #475569); padding: 12px 18px; border-bottom: 1px solid var(--border, #e5e7eb); white-space: nowrap; text-align: center; }
                .pc-th-inner { display: flex; align-items: center; justify-content: center; gap: 6px; }

                /* Body */
                .pc-table tbody tr { transition: background 0.15s; }
                .pc-table tbody tr:hover { background: #f0f5f8; }
                .pc-table tbody td { font-size: 15px; padding: 13px 18px; color: var(--text, #0f172a); border-bottom: 1px solid var(--border, #e5e7eb); vertical-align: top; }
                .pc-table tbody tr:last-child td { border-bottom: none; }

                /* Columns */
                .pc-col-user { font-weight: 600; white-space: nowrap; }
                .pc-col-date { color: var(--text-muted, #475569); white-space: nowrap; font-size: 14px; font-variant-numeric: tabular-nums; }
                .pc-col-content { max-width: 360px; line-height: 1.55; word-break: break-word; }

                /* Page badge */
                .pc-badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 20px; font-size: 12.5px; font-weight: 600; background: #e8f2f6; color: var(--brand-dark, #185569); border: 1.5px solid #c5dce8; white-space: nowrap; }

                /* States */
                .pc-loading { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 56px 24px; color: var(--text-muted, #475569); font-size: 15px; }
                .pc-empty { text-align: center; padding: 56px 24px; color: var(--text-muted, #475569); font-size: 15px; }

                @media (prefers-reduced-motion: reduce) {
                    .pc-table tbody tr { transition: none; }
                }
            `}</style>

            <div className="container pc-page">

                {/* Page header */}
                <div className="pc-header">
                    <div className="pc-header-icon" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                    </div>
                    <div>
                        <h1 className="pc-header-title">Committed Comments</h1>
                        <p className="pc-header-sub">
                            {loading ? 'Loading…' : `${comments.length} ${comments.length === 1 ? 'comment' : 'comments'} submitted`}
                        </p>
                    </div>
                </div>

                <div className="pc-table-card">
                    {loading ? (
                        <div className="pc-loading">
                            <div className="spinner" aria-label="Loading comments" />
                            <span>Loading comments…</span>
                        </div>
                    ) : (
                        <div className="pc-table-scroll">
                            <table className="pc-table">
                                <thead>
                                    <tr>
                                        <th>
                                            <div className="pc-th-inner">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                                                </svg>
                                                Username
                                            </div>
                                        </th>
                                        <th>
                                            <div className="pc-th-inner">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                                                </svg>
                                                Date
                                            </div>
                                        </th>
                                        <th>
                                            <div className="pc-th-inner">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                                                    <line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/>
                                                </svg>
                                                Comment
                                            </div>
                                        </th>
                                        <th>
                                            <div className="pc-th-inner">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                                                </svg>
                                                Page
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comments.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="pc-empty">No comments yet.</td>
                                        </tr>
                                    ) : comments.map(comment => (
                                        <tr key={comment.id}>
                                            <td className="pc-col-user">{comment.username}</td>
                                            <td className="pc-col-date">{formatDate(comment.created_at)}</td>
                                            <td className="pc-col-content">{comment.content}</td>
                                            <td>
                                                <span className="pc-badge">
                                                    {comment.page_name ? formatPageName(comment.page_name) : 'N/A'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </>
    );
};

export default Comments;

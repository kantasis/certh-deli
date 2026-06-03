import React from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized: React.FC = () => {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem("user");

    const subtitle = isLoggedIn
        ? "Your account does not have the required permissions to access this page. Please contact an administrator if you believe this is an error."
        : "You need to be signed in to view this page.";

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '60vh', padding: '40px 24px',
            textAlign: 'center',
        }}>
            <div style={{
                width: '72px', height: '72px', borderRadius: '20px',
                background: '#fef2f2', display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: '24px',
                border: '1.5px solid #fecaca',
            }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"
                    stroke="#dc2626" strokeWidth="1.8" strokeLinecap="round"
                    strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
            </div>
            <h2 style={{
                fontSize: '22px', fontWeight: 800,
                color: 'var(--text, #0f172a)', margin: '0 0 8px',
            }}>
                Access Restricted
            </h2>
            <p style={{
                fontSize: '15px', color: 'var(--text-muted, #475569)',
                margin: '0 0 28px', maxWidth: '400px', lineHeight: 1.6,
            }}>
                {subtitle}
            </p>
            {!isLoggedIn && (
                <button
                    onClick={() => navigate('/login')}
                    style={{
                        padding: '10px 24px', borderRadius: '8px', border: 'none',
                        background: 'var(--brand-dark, #185569)', color: '#fff',
                        fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                        transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                    Go to Login
                </button>
            )}
        </div>
    );
};

export default Unauthorized;

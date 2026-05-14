import React, { useState } from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from "yup";
import { login } from "../services/auth.service";

type Props = {};

const validationSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

const initialValues = { username: "", password: "" };

const Login: React.FC<Props> = () => {
  const navigate: NavigateFunction = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = (formValue: { username: string; password: string }) => {
    setMessage("");
    setLoading(true);
    login(formValue.username, formValue.password).then(
      () => {
        navigate("/profile");
        window.location.reload();
      },
      (error) => {
        const resMessage =
          error.response?.data?.message || error.message || error.toString();
        setLoading(false);
        setMessage(resMessage);
      }
    );
  };

  return (
    <>
      <style>{`
        .login-page {
          min-height: calc(100vh - 120px);
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f0f5f8 0%, #f5f7fb 100%);
          padding: 40px 16px;
        }
        .login-card {
          background: #fff;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 20px;
          padding: 40px 36px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 8px 32px rgba(2,6,23,0.08);
        }
        .login-icon {
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
        .login-title {
          font-size: 22px;
          font-weight: 800;
          color: var(--text, #0f172a);
          text-align: center;
          margin-bottom: 4px;
        }
        .login-subtitle {
          font-size: 15px;
          color: var(--text-muted, #475569);
          text-align: center;
          margin-bottom: 28px;
        }
        .login-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--text, #0f172a);
          margin-bottom: 6px;
          display: block;
        }
        .login-input {
          width: 100%;
          border: 1.5px solid var(--border, #e5e7eb);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 15px;
          color: var(--text, #0f172a);
          background: #fff;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .login-input:focus {
          border-color: var(--brand, #1f6580);
          box-shadow: 0 0 0 3px rgba(31,101,128,0.15);
        }
        .login-error-msg {
          font-size: 13px;
          color: #dc2626;
          margin-top: 4px;
          padding: 0;
          border: none;
          background: none;
        }
        .login-submit {
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
          margin-top: 4px;
        }
        .login-submit:hover:not(:disabled) {
          background: var(--brand-dark, #185569);
          box-shadow: 0 4px 14px rgba(31,101,128,0.3);
        }
        .login-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .login-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .login-alert {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          margin-top: 16px;
        }
        .login-field-group { margin-bottom: 18px; }
      `}</style>

      <div className="login-page">
        <div className="login-card">
          <div className="login-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <h1 className="login-title">Sign in</h1>
          <p className="login-subtitle">Access the ONCODIR DELI dashboard</p>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleLogin}
          >
            <Form noValidate>
              <div className="login-field-group">
                <label className="login-label" htmlFor="username">Username</label>
                <Field
                  id="username"
                  name="username"
                  type="text"
                  className="login-input"
                  autoComplete="username"
                />
                <ErrorMessage name="username" component="div" className="login-error-msg" />
              </div>

              <div className="login-field-group">
                <label className="login-label" htmlFor="password">Password</label>
                <Field
                  id="password"
                  name="password"
                  type="password"
                  className="login-input"
                  autoComplete="current-password"
                />
                <ErrorMessage name="password" component="div" className="login-error-msg" />
              </div>

              <button type="submit" className="login-submit" disabled={loading}>
                {loading && <span className="login-spinner" aria-hidden="true" />}
                {loading ? "Signing in…" : "Sign in"}
              </button>

              {message && (
                <div className="login-alert" role="alert">
                  {message}
                </div>
              )}
            </Form>
          </Formik>
        </div>
      </div>
    </>
  );
};

export default Login;

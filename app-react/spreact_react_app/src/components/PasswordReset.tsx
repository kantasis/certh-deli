import React, { useState } from "react";
import { updatePassword } from "../services/auth.service";

const ChangePasswordForm: React.FC = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage("");
      setError("");
  
      if (newPassword !== confirmPassword) {
        setError("New password and confirmation do not match.");
        return;
      }
  
      try {
        const res = await updatePassword(oldPassword, newPassword);
        setMessage(res.data.message || "Password updated successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } catch (err: any) {
        console.error("Error response:", err); // 🔍 this will show us the real issue
        setError(err.response?.data?.message || "Something went wrong.");
      }
    };
  
    return (
      <div className="container mt-4 card card-container">
        <h4>Change Password</h4>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Old Password</label>
            <input
              type="password"
              className="form-control"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
  
          <div className="mb-3">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-control"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
  
          <div className="mb-3">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
  
          <button type="submit" className="btn btn-primary">Update Password</button>
        </form>
      </div>
    );
  };
  
  export default ChangePasswordForm;

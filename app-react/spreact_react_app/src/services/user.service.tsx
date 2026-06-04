import axios from "axios";
import authHeader from "./auth-header";

const isProduction = import.meta.env.MODE === "production";
const host = import.meta.env.VITE_AUTHENTICATION_HOST;

// Relative URLs in production, full URLs in dev
const API_URL = isProduction
   ? "/api/v1/content/"
   : `http://${host}:8081/api/v1/content/`;

const USERS_API = isProduction
   ? "/api/v1/users"
   : `http://${host}:8081/api/v1/users`;

// ------------------------
// Content endpoints
// ------------------------
export const getPublicContent = () => axios.get(API_URL + "all", { headers: authHeader() });
export const getUserBoard = () => axios.get(API_URL + "user", { headers: authHeader() });
export const getModeratorBoard = () => axios.get(API_URL + "mod", { headers: authHeader() });
export const getAdminBoard = () => axios.get(API_URL + "admin", { headers: authHeader() });

// ------------------------
// User management
// ------------------------
export const getAllUsers = () => axios.get(USERS_API, { headers: authHeader() });
export const updateUserRoles = (id: string, roles: string[]) =>
   axios.put(`${USERS_API}/${id}/roles`, roles, { headers: authHeader() });
export const deleteUser = (id: string) => axios.delete(`${USERS_API}/${id}`, { headers: authHeader() });
export const updateUserNames = (id: string, data: { name: string; surname: string }) =>
   axios.put(`${USERS_API}/${id}/name`, data, { headers: authHeader() });
export const updateUserPassword = (id: string, newPassword: string) =>
   axios.put(`${USERS_API}/${id}/password`, { newPassword }, { headers: authHeader() });
export const getPendingUsers = () => axios.get(`${USERS_API}/pending`, { headers: authHeader() });
export const approveUser = (id: string) => axios.put(`${USERS_API}/${id}/approve`, {}, { headers: authHeader() });
export const rejectUser = (id: string) => axios.delete(`${USERS_API}/${id}/reject`, { headers: authHeader() });

const AUDIT_URL = isProduction ? '/api/v1/audit-logs' : `http://${host}:8081/api/v1/audit-logs`;
export const getAuditLogs = () => axios.get(AUDIT_URL, { headers: authHeader() });

const RESTORE_URL = isProduction ? '/all-comments/restore' : `http://${host}:8435/comments/restore`;
export const restoreComment = (details: string, auditLogId: number) =>
    axios.post(RESTORE_URL, { details, auditLogId }, { headers: authHeader() });

const AUDIT_DELETE_URL = (id: number) => isProduction ? `/audit-logs/${id}` : `http://${host}:8435/audit-logs/${id}`;
export const deleteAuditEntry = (id: number) =>
    axios.delete(AUDIT_DELETE_URL(id), { headers: authHeader() });
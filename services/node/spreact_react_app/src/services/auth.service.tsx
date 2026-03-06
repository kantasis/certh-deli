import axios from "axios";
import authHeader from "./auth-header";

// Environment-based API URL
const isProduction = import.meta.env.MODE === "production";
const host = import.meta.env.VITE_AUTHENTICATION_HOST;
const port = import.meta.env.VITE_AUTHENTICATION_PORT;

const API_URL = isProduction
   ? "/api/v1/auth/"
   : `http://${host}:${port}/api/v1/auth/`;

// ------------------------
// Types
// ------------------------
export interface AuthUser {
   id: string;
   username: string;
   email: string;
   name: string;
   surname: string;
   roles: string[];
   token: string;
   type?: string;
}

// ------------------------
// Auth Functions
// ------------------------

// Register
export const register = async (
   username: string,
   email: string,
   password: string,
   name: string,
   surname: string
): Promise<AuthUser> => {
   try {
      const res = await axios.post(API_URL + "register", { username, email, password, name, surname });
      console.log("Registration successful:", res.data);
      return res.data;
   } catch (error: any) {
      if (error.response) {
         console.error("Error response:", error.response.data);
         throw new Error(error.response.data.message || "An error occurred during registration");
      } else if (error.request) {
         console.error("Error request:", error.request);
         throw new Error("No response from server");
      } else {
         console.error("Error message:", error.message);
         throw new Error(error.message || "Unknown error during registration");
      }
   }
};

// Login
export const login = async (username: string, password: string): Promise<AuthUser> => {
   const res = await axios.post(API_URL + "login", { username, password });
   const data: AuthUser = res.data;

   // Normalize roles
   if (data.roles) {
      data.roles = Array.isArray(data.roles)
         ? data.roles.map((r) => (typeof r === "string" ? r : r.label || r))
         : [data.roles];
   } else {
      data.roles = [];
   }

   localStorage.setItem("user", JSON.stringify(data));
   return data;
};

// Logout
export const logout = () => {
   localStorage.removeItem("user");
   window.location.href = "/login"; // redirect to login page
};

// Update password
export const updatePassword = (oldPassword: string, newPassword: string) => {
   return axios.post(
      `${API_URL}update-password`,
      { oldPassword, newPassword },
      { headers: authHeader() }
   );
};

// Get current user
export const getCurrentUser = (): AuthUser | null => {
   const userStr = localStorage.getItem("user");
   if (!userStr) return null;

   const user: AuthUser = JSON.parse(userStr);
   user.roles = Array.isArray(user.roles) ? user.roles : [user.roles];
   return user;
};

// Get user role (first role)
export const getUserRole = (): string | null => {
   const user = getCurrentUser();
   if (user && user.roles.length > 0) return user.roles[0];
   return null;
};

// Check if logged in
export const isLoggedIn = (): boolean => !!getCurrentUser();
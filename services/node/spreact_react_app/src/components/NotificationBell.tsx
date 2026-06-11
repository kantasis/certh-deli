import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as UserService from "../services/user.service";
import * as AuthService from "../services/auth.service";

interface PendingUser {
   id: string;
   name: string;
   surname: string;
   username: string;
   email: string;
}

const POLL_INTERVAL_MS = 10_000;

const NotificationBell: React.FC = () => {
   const currentUser = AuthService.getCurrentUser();
   const canSee =
      currentUser?.roles?.includes("ROLE_MODERATOR") &&
      currentUser?.roles?.includes("ROLE_ADMIN");

   const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
   const [viewedCount, setViewedCount] = useState(0);
   const [open, setOpen] = useState(false);
   const wrapperRef = useRef<HTMLLIElement>(null);
   const navigate = useNavigate();

   const fetchPending = useCallback(async () => {
      try {
         const res = await UserService.getPendingUsers();
         const data: PendingUser[] = res.data ?? [];
         setPendingUsers(data);
         // Broadcast fresh data so AdminUsers can stay in sync without its own poll
         window.dispatchEvent(new CustomEvent("pendingUsersPolled", { detail: data }));
      } catch (err) {
         // console.error("[NotificationBell] fetchPending error:", err);
      }
   }, [viewedCount]);

   // Initial fetch + periodic polling
   useEffect(() => {
      if (!canSee) return;
      fetchPending();
      const id = setInterval(fetchPending, POLL_INTERVAL_MS);
      return () => clearInterval(id);
   }, [canSee, fetchPending]);

   // Re-fetch immediately when AdminUsers approves/rejects a user
   useEffect(() => {
      const onChanged = () => fetchPending();
      window.addEventListener("pendingUsersChanged", onChanged);
      return () => window.removeEventListener("pendingUsersChanged", onChanged);
   }, [fetchPending]);

   // Close on outside click
   useEffect(() => {
      const onClickOutside = (e: MouseEvent) => {
         if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
            setOpen(false);
         }
      };
      document.addEventListener("mousedown", onClickOutside);
      return () => document.removeEventListener("mousedown", onClickOutside);
   }, []);

   if (!canSee) return null;

   const count = pendingUsers.length;
   const hasUnread = count > viewedCount;

   const handleBellClick = () => {
      if (!open) setViewedCount(count);
      setOpen((prev) => !prev);
   };

   const goToPending = () => {
      setViewedCount(count);
      setOpen(false);
      navigate("/admin/users", { state: { tab: "pending" } });
   };

   return (
      <li
         ref={wrapperRef}
         className="nav-item d-flex align-items-center me-2"
         style={{ position: "relative" }}
      >
         {/* ── Bell button ── */}
         <button
            onClick={handleBellClick}
            aria-label={
               hasUnread
                  ? `${count} pending registration${count > 1 ? "s" : ""} awaiting approval`
                  : "No new pending registrations"
            }
            style={{
               background: "none",
               border: "none",
               padding: "4px 6px",
               cursor: "pointer",
               position: "relative",
               color: hasUnread ? "var(--brand-dark, #185569)" : "var(--text-muted, #475569)",
               display: "flex",
               alignItems: "center",
               borderRadius: "6px",
               transition: "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--muted, #f1f5f9)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
         >
            <svg
               xmlns="http://www.w3.org/2000/svg"
               width="20"
               height="20"
               fill="none"
               stroke="currentColor"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round"
               viewBox="0 0 24 24"
               aria-hidden="true"
               style={hasUnread ? { animation: "nb-ring 3s ease-in-out infinite" } : undefined}
            >
               <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
               <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>

            {hasUnread && (
               <span
                  aria-hidden="true"
                  style={{
                     position: "absolute",
                     top: "0px",
                     right: "0px",
                     background: "#dc2626",
                     color: "#fff",
                     fontSize: "10px",
                     fontWeight: 700,
                     borderRadius: "999px",
                     minWidth: "16px",
                     height: "16px",
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "center",
                     padding: "0 3px",
                     lineHeight: 1,
                     border: "2px solid var(--navbar-bg, #fff)",
                  }}
               >
                  {count > 9 ? "9+" : count}
               </span>
            )}
         </button>

         {/* ── Dropdown panel ── */}
         {open && (
            <div
               role="dialog"
               aria-label="Pending approvals"
               style={{
                  position: "absolute",
                  top: "calc(100% + 10px)",
                  right: 0,
                  background: "#fff",
                  border: "1px solid var(--border, #e5e7eb)",
                  borderRadius: "12px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
                  width: "272px",
                  zIndex: 9999,
                  overflow: "hidden",
               }}
            >
               {/* Caret */}
               <div style={{
                  position: "absolute",
                  top: "-6px",
                  right: "14px",
                  width: "12px",
                  height: "12px",
                  background: "#fff",
                  border: "1px solid var(--border, #e5e7eb)",
                  borderBottom: "none",
                  borderRight: "none",
                  transform: "rotate(45deg)",
               }} />

               {/* Header */}
               <div style={{
                  padding: "10px 16px",
                  borderBottom: "1px solid var(--border, #e5e7eb)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
               }}>
                  <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text, #0f172a)" }}>
                     Pending Approvals
                  </span>
                  {count > 0 && (
                     <span style={{
                        background: "#dc2626",
                        color: "#fff",
                        fontSize: "11px",
                        fontWeight: 700,
                        borderRadius: "999px",
                        padding: "2px 7px",
                     }}>
                        {count}
                     </span>
                  )}
               </div>

               {count === 0 ? (
                  <div style={{
                     padding: "20px 16px",
                     textAlign: "center",
                     fontSize: "13px",
                     color: "var(--text-muted, #475569)",
                  }}>
                     No pending registrations
                  </div>
               ) : (
                  <>
                     <ul style={{ listStyle: "none", padding: 0, margin: 0, maxHeight: "240px", overflowY: "auto" }}>
                        {pendingUsers.map((u) => (
                           <li key={u.id}>
                              <button
                                 onClick={goToPending}
                                 style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "10px",
                                    width: "100%",
                                    padding: "10px 16px",
                                    background: "none",
                                    border: "none",
                                    borderBottom: "1px solid var(--border, #f1f5f9)",
                                    cursor: "pointer",
                                    textAlign: "left",
                                    transition: "background 0.1s",
                                 }}
                                 onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                                 onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                              >
                                 <div style={{
                                    width: "34px",
                                    height: "34px",
                                    borderRadius: "999px",
                                    background: "#eff6ff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                 }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#3b82f6" viewBox="0 0 16 16" aria-hidden="true">
                                       <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                                    </svg>
                                 </div>
                                 <div style={{ overflow: "hidden" }}>
                                    <div style={{
                                       fontSize: "13px",
                                       fontWeight: 600,
                                       color: "var(--text, #0f172a)",
                                       whiteSpace: "nowrap",
                                       overflow: "hidden",
                                       textOverflow: "ellipsis",
                                    }}>
                                       {u.name} {u.surname}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "var(--text-muted, #475569)" }}>
                                       @{u.username}
                                    </div>
                                 </div>
                              </button>
                           </li>
                        ))}
                     </ul>

                     <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border, #e5e7eb)" }}>
                        <button
                           onClick={goToPending}
                           style={{
                              width: "100%",
                              padding: "8px",
                              background: "var(--brand-dark, #185569)",
                              color: "#fff",
                              border: "none",
                              borderRadius: "8px",
                              fontSize: "13px",
                              fontWeight: 600,
                              cursor: "pointer",
                              transition: "opacity 0.15s",
                           }}
                           onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                           onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                        >
                           View all in Admin Panel →
                        </button>
                     </div>
                  </>
               )}
            </div>
         )}

         {/* Bell ring keyframe */}
         <style>{`
            @keyframes nb-ring {
               0%, 100% { transform: rotate(0deg); }
               10%       { transform: rotate(14deg); }
               20%       { transform: rotate(-12deg); }
               30%       { transform: rotate(10deg); }
               40%       { transform: rotate(-8deg); }
               50%       { transform: rotate(0deg); }
            }
         `}</style>
      </li>
   );
};

export default NotificationBell;

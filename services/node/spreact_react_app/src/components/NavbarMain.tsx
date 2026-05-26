// NavbarMain.tsx
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import * as AuthService from "../services/auth.service";
import { getUserDashboards } from "../services/dashboard.service";
import oncodirLogo from "../assets/ONCODIR-LOGO.png";

type MenuItem = {
   label: string;
   href?: string;
   subMenu?: MenuItem[];
   hint?: string;
   isSection?: boolean;
   onClick?: () => void;
};

const NavbarMain: React.FC = () => {
   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [dashboards, setDashboards] = useState<MenuItem[]>([]);
   const [openMenu, setOpenMenu] = useState<string | null>(null);
   const [mobileOpen, setMobileOpen] = useState(false);
   const navigate = useNavigate();
   const location = useLocation();
   const currentUser = AuthService.getCurrentUser();
   const isAdmin = currentUser?.roles?.includes("ROLE_ADMIN");
   const isModerator = currentUser?.roles?.includes("ROLE_MODERATOR");

   useEffect(() => {
      const loggedIn = AuthService.isLoggedIn();
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
         const user = AuthService.getCurrentUser();
         if (user?.id) {
            getUserDashboards(user.id)
               .then((data) =>
                  setDashboards(
                     data.map((d: any) => ({
                        label: d.name,
                        href: `/my-dashboards?dashboardId=${d.id}`,
                     }))
                  )
               )
               .catch((err) => console.error("Failed to fetch dashboards:", err));
         }
      }
   }, []);


   // 1️⃣ define outside useEffect
   const refreshDashboards = async () => {
      const freshUser = AuthService.getCurrentUser();
      if (!freshUser?.id) return;

      try {
         const updatedDashboards = await getUserDashboards(freshUser.id);
         setDashboards(
            updatedDashboards.map((d: any) => ({
               label: d.name,
               href: `/my-dashboards?dashboardId=${d.id}`,
            }))
         );
      } catch (err) {
         console.error("Failed to refresh dashboards:", err);
      }
   };

   // 2️⃣ useEffect just adds/removes listeners
   useEffect(() => {
      window.addEventListener("dashboardCreated", refreshDashboards);
      window.addEventListener("dashboardDeleted", refreshDashboards);
      window.addEventListener("dashboardRenamed", refreshDashboards);

      // initial load if logged in
      if (AuthService.isLoggedIn()) refreshDashboards();

      return () => {
         window.removeEventListener("dashboardCreated", refreshDashboards);
         window.removeEventListener("dashboardDeleted", refreshDashboards);
         window.removeEventListener("dashboardRenamed", refreshDashboards);
      };
   }, []);

   const logout = () => {
      AuthService.logout();
      window.location.href = '/login';
   };

   const menus: MenuItem[] = [
      {
         label: "Descriptive Analytics",
         subMenu: [
            { label: "CRC Incidence", href: "/crc-incidence", hint: "Incidence patterns by age, sex, country, and year." },
            { label: "Risk Factors", href: "/crc-risk-factors", hint: "Descriptive SEV levels across subgroups and years." },
            { label: "CRC Policy Data", href: "/crc-policy-data", hint: "EU policy and intervention mappings across domains." },
            {
               label: "Trend & Association Analysis", href: "/crc-trend-and-association-analysis", hint: "Historical, subgroup-level analyses (associational).",
               subMenu: [
                  { label: "Trend & Association", isSection: true },
                  { label: "Trend Analysis", href: "/crc-trend-and-association-analysis?tab=trend-analysis", hint: "Long-term CRC incidence by demographic subgroup." },
                  { label: "Association Analysis", href: "crc-trend-and-association-analysis?tab=association-analysis", hint: "Statistical associations between CRC and SEVs." },
                  { label: "Trend Correlation", href: "crc-trend-and-association-analysis?tab=trend-correlation", hint: "Relationships between CRC and SEV trends." },
                  { label: "Forecasting CRC", href: "crc-trend-and-association-analysis?tab=forecasting-crc", hint: "Short-term extrapolations from historical data." },
               ],
            },
            { label: "Spanish CRC Regional Data", href: "/LIT03", hint: "Subnational CRC mortality and risk factor patterns." },
         ],
      },
      {
         label: "Predictive Analytics",
         subMenu: [
            { label: "Overview", isSection: true },
            { label: "Effect per SEV Unit", href: "/crc-predictive-analytics?tab=effect_sev_unit", hint: "Strength of association per unit change (EU view)." },
            { label: "Exposure-Weighted", href: "/crc-predictive-analytics?tab=exposure_weighted", hint: "Association strength combined with exposure prevalence." },
            { label: "Quick Wins", href: "/crc-predictive-analytics?tab=quick_wins", hint: "Highlights factors with stronger associations." },
            { label: "Single-Factor Exploration", isSection: true },
            { label: "Intervention-Driven", href: "/crc-predictive-analytics?tab=sf_intervention", hint: "What-If scenarios adjusting one SEV." },
            { label: "Target-Driven", href: "/crc-predictive-analytics?tab=sf_target", hint: "SEV levels linked to CRC reduction goals." },
            { label: "Two-Factor Exploration", isSection: true },
            { label: "Two-Factor Joint Effect", href: "/two-factor-exploration", hint: "Two-Factor Joint Effect Graph." }
         ],
      },
      {
         label: "Pilot Studies",
         // subMenu: [
         //    {
         //       // this submenu (flyout)
         //       label: "LIP2 ▸",
         //       hint: "Pilot-specific analyses and integrated summaries.",
         //       subMenu: [
         //          { label: "LIT2 (Greece)", isSection: true },  // <-- visible inside submenu
         //          {
         //             label: "Aggregation Analysis (GR)",
         //             href: "/lip2-aggregation-analysis?country=Greece",
         //             hint: "Pilot-specific aggregation results (integrated analytics & policy relevance).",
         //          },
         //           { label: "CRC Incidence Population Groups", isSection: true },  // <-- visible inside submenu
         //          {
         //             label: "CRC Incidence",
         //             href: "/lip2-population-groups",
         //             hint: "CRC Incidence Population Groups",
         //          },
         //          { label: "LIP1 (Romania)", isSection: true },  // <-- visible inside submenu
         //          {
         //             label: "Aggregation Analysis (RO)",
         //             href: "/lip2-aggregation-analysis?country=Romania",
         //             hint: "Pilot-specific aggregation results (integrated analytics & policy relevance).",
         //          },
         //       ],

         //    },
         // ],
         subMenu: [
            {
               label: "LIP2",
               href: "/large-scale-intervention",
               hint: "Pilot-specific analyses and integrated summaries.",
            },

            { label: "LIT2 (Greece)", isSection: true },

            {
               label: "Aggregation Analysis (GR)",
               href: "/lip2-aggregation-analysis?country=Greece",
               hint: "Pilot-specific aggregation results (integrated analytics & policy relevance).",
            },



            {
               label: "CRC Incidence Population Groups",
               href: "/lip2-population-groups",
               hint: "Clustering analysis based on LIT-02 data to identify 12 CRC Incidence population groups for LiP-02",
            },

            // { label: "LIP1 (Romania)", isSection: true },

            // {
            //    label: "Aggregation Analysis (RO)",
            //    href: "/lip2-aggregation-analysis?country=Romania",
            //    hint: "Pilot-specific aggregation results (integrated analytics & policy relevance).",
            // },


         ],
      },

   ];
   const renderMenu = (menu: MenuItem, depth = 0) => {
      const hasSubMenu = menu.subMenu && menu.subMenu.length > 0;
      const isOpen = openMenu === menu.label;

      if (menu.isSection) {
         return (
            <li key={menu.label} className="dropdown-section-header" aria-hidden="true">
               {menu.label}
            </li>
         );
      }

      const chevron = hasSubMenu && depth > 0 ? (
         <svg className="submenu-chevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
            <polyline points="9 18 15 12 9 6"/>
         </svg>
      ) : null;

      return (
         <li
            key={menu.label}
            className={`nav-item dropdown${depth > 0 ? " dropdown-submenu" : ""}`}
            onMouseEnter={() => depth === 0 && hasSubMenu && setOpenMenu(menu.label)}
            onMouseLeave={() => depth === 0 && hasSubMenu && setOpenMenu(null)}
         >
            {menu.href ? (
               <NavLink
                  to={menu.href!}
                  className={() => {
                     const currentUrl = location.pathname + location.search;
                     const active = menu.href === currentUrl;
                     return `dropdown-item${active ? " active" : ""}`;
                  }}
                  onClick={() => setMobileOpen(false)}
               >
                  {depth > 0 && <div className="dot"></div>}
                  <div style={{ flex: 1 }}>
                     <div className="label">{menu.label}</div>
                     {menu.hint && <div className="hint">{menu.hint}</div>}
                  </div>
                  {chevron}
               </NavLink>
            ) : (
               <a
                  className="dropdown-item"
                  href="#"
                  onClick={(e) => {
                     e.preventDefault();
                     if (depth > 0) setOpenMenu(isOpen ? null : menu.label);
                  }}
                  aria-expanded={isOpen}
               >
                  {depth > 0 && <div className="dot"></div>}
                  <div style={{ flex: 1 }}>
                     <div className="label">{menu.label}</div>
                     {menu.hint && <div className="hint">{menu.hint}</div>}
                  </div>
                  {chevron}
               </a>
            )}

            {hasSubMenu && (
               <ul className={`dropdown-menu${isOpen ? " show" : ""}`} role="menu">
                  {menu.subMenu!.map((sub) => renderMenu(sub, depth + 1))}
               </ul>
            )}
         </li>
      );
   };





   return (
      <nav className="navbar navbar-expand-lg">
         <div className="container-fluid">
            <NavLink className="navbar-brand" to="/">
               <img
                  width="158"
                  height="25"
                  src={oncodirLogo}
                  alt="ONCODIR Logo"
               />
            </NavLink>

            {isLoggedIn && (
               <button
                  className="navbar-toggler"
                  type="button"
                  onClick={() => setMobileOpen(!mobileOpen)}
                  aria-expanded={mobileOpen}
                  aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
               >
                  <span className="navbar-toggler-icon"></span>
               </button>
            )}

            <div className={`collapse navbar-collapse${mobileOpen ? " show" : ""}`}>
               <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                  {isLoggedIn && menus.map((menu) => renderMenu(menu))}
               </ul>

               {isLoggedIn && (
                  <ul className="navbar-nav ms-auto">
                     <li className="nav-item d-flex align-items-center me-3 user-info">
                        <div className="user-avatar">
                           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-person-fill" viewBox="0 0 16 16">
                              <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                           </svg>
                        </div>
                        <span className="user-text ms-2">
                           Logged in as: <strong>{AuthService.getCurrentUser()?.username}</strong>
                        </span>
                     </li>
                     <li className="nav-item dropdown">
                        <a
                           className="nav-link dropdown-toggle"
                           href="#"
                           onClick={(e) => e.preventDefault()}
                        >
                           Profile
                        </a>
                        <ul className="dropdown-menu dropdown-menu-end" role="menu">

                           <li>
                              <NavLink className="dropdown-item" to="/profile" onClick={() => setMobileOpen(false)}>View Profile</NavLink>
                           </li>
                           <li>
                              <NavLink className="dropdown-item" to="/change-password" onClick={() => setMobileOpen(false)}>Change Password</NavLink>
                              <hr />
                           </li>
                           {isAdmin && (
                              <>
                                 <li>
                                    <NavLink className="dropdown-item" to="/comments" onClick={() => setMobileOpen(false)}>
                                       Comments
                                    </NavLink>
                                 </li>
                                 {isModerator && (
                                    <li>
                                       <NavLink className="dropdown-item" to="/admin/users" onClick={() => setMobileOpen(false)}>
                                          Admin Panel
                                       </NavLink>
                                    </li>
                                 )}
                                 <hr />
                              </>
                           )}

                           {/* My Dashboards submenu */}
                           <li className="dropdown-submenu">
                              <NavLink className="dropdown-item" to="/my-dashboards" onClick={() => setMobileOpen(false)}>
                                 <div style={{ flex: 1 }}>
                                    <div className="label">My Dashboards</div>
                                 </div>
                                 {dashboards.length > 0 && (
                                    <svg className="submenu-chevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                                       <polyline points="9 18 15 12 9 6"/>
                                    </svg>
                                 )}
                              </NavLink>
                              {dashboards.length > 0 && (
                                 <ul className="dropdown-menu">
                                    {dashboards.map((db) => (
                                       <li key={db.href}>
                                          <NavLink
                                             to={db.href}
                                             onClick={() => setMobileOpen(false)}
                                             className={() => {
                                                const currentUrl = location.pathname + location.search;
                                                const active = currentUrl === db.href;
                                                return `dropdown-item${active ? " active" : ""}`;
                                             }}
                                          >
                                             <div className="dot"></div>
                                             <div>
                                                <div className="label">{db.label}</div>
                                             </div>
                                          </NavLink>
                                       </li>
                                    ))}
                                 </ul>
                              )}
                           </li>

                        </ul>
                     </li>

                     <li>
                        <NavLink className="nav-link nav-link-logout" to="/login" onClick={logout}>Logout</NavLink>
                     </li>
                  </ul>

               )}
            </div>
            {!isLoggedIn && (
               <ul className="navbar-nav ms-auto align-items-center" style={{ gap: "8px" }}>
                  <li>
                     <NavLink className="nav-btn-login" to="/login">Sign in</NavLink>
                  </li>
                  <li>
                     <NavLink className="nav-btn-register" to="/register">Register</NavLink>
                  </li>
               </ul>
            )}
         </div>


      </nav>
   );
};

export default NavbarMain;

// NavbarMain.tsx
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import * as AuthService from "../services/auth.service";
import { getUserDashboards } from "../services/dashboard.service";

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


   useEffect(() => {
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

      window.addEventListener("dashboardCreated", refreshDashboards);
      window.addEventListener("dashboardDeleted", refreshDashboards);
      window.addEventListener("dashboardRenamed", refreshDashboards);

      return () => {
         window.removeEventListener("dashboardCreated", refreshDashboards);
         window.removeEventListener("dashboardDeleted", refreshDashboards);
         window.addEventListener("dashboardRenamed", refreshDashboards);
      };
   }, []);


   const logout = () => {
      AuthService.logout();
      window.location.reload();
   };

   const menus: MenuItem[] = [
      {
         label: "Descriptive Analytics",
         subMenu: [
            { label: "CRC Incidence", href: "/crc-incidence", hint: "Incidence patterns by age, sex, country, and year." },
            { label: "Risk Factors", href: "/crc-risk-factors", hint: "Descriptive SEV levels across subgroups and years." },
            { label: "CRC Policy Data", href: "/crc-policy-data", hint: "EU policy and intervention mappings across domains." },
            {
               label: "Trend & Association Analysis ▸", href: "/crc-trend-and-association-analysis", hint: "Historical, subgroup-level analyses (associational).",
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
            { label: "Quick Wins", href: "/crc-predictive-analytics?tab=quick_wins", hint: "Highlights factors with stronger associations (non-causal)." },
            { label: "Single-Factor Exploration", isSection: true },
            { label: "Intervention-Driven", href: "/crc-predictive-analytics?tab=sf_intervention", hint: "What-If scenarios adjusting one SEV." },
            { label: "Target-Driven", href: "/crc-predictive-analytics?tab=sf_target", hint: "SEV levels linked to CRC reduction goals." },
         ],
      },
      {
         label: "Pilot Studies",
         subMenu: [
            {
               // this submenu (flyout)
               label: "LIP2 ▸",
               hint: "Pilot-specific analyses and integrated summaries.",
               subMenu: [
                  { label: "LIT2 (Greece)", isSection: true },  // <-- visible inside submenu
                  {
                     label: "Aggregation Analysis (GR)",
                     href: "/lip2-aggregation-analysis?country=Greece",
                     hint: "Pilot-specific aggregation results (integrated analytics & policy relevance).",
                  },
                  { label: "LIP1 (Romania)", isSection: true },  // <-- visible inside submenu
                  {
                     label: "Aggregation Analysis (RO)",
                     href: "/lip2-aggregation-analysis?country=Romania",
                     hint: "Pilot-specific aggregation results (integrated analytics & policy relevance).",
                  },
               ],

            },
         ],
      },


   ];

   const renderMenu = (menu: MenuItem, depth = 0) => {
      const hasSubMenu = menu.subMenu && menu.subMenu.length > 0;
      const isOpen = openMenu === menu.label;

      if (menu.isSection) {
         return (
            <li key={menu.label} className="dropdown-section-header px-3 py-1 text-muted">
               {menu.label}
            </li>
         );
      }

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
                  className={({ isActive }) => {
                     // Exact match with pathname + search
                     const currentUrl = location.pathname + location.search;
                     const active = menu.href === currentUrl;
                     return `dropdown-item${active ? " active" : ""}`;
                  }}
               >
                  {depth > 0 && <div className="dot"></div>}
                  <div>
                     <div className="label">{menu.label}</div>
                     {menu.hint && <div className="hint">{menu.hint}</div>}
                  </div>
               </NavLink>
            ) : (
               <a
                  className={`dropdown-item d-flex align-items-start gap-2`}
                  href="#"
                  onClick={(e) => {
                     e.preventDefault();
                     if (depth > 0) setOpenMenu(isOpen ? null : menu.label);
                  }}
                  aria-expanded={isOpen}
               >
                  {depth > 0 && <div className="dot mb-1"></div>}
                  <div>
                     <div className="label">{menu.label}</div>
                     {menu.hint && <div className="hint">{menu.hint}</div>}
                  </div>
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
                  src="https://www.oncodir.eu/wp-content/uploads/2023/07/ONCODIR-LOGO.svg"
                  alt="ONCODIR Logo"
               />
            </NavLink>

            <button
               className="navbar-toggler"
               type="button"
               onClick={() => setMobileOpen(!mobileOpen)}
            >
               <span className="navbar-toggler-icon"></span>
            </button>

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
                              <NavLink className="dropdown-item" to="/profile">View Profile</NavLink>
                           </li>
                           <li>
                              <NavLink className="dropdown-item" to="/change-password">Change Password</NavLink>
                              <hr />
                           </li>
                           {isAdmin && (
                              <li>
                                 <NavLink className="dropdown-item" to="/comments">
                                    Comments
                                 </NavLink>
                                 <hr />
                              </li>
                           )}

                           {/* My Dashboards submenu */}
                           <li className="dropdown-submenu">
                              <a className="dropdown-item" href="/my-dashboards">My Dashboards</a>
                              {dashboards.length > 0 && (
                                 <ul className="dropdown-menu">
                                    {dashboards.map((db) => (
                                       <li key={db.href}>
                                          <NavLink
                                             to={db.href}
                                             className={({ isActive }) => {
                                                const currentUrl = location.pathname + location.search;
                                                const active = currentUrl === db.href; // compare full URL with query
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
                        <NavLink className="nav-link" to="/login" onClick={logout}>Logout</NavLink>
                     </li>
                  </ul>

               )}
            </div>
            {!isLoggedIn && (
               <ul className="navbar-nav ms-auto">
                  {/* ✅ LOGIN + REGISTER WHEN LOGGED OUT */}
                  <li>
                     <NavLink className="nav-link" to="/login">Login</NavLink>
                  </li>
                  <li>
                     <NavLink className="nav-link" to="/register">Register</NavLink>
                  </li>
               </ul>
            )}
         </div>


      </nav>
   );
};

export default NavbarMain;

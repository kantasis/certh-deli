import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import * as AuthService from "../services/auth.service";
import { getUserRole } from "../services/auth.service";
import { getUserDashboards } from "../services/dashboard.service";

const NavbarMain: React.FC = () => {
   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [dashboards, setDashboards] = useState<any[]>([]);
   const [showProfileDropdown, setShowProfileDropdown] = useState(false);
   const [showDashboardsMenu, setShowDashboardsMenu] = useState(false);
   const [showLip2Menu, setShowLip2Menu] = useState(false);
   const navigate = useNavigate();

   useEffect(() => {
      const loggedIn = AuthService.isLoggedIn();
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
         const user = AuthService.getCurrentUser();
         if (user?.id) {
            getUserDashboards(user.id)
               .then((data) => setDashboards(data))
               .catch((err) => console.error("Failed to fetch dashboards:", err));
         }
      }
   }, []);

   useEffect(() => {
      const user = AuthService.getCurrentUser();

      const refreshDashboards = async () => {
         if (user?.id) {
            try {
               const updatedDashboards = await getUserDashboards(user.id);
               setDashboards(updatedDashboards);
            } catch (err) {
               console.error("Failed to refresh dashboards:", err);
            }
         }
      };

      const handleDashboardCreated = () => refreshDashboards();
      const handleDashboardDeleted = () => refreshDashboards();

      window.addEventListener("dashboardCreated", handleDashboardCreated);
      window.addEventListener("dashboardDeleted", handleDashboardDeleted);

      return () => {
         window.removeEventListener("dashboardCreated", handleDashboardCreated);
         window.removeEventListener("dashboardDeleted", handleDashboardDeleted);
      };
   }, []);

   const userRole = getUserRole();

   const logout = () => {
      AuthService.logout();
      window.location.reload();
   };

   const leftButtons_tsx = [
      {
         href: "/crc-incidence",
         label: "CRC Incidence"
      },
      {
         href: "/crc-risk-factors",
         label: "CRC Risk Factors"
      },
      {
         href: "/crc-policy-data",
         label: "CRC Policy Data"
      },
      {
         href: "/crc-predictive-analytics",
         label: "CRC Predictive Analytics"
      },
      {
         href: "/LIT03",
         label: "Spanish CRC Regional Data",
         onClick: () => localStorage.setItem("lit03Panel", "")
      },
      {
         href: "/crc-trend-and-association-analysis",
         label: "CRC Trend & Association Analysis"
      },
      //   {
      //    href: "/deli-predictions",
      //    label: "Deli Predictions"
      // }
   ].map((item, index) => (
      <li className="nav-item" key={index}>
         <NavLink
            to={item.href}
            className={({ isActive }) =>
               isActive ? "nav-link active" : "nav-link"
            }
            onClick={item.onClick}
         >
            {item.label}
         </NavLink>
      </li>
   ));

   // Insert LIP2 dropdown before Comments
   const lip2Menu = (
      <li
         className="nav-item dropdown"
         onMouseEnter={() => setShowLip2Menu(true)}
         onMouseLeave={() => setShowLip2Menu(false)}
      >
         <a
            className="nav-link dropdown-toggle"
            href="#"
            role="button"
            onClick={(e) => e.preventDefault()}
         >
            LIP2
         </a>
         <ul className={`dropdown-menu ${showLip2Menu ? "show" : ""}`}>
            <li>
               <NavLink className="dropdown-item" to="/lip2-aggregation-analysis">
                  Aggregation Analysis
               </NavLink>
            </li>
         </ul>
      </li>
   );

   const commentItem = userRole === "ROLE_ADMIN" && (
      <li className="nav-item" key="comments">
         <NavLink
            to="/comments"
            className={({ isActive }) =>
               isActive ? "nav-link active" : "nav-link"
            }
         >
            Comments
         </NavLink>
      </li>
   );

   const rightButtons_tsx = [];

   if (!isLoggedIn) {
      rightButtons_tsx.push(
         <li className="nav-item" key="login">
            <NavLink
               to="/login"
               className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
               }
            >
               Login
            </NavLink>
         </li>,
         <li className="nav-item" key="register">
            <NavLink
               to="/register"
               className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
               }
            >
               Register
            </NavLink>
         </li>
      );
   } else {
      rightButtons_tsx.push(
         <li
            className={`nav-item dropdown ${showProfileDropdown ? "show" : ""}`}
            key="profile"
            onMouseEnter={() => setShowProfileDropdown(true)}
            onMouseLeave={() => {
               setShowProfileDropdown(false);
               setShowDashboardsMenu(false);
            }}
         >
            <a
               className="nav-link dropdown-toggle"
               href="#"
               id="navbarDropdown"
               role="button"
               onClick={(e) => e.preventDefault()}
            >
               Profile
            </a>
            <ul
               className={`dropdown-menu dropdown-menu-end ${showProfileDropdown ? "show" : ""}`}
               aria-labelledby="navbarDropdown"
            >
               <li>
                  <NavLink className="dropdown-item" to="/profile">
                     View Profile
                  </NavLink>
               </li>
               <li>
                  <NavLink className="dropdown-item" to="/change-password">
                     Change Password
                  </NavLink>
               </li>
               {dashboards.length >= 0 && (
                  <>
                     <li><hr className="dropdown-divider" /></li>
                     <li
                        onMouseEnter={() => setShowDashboardsMenu(true)}
                        onMouseLeave={() => setShowDashboardsMenu(false)}
                     >
                        <div
                           className="dropdown-item d-flex justify-content-between align-items-center"
                           style={{ cursor: "pointer" }}
                           onClick={() => navigate(`/my-dashboards`)}
                        >
                           My Dashboards
                           <span style={{ fontSize: "0.75rem" }}>▼</span>
                        </div>
                        {showDashboardsMenu && dashboards.length > 0 && (
                           <>
                              {dashboards.map((dashboard) => (
                                 <div
                                    key={dashboard.id}
                                    className="dropdown-item ps-4"
                                    style={{ cursor: "pointer" }}
                                    onClick={(e) => {
                                       e.preventDefault();
                                       navigate(`/my-dashboards?dashboardId=${dashboard.id}`);
                                       setShowProfileDropdown(false);
                                       setShowDashboardsMenu(false);
                                    }}
                                 >
                                    
                                    {dashboard.name}
                                 </div>
                              ))}

                           </>
                        )}
                     </li>
                  </>
               )}
            </ul>
         </li>,
         <li className="nav-item" key="logout">
            <NavLink to="/login" className="nav-link" onClick={logout}>
               Logout
            </NavLink>
         </li>
      );
   }

   return (
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
         <div className="container-fluid">
            <NavLink className="navbar-brand" to="/">
               <img
                  width="158"
                  height="25"
                  src="https://www.oncodir.eu/wp-content/uploads/2023/07/ONCODIR-LOGO.svg"
                  alt="Logo"
               />
            </NavLink>

            <button
               className="navbar-toggler"
               type="button"
               data-bs-toggle="collapse"
               data-bs-target="#navbarSupportedContent"
            >
               <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarSupportedContent">
               <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                  {leftButtons_tsx}
                  {isLoggedIn && lip2Menu}
                  {isLoggedIn && commentItem}
               </ul>
               <ul className="navbar-nav my-2 my-lg-0">{rightButtons_tsx}</ul>
            </div>
         </div>
      </nav>
   );
};

export default NavbarMain;

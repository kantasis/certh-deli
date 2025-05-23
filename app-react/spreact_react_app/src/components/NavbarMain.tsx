import { NavLink } from "react-router-dom";
import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service";
import { getUserRole } from '../services/auth.service';

const NavbarMain: React.FC = () => {
   const [isLoggedIn, setIsLoggedIn] = useState(false);

   useEffect(() => {
      setIsLoggedIn(AuthService.isLoggedIn());
   }, []);

   const userRole = getUserRole();

   const logout = () => {
      AuthService.logout();
      window.location.reload();
   };

   const leftButtons_tsx = [
      {
         href: "/crc-incidence",
         label: "CRC Incidence",
         condition: isLoggedIn
      },
      {
         href: "/crc-risk-factors",
         label: "CRC Risk Factors",
         condition: isLoggedIn
      },
      {
         href: "/crc-policy-data",
         label: "CRC Policy Data",
         condition: isLoggedIn
      },
      {
         href: "/crc-predictive-analytics",
         label: "CRC Predictive Analytics",
         condition: isLoggedIn
      },
      {
         href: "/LIT03",
         label: "Spanish CRC Regional Data",
         condition: isLoggedIn,
         onClick: () => localStorage.setItem("lit03Panel", "")
      },
      {
         href: "/crc-trend-and-association-analysis",
         label: "CRC Trend & Association Analysis",
         condition: isLoggedIn
      },
      {
         href: "/comments",
         label: "Comments",
         condition: isLoggedIn && userRole === "ROLE_ADMIN"
      }
   ].map((item, index) =>
      item.condition ? (
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
      ) : null
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
         <li className="nav-item dropdown" key="profile">
            <a
               className="nav-link dropdown-toggle"
               href="#"
               id="navbarDropdown"
               role="button"
               data-bs-toggle="dropdown"
               aria-expanded="false"
            >
               Profile
            </a>
            <ul
               className="dropdown-menu dropdown-menu-end"
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
               <li>
                  <NavLink className="dropdown-item" to="/my-dashboards">
                     My Dashboards
                  </NavLink>
               </li>
            </ul>
         </li>,
         <li className="nav-item" key="logout">
            <NavLink
               to="/login"
               className="nav-link"
               onClick={logout}
            >
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
               aria-controls="navbarSupportedContent"
               aria-expanded="false"
               aria-label="Toggle navigation"
            >
               <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarSupportedContent">
               <ul className="navbar-nav me-auto mb-2 mb-lg-0">{leftButtons_tsx}</ul>
               <ul className="navbar-nav my-2 my-lg-0">{rightButtons_tsx}</ul>
            </div>
         </div>
      </nav>
   );
};

export default NavbarMain;

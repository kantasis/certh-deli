import { Routes, Route, Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service";
import EventBus from "../common/EventBus";
import { getUserRole } from '../services/auth.service';
import ChangePasswordDropdown from "./ChangePasswordDropdown";
const NavbarMain: React.FC = () => {

   const [isLoggedIn, setIsLoggedIn] = useState(false);
   // const [user_dict, setUserDict] = useState(false);

   // TODO: Check it out https://www.bezkoder.com/handle-jwt-token-expiration-react/
   useEffect(
      () => {
         setIsLoggedIn(AuthService.isLoggedIn());
      },
      []
   );
const userRole = getUserRole();
console.log(userRole);

   const logout = () => {
      AuthService.logout();
      window.location.reload();
   };

   const leftButtons_tsx = [
      // {
      //    href: "dashboard",
      //    label: "Dashboard",
      //    condition: isLoggedIn
      // },
      {
         href: "crc-incidence",
         label: "CRC Incidence",
         condition: isLoggedIn
      },
      {
         href: "crc-risk-factors",
         label: "CRC Risk Factors",
         condition: isLoggedIn
      },
      // {
      //    href: "nutritionPanel",
      //    label: "Nutrition Data",
      //    condition: isLoggedIn
      // },
      // {
      //    href: "LifestylePanel",
      //    label: "Lifestyle Data",
      //    condition: isLoggedIn
      // },
      {
         href: "crc-policy-data",
         label: "CRC Policy Data",
         condition: isLoggedIn
      },
      {
         href: "crc-predictive-analytics",
         label: "CRC Predictive Analytics",
         condition: isLoggedIn
      },
      // {
      //    href: "CRCmortalityPanel",
      //    label: "CRC Mortality",
      //    condition: isLoggedIn
      // },
      // {
      //    href: "ScreeningRiskFactorDataPanel",
      //    label: "Screening & Risk Factor Data",
      //    condition: isLoggedIn
      // },
      // {
      //    href: "CrcIncidenceDataPanel",
      //    label: "CRC Incidence Data Panel",
      //    condition: isLoggedIn
      // },
      {
         
         href: "LIT03",
         label: "Spanish CRC Regional Data",
         condition: isLoggedIn 
      },
      {
         
         href: "trend-and-association-analysis",
         label: "Trend and Association Analysis",
         condition: isLoggedIn 
      },
      {
         
         href: "comments",
         label: "Comments",
         condition: isLoggedIn && userRole == "ROLE_ADMIN"
      },
   
      
   ].map((item_dict, index) => item_dict.condition && (
      <li className="nav-item" key={index}>
         <a
            className="nav-link"
            href={item_dict.href}
         // onClick={item_dict.onClick ? item_dict.onClick : undefined}
         >
            {item_dict.label}
         </a>
      </li>
   ));

   const rightButtons_tsx = [];

if (!isLoggedIn) {
   rightButtons_tsx.push(
      <li className="nav-item" key="login">
         <a className="nav-link" href="login">Login</a>
      </li>,
      <li className="nav-item" key="register">
         <a className="nav-link" href="register">Register</a>
      </li>
   );
} else {
   rightButtons_tsx.push(
      // Dropdown for Profile
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
         <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
            <li>
               <a className="dropdown-item" href="/profile">View Profile</a>
            </li>
            <li>
               <a className="dropdown-item" href="/change-password">Change Password</a>
            </li>
         </ul>
      </li>,

      // Logout button
      <li className="nav-item" key="logout">
         <a className="nav-link" href="login" onClick={logout}>Logout</a>
      </li>
   );
}

   return (
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
         <div className="container-fluid">
            <a
               className="navbar-brand"
               href="/"
            >
               {/* Policy Analytics Dashboard */}
               <img
                  width="158"
                  height="25"
                  src="https://www.oncodir.eu/wp-content/uploads/2023/07/ONCODIR-LOGO.svg"
               // className="qodef-header-logo-image qodef--main" 
               // alt="logo main"
               />
            </a>

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
            <div
               className="collapse navbar-collapse"
               id="navbarSupportedContent"
            >
               <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                  {leftButtons_tsx}
               </ul>

               <ul className="navbar-nav my-2 my-lg-0">
                  {rightButtons_tsx}
               </ul>
            </div>
         </div>
      </nav>
   );

};

export default NavbarMain;

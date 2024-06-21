import { Routes, Route, Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service";
import EventBus from "../common/EventBus";


const NavbarMain: React.FC = () => {

   const [isLoggedIn, setIsLoggedIn] = useState(false);
   // const [user_dict, setUserDict] = useState(false);

   // TODO: Check it out https://www.bezkoder.com/handle-jwt-token-expiration-react/
   useEffect(
      () => {
         setIsLoggedIn(AuthService.isLoggedIn());
         console.log("Navbar: "+ isLoggedIn);
      }, 
      []
   );

   const logout = () => {
      console.log('logging off');
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
         href: "epidimiologicalPanel",
         label: "CRC Incidence over the years",
         condition: isLoggedIn
      },
      {
         href: "nutritionPanel",
         label: "Nutrition Data",
         condition: isLoggedIn
      },
      {
         href: "LifestylePanel",
         label: "Lifestyle Data",
         condition: isLoggedIn
      },

   ].map( (item_dict, index) => item_dict.condition && (
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

   const rightButtons_tsx = [
      {
         href: "login",
         label: "Login",
         condition: !isLoggedIn
      },
      {
         href: "register",
         label: "Register",
         condition: !isLoggedIn
      },
      {
         href: "profile",
         label: "Profile",
         condition: isLoggedIn
      },
      {
         href: "login",
         label: "Logout",
         onClick: () => logout(),
         condition: isLoggedIn
      },
   ].map( (item_dict, index) => item_dict.condition && (
      <li className="nav-item" key={index}>
         <a 
            className="nav-link" 
            href={item_dict.href}
            onClick={item_dict.onClick ? item_dict.onClick : undefined}
         >
            {item_dict.label}
         </a>
      </li>
   ));



   return (
      <nav className="navbar navbar-expand-lg bg-body-tertiary">
         <div className="container-fluid">
            <a 
               className="navbar-brand" 
               href="/"
            >
               ONCO-DELI
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

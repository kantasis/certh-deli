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

         // setUserDict(AuthService.getCurrentUser());

         // TODO: Change this into the result of a statement
         // if (user_dict) {
         //    console.log("authorized" + user_dict);
         //    setIsLoggedIn(true);
         // }else{
         //    console.log("unauthorized" + user_dict);
         //    setIsLoggedIn(false);
         // }

         // EventBus.on("logoff", AuthService.logout);
         // return () => {
         //    EventBus.remove("logoff", AuthService.logout);
         // };

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
   

   // console.log(JSON.stringify(user_dict,null,3));
   // console.log(isLoggedIn);


   const dashboardButton_cmp = (
      <li className="nav-item">
         <a 
            className="nav-link" 
            href="dashboard"
         >
            Dashboard
         </a>
      </li>
   );

   const profileButton_cmp = (
      <li className="nav-item">
         <a 
            className="nav-link" 
            href="profile"
         >
            Profile
         </a>
      </li>
   );


   const loginButton_cmp = (
      <li className="nav-item">
         <a 
            className="nav-link" 
            href="login"
         >
            Login
         </a>
      </li>
   );

   const registerButton_cmp = (
      <li className="nav-item">
         <a 
            className="nav-link"
            href={"/register"} 
         >
            Sign Up
         </a>
      </li>
   );

   const logoutButton_cmp = (
      <li className="nav-item">
         <a 
            className="nav-link"
            href="/login"
            onClick={() => logout()}
         >
            Logout
         </a>
      </li>
   );


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
                  
                  {/* <li className="nav-item">
                     <a 
                        className="nav-link active" 
                        aria-current="page" 
                        href="#"
                     >
                        Home
                     </a>
                  </li> */}
                  
                  {/* <li className="nav-item">
                     <a 
                        className="nav-link" 
                        href="#"
                     >
                        Link
                     </a>
                  </li> */}
                  
                  {/* <li className="nav-item dropdown">
                     <a 
                        className="nav-link dropdown-toggle" 
                        href="#" 
                        role="button" 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false"
                     >
                        Dropdown
                     </a>
                     <ul className="dropdown-menu">
                        <li><a className="dropdown-item" href="#">Action</a></li>
                        <li><a className="dropdown-item" href="#">Another action</a></li>
                        <li><hr className="dropdown-divider"/></li>
                        <li><a className="dropdown-item" href="#">Something else here</a></li>
                     </ul>
                  </li> */}
                  
                  {/* <li className="nav-item">
                     <a 
                        className="nav-link disabled" 
                        aria-disabled="true"
                     >
                        Disabled
                     </a>
                  </li> */}
                  {isLoggedIn && dashboardButton_cmp}
                  {isLoggedIn && profileButton_cmp}
                  {isLoggedIn && logoutButton_cmp}
                  {isLoggedIn || loginButton_cmp}
                  {isLoggedIn || registerButton_cmp}
               </ul>


               {/* <form 
                  className="d-flex test" 
                  role="search"
               >
                  <input 
                     className="form-control me-2" 
                     type="search" 
                     placeholder="Search" 
                     aria-label="Search"
                  />
                  <button 
                     className="btn btn-outline-success" 
                     type="submit"
                  >
                     Search
                  </button>
               
               </form> */}
            
            </div>
         </div>
      </nav>
   );

};

export default NavbarMain;

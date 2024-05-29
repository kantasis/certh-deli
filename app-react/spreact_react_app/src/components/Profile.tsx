import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service";

const Profile: React.FC = () => {

   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [user_dict, setUserDict] = useState();

   useEffect(
      () => {
         setUserDict(AuthService.getCurrentUser());
         setIsLoggedIn(AuthService.isLoggedIn());
         console.log("Profile: "+ isLoggedIn);
      }, 
      []
   );


   if (!isLoggedIn)
      return <h2>Unauthorized</h2>;


   return (
      <div className="container">
         <header className="jumbotron">
            <h3>
               <strong>{user_dict.username}</strong> Profile
            </h3>
         </header>
         <p>
            <strong>Id:</strong> {user_dict.id}
         </p>
         <p>
            <strong>Email:</strong> {user_dict.email}
         </p>
         <strong>Authorities:</strong>
         <ul>
            {
               user_dict.roles 
               && user_dict
                  .roles
                  .map((role: string, index: number)  => <li key={index}>{role}</li>)
            }
         </ul>
      </div>
   );
};

export default Profile;

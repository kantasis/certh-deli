import React from "react";
import { getCurrentUser } from "../services/auth.service";

const Profile: React.FC = () => {
   const user_dict = getCurrentUser();

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

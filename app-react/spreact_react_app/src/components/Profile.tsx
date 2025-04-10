import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service";

const Profile: React.FC = () => {

   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [user_dict, setUserDict] = useState();

   useEffect(
      () => {
         setUserDict(AuthService.getCurrentUser());
         setIsLoggedIn(AuthService.isLoggedIn());
         console.log("Profile: " + isLoggedIn);
      },
      []
   );


   if (!isLoggedIn)
      return <h2>Unauthorized</h2>;


   return (
      <div className="container mt-5">
      <header className="jumbotron">
        <h3>Profile</h3>
      </header>
      <table className="table table-bordered mt-5">
        <tbody>
        <tr>
            <th>Name</th>
            <td>{user_dict.name}</td>
          </tr>
          <tr>
            <th>Surname</th>
            <td>{user_dict.surName}</td>
          </tr>
          <tr>
            <th>Username</th>
            <td>{user_dict.username}</td>
          </tr>
          <tr>
            <th>Id</th>
            <td>{user_dict.id}</td>
          </tr>
          <tr>
            <th>Email</th>
            <td>{user_dict.email}</td>
          </tr>
          <tr>
            <th>Authorities</th>
            <td>
              {user_dict.roles &&
                user_dict.roles
                  .map((role: string) =>
                    role === "ROLE_USER"
                      ? "User"
                      : role === "ROLE_ADMIN"
                      ? "Administrator"
                      : role
                  )
                  .join(", ")}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
   );
};

export default Profile;

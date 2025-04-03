import axios from "axios";
import { NavigateFunction, useNavigate } from 'react-router-dom';

// const authentication_host = "localhost";
// const authentication_host = "160.40.53.35";
const authentication_host = import.meta.env.VITE_AUTHENTICATION_HOST;
const authentication_port = import.meta.env.VITE_AUTHENTICATION_PORT;

const api_url = `http://${authentication_host}:${authentication_port}/api/v1/auth/`;

// Register function
export const register = (username: string, email: string, password: string) => {
   return axios
      .post(
         api_url + "register", 
         {
            username,
            email,
            password,
         }
      );
};

// Login function
export const login = (username: string, password: string) => {
   // console.log("LOGGIN IN!");
   return axios
      .post(
         api_url + "login", 
         {
            username,
            password,
         }
      )
      .then((response) => {
         // console.log(JSON.stringify(response,null,3) );
         if (response.data.username) {
            localStorage.setItem("user", JSON.stringify(response.data));
         }
         return response.data;
      });
};
 
// Logout function logout
export const logout = () => {
   // console.log('logging out');

   // let navigate: NavigateFunction = useNavigate();

   localStorage.removeItem("user");

   // navigate("/login");
   // window.location.reload();

   // TODO: This one may be useful at some point
   // return axios
   //    .post(api_url + "signout")
   //    .then((response) => {
   //       return response.data;
   //    });
};


export const getCurrentUser = () => {
   const user = localStorage.getItem('user'); // Or sessionStorage
   return user ? JSON.parse(user) : null; // Return the user object if it exists, otherwise null
};
export const getUserRole = (): string | null => {
   const user = localStorage.getItem('user'); // Or sessionStorage if you're using that
   if (user) {
       const parsedUser = JSON.parse(user);
       if (parsedUser.roles && parsedUser.roles.length > 0) {
           return parsedUser.roles[0]; // If you want to return the first role
       }
   }
   return null; // Return null if no role is found or no user is stored
};


export const isLoggedIn = () => {
   return getCurrentUser() !== null;
};


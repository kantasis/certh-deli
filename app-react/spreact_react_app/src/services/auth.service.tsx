import axios from "axios";
import { NavigateFunction, useNavigate } from 'react-router-dom';

// TODO: Make this be loaded from somewhere
// const api_url = "http://localhost:3000/api/auth/";

// const authentication_host = "localhost";
// const authentication_host = "160.40.53.35";
const authentication_host = import.meta.env.VITE_AUTHENTICATION_HOST;
const authentication_port = import.meta.env.VITE_AUTHENTICATION_PORT;

const api_url = `http://${authentication_host}:${authentication_port}/api/v1/auth/`;

// Register function
export const register = (username: string, email: string, password: string) => {
   return axios
      .post(
         api_url + "signup", 
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
   const user_json = localStorage.getItem("user");
   // console.log("asking the current user:" + user_json);
   if (user_json) 
      return JSON.parse(user_json);

   return null;
};


export const isLoggedIn = () => {
   return getCurrentUser() !== null;
};


import axios from "axios";

// TODO: Make this be loaded from somewhere
// const API_URL = "http://localhost:3000/api/auth/";
const API_URL = "http://localhost:8081/api/v1/auth/";

// Register function
export const register = (username: string, email: string, password: string) => {
   return axios
      .post(
         API_URL + "signup", 
         {
            username,
            email,
            password,
         }
      );
};

// Login function
export const login = (username: string, password: string) => {
   console.log("LOGGIN IN!");
   return axios
      .post(
         API_URL + "login", 
         {
            username,
            password,
         }
      )
      .then((response) => {
         console.log(JSON.stringify(response,null,3) );
         if (response.data.username) {
            localStorage.setItem("user", JSON.stringify(response.data));
         }
         return response.data;
      });
};
 
// Logout function logout
export const logout = () => {
   localStorage.removeItem("user");
   return axios
      .post(API_URL + "signout")
      .then((response) => {
         return response.data;
      });
};


export const getCurrentUser = () => {
   const user_json = localStorage.getItem("user");
   if (user_json) 
      return JSON.parse(user_json);

   return null;
};

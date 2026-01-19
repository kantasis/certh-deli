import axios from "axios";
import { NavigateFunction, useNavigate } from 'react-router-dom';
import authHeader from "./auth-header";
 const authentication_host = "deli.oncodir.eu";
 //const authentication_host = "160.40.53.35";
//const authentication_host = import.meta.env.VITE_AUTHENTICATION_HOST;
const authentication_port = import.meta.env.VITE_AUTHENTICATION_PORT;

//const api_url = `https://${authentication_host}/api/v1/auth/`;
const api_url = '/api/v1/auth/';

// Register function
// Register function with name and surname


export const register = (
   username: string,
   email: string,
   password: string,
   name: string,
   surname: string
) => {
   return axios
      .post(api_url + 'register', { username, email, password, name, surname })
      .then((response) => {
         // Handle successful registration here, if necessary
         console.log('Registration successful:', response.data);
         return response.data; // Return the response data
      })
      .catch((error) => {
         // Handle errors here (e.g., display error messages)
         if (error.response) {
            // Server responded with an error
            console.error('Error response:', error.response.data);
            throw new Error(error.response.data.message || 'An error occurred during registration');
         } else if (error.request) {
            // Request was made but no response was received
            console.error('Error request:', error.request);
            throw new Error('No response from server');
         } else {
            // Something else went wrong
            console.error('Error message:', error.message);
            throw new Error(error.message || 'An unknown error occurred');
         }
      });
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
         console.log(JSON.stringify(response, null, 3));
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


export const updatePassword = (oldPassword: string, newPassword: string) => {
   return axios.post(
      `${api_url}update-password`,
      {
         oldPassword,
         newPassword,
      },
      { headers: authHeader() }
   );
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


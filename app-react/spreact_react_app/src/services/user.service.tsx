import axios from "axios";
import authHeader from "./auth-header";

// TODO: Make this be loaded from one place
// const API_URL = "http://localhost:3000/api/auth/";
const API_URL = "http://localhost:8081/api/v1/content/";

// TODO: This is not a user.service but a content.service
export const getPublicContent = () => {
   return axios.get(
      API_URL + "all",
      { headers: authHeader() }
   );
};

// TODO: Rename the 'Board' in 'Page'
export const getUserBoard = () => {
   return axios.get(
      API_URL + "user",
      { headers: authHeader() }
   );
};

// TODO: Rename the 'Board' in 'Page'
export const getModeratorBoard = () => {
   return axios.get(
      API_URL + "mod",
      { headers: authHeader() }
   );
};


// TODO: Rename the 'Board' in 'Page'
export const getAdminBoard = () => {
   return axios.get(
      API_URL + "admin",
      { headers: authHeader() }
   );
};

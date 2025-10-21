export default function authHeader() {
   const user_json = localStorage.getItem("user");
   let user_dict = null;
   if (user_json)
      user_dict = JSON.parse(user_json);

   if (user_dict && user_dict.token) {
      console.log("Token: " + user_dict.token);
      return { Authorization: 'Bearer ' + user_dict.token }; // for Spring Boot back-end
      // return { 'x-access-token': user.accessToken };       // for Node.js Express back-end
   } else {
      return { Authorization: '' }; // for Spring Boot back-end
      // return { 'x-access-token': null }; // for Node Express back-end
   }
}
import axios from "axios";
import { useState } from "react";
// // Reference: https://www.bezkoder.com/axios-request/
// export default axios.create({
//    // TODO: I smell envars are needed here
//    baseURL: "http://localhost:8080/api",
//    headers: {
//       "Content-type": "application/json"
// "access-control-allow-origins": "http://localhost:8082",

//    }
// });

function Spring_Data(){
   
   const [springResponse_str, setSpringResponse] = useState("No response yet");
   // TODO: This should use HOST_SPRING_PORT
   const url = "http://localhost:8081/hello"

   axios.get(url)
   .then( (response) => {

      console.log(response);
      // response.data
      // response.headers
      // response.status

      setSpringResponse(response.data)
   });

   // const { data } = await axios.get(url);

   return (
      <div>
         {springResponse_str}
      </div>
   )
}

export default Spring_Data;
import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service";

const grafana_host = import.meta.env.VITE_GRAFANA_HOST;
const grafana_port = import.meta.env.VITE_GRAFANA_PORT;
const grafana_path = import.meta.env.VITE_GRAFANA_PATH;
const dashboard_name = import.meta.env.VITE_GRAFANA_DASHBOARD;

const grafana_url = `http://${grafana_host}:${grafana_port}/${grafana_path}/${dashboard_name}?orgId=1&theme=light`
// http://localhost:3000/d-solo/edn5ahxrzaw3kc/deli-main-dashboarg?orgId=1&theme=light&panelId=4&var-deli_custom_var=5

// var envs_json = JSON.stringify(import.meta.env, null, 2); // spacing level = 2
// console.log('GK> ' + envs_json);

const Dashboard: React.FC = () => {

   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [selected_idx, setSelectedIdx] = useState(0);
   const [grafanaVar_int, setGrafanaVar] = useState(5);
   const [urlParams_str, setUrlParams] = useState('');
   const [iFrameUrl_str, setIFrameUrl] = useState('');
   const [filter_startYear_int, setFilter_startYear_int] = useState(1990);
   const [filter_country_str, setFilter_country_str] = useState('');
   
   // const [user_dict, setUserDict] = useState(false);

   useEffect(
      () => {
         setIsLoggedIn(AuthService.isLoggedIn());
         console.log("Dashboard: "+ isLoggedIn);
      },
      []
   );

   if (!isLoggedIn)
      return <h2>Unauthorized</h2>;

   return (
      <div className="main">
         <ul 
            className="nav nav-tabs" 
            id="tabs1"
            role="tablist"
         >
         </ul>
         <button>Update dataset</button>
         <span>[{filter_country_str}]</span>
         <div 
            className="tab-content" 
            id="myTabContent"
         >
         </div>
      </div>
   );
};


export default Dashboard;

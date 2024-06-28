import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service.tsx";
import { Button, Dropdown } from 'react-bootstrap'; 
import PolicyFilter from "./PolicyFilter.tsx";
import Glossary from "./Glossary.tsx";


const grafana_host = import.meta.env.VITE_GRAFANA_HOST;
const grafana_port = import.meta.env.VITE_GRAFANA_PORT;
const grafana_path = import.meta.env.VITE_GRAFANA_PATH;
const dashboard_name = import.meta.env.VITE_GRAFANA_DASHBOARD;

const panel_id = 4;
const grafana_url = `http://${grafana_host}:${grafana_port}/${grafana_path}/${dashboard_name}?panelId=${panel_id}&orgId=1&theme=light`

const PolicyPanel: React.FC = () => {

   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [selectedPolicy_str, set_selectedPolicy] = useState('');

   const getUriParams = () => {
      let policyFilter_str = `var-policy_filter=${selectedPolicy_str}`;
      return `${policyFilter_str}`;
   };

   const iFrame_url = `${grafana_url}&${getUriParams()}`;

   useEffect(
      () => {
         setIsLoggedIn(AuthService.isLoggedIn());
      },
      []
   );

   if (!isLoggedIn)
      return <h2>Unauthorized</h2>;

   return (<>

      {/* Filters */}
      <div className="row">

         <PolicyFilter
            selectedPolicy_str={selectedPolicy_str}
            set_selectedPolicy={set_selectedPolicy}
         />
         <div className="col-lg"></div>
         <div className="col-lg"></div>

      </div>

      <div className="embed-responsive embed-responsive-16by9">
         <iframe 
            id="embeddedPanel_id"
            className="embed-responsive-item"
            src={iFrame_url}
            width="100%"
            height="600px"
         >
         </iframe>
         <div>
            {/* {iFrame_url} */}
         </div>
      </div>
      
   </>);
};

export default PolicyPanel;

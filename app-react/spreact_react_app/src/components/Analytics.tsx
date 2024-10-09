import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service.tsx";
import { Button, Dropdown } from 'react-bootstrap'; 
import AnalyticsFilter from "./AnalyticsFilter.tsx";
import Glossary from "./Glossary.tsx";

const grafana_host = import.meta.env.VITE_GRAFANA_HOST;
const grafana_port = import.meta.env.VITE_GRAFANA_PORT;
const grafana_path = import.meta.env.VITE_GRAFANA_PATH;
const dashboard_name = import.meta.env.VITE_GRAFANA_DASHBOARD;

const panel_id = 3;
const grafana_url = `http://${grafana_host}:${grafana_port}/${grafana_path}/${dashboard_name}?panelId=${panel_id}&orgId=1&theme=light`

const AnalyticsPanel: React.FC = () => {

   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [selectedFactor_str, set_selectedFactor] = useState('');

   useEffect(
      () => {
         setIsLoggedIn(AuthService.isLoggedIn());
      },
      []
   );

   if (!isLoggedIn)
      return <h2>Unauthorized</h2>;

   const style = {
      image:{
         width: '100%',
         height: '100%',
         objectFit: 'cover', // Maintains aspect ratio, while covering the area
      }
   };
   
   // const imageUrl = `vite.svg`;
   // const imageUrl = `${import.meta.PUBLIC_URL}/react.svg`;

   return (<>

      <h3>ONCODIR Predictive Analytics</h3>
      <p>Regression analysis showing the impact of exposure to various risk factors on CRC incidence</p>

      {/* Filters */}
      <div className="row">

         <AnalyticsFilter
            selectedFactor_str={selectedFactor_str}
            set_selectedFactor={set_selectedFactor}
         />

      </div>
      
      <div >
         <img alt="analysis" src={selectedFactor_str} style={style.image}/>
      </div>
      <Glossary/>

   </>);
};

export default AnalyticsPanel;

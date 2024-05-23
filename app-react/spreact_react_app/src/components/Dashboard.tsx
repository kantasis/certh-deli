import { Routes, Route, Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service";
import DashboardTab from "../components/DashboardTab.tsx";
import DashboardPanel from "../components/DashboardPanel.tsx";
// import EventBus from "./common/EventBus";


const Dashboard: React.FC = () => {

   const dashboardPanels_dictLst= [
      {
         panel_id: "geomap",
         panel_label: "Geo Map"
      },
      {
         panel_id: "barchart",
         panel_label: "Barchart"
      },
      {
         panel_id: "spiderplot",
         panel_label: "Spider plot"
      },
   ]

   // <!-- Tabbed List Reference -->
   // <!-- https://getbootstrap.com/docs/5.0/components/navs-tabs/#javascript-behavior -->
   return (
      <div className="main">
         <ul 
            className="nav nav-tabs" 
            id="tabs1"
            role="tablist"
         >
            
            {
               dashboardPanels_dictLst.map( (dashboardPanels_dict,index) => 
                  <DashboardTab
                     panel_id={dashboardPanels_dict["panel_id"]}
                     panel_label={dashboardPanels_dict["panel_label"]}
                     isActive_b={index===1}
                     key={dashboardPanels_dict["panel_id"]}
                  />
               )
            }
         </ul>
         <div 
            className="tab-content" 
            id="myTabContent"
         >

            {
               dashboardPanels_dictLst.map( (dashboardPanels_dict,index) => 
                  <DashboardPanel
                     panel_id={dashboardPanels_dict["panel_id"]}
                     panel_label={dashboardPanels_dict["panel_label"]}
                     isActive_b={false}
                     key={dashboardPanels_dict["panel_id"]}
                  />
               )
            }

         </div>
         
      </div>


   );

};

export default Dashboard;

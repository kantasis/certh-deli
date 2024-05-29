import { Routes, Route, Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service";
// import EventBus from "./common/EventBus";


const Dashboard: React.FC = () => {

   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [selected_idx, setSelectedIdx] = useState(0);
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

   // TODO: The vars over here should go to configuration files
   const grafana_port = "3000";
   const grafana_host = "160.40.53.35";
   const grafana_path = "d-solo/edn5ahxrzaw3kc";
   const dashboard_name = "deli-main-dashboarg";

   const grafana_url = `http://${grafana_host}:${grafana_port}/${grafana_path}/${dashboard_name}?orgId=1&theme=light`
   
   const tabInfo_dictLst = [
      {
         id: "geomap",
         label_str: "Geomap",
         // TODO: The panelId var should probably go to a datastore
         url: `${grafana_url}&panelId=1`,

      },
      {
         id: "barchart",
         label_str: "Barchart",
         url: `${grafana_url}&panelId=2`,
      },
      {
         id: "spiderplot",
         label_str: "Spiderplot",
         url: `${grafana_url}&panelId=3`,
      },
   ];


   const tabs_jsx = tabInfo_dictLst.map((tabInfo_dict, index) => (
      <li 
         className="nav-item"
         role="presentation"
         onClick={(event)=> setSelectedIdx(index) }
         key={"tabs_jsx"+index}
      >
         <button 
            className={ "nav-link" + (index === selected_idx ? " active" : "") }
            id={tabInfo_dict['id']+"-tab" }
            data-bs-toggle="tab" 
            data-bs-target={"#"+tabInfo_dict['id']}
            type="button" 
            role="tab" 
            aria-controls={tabInfo_dict['id']} 
            aria-selected={ index === selected_idx ? "true" : "false" }
            
         >
            {tabInfo_dict['label_str']}
         </button>
      </li>
   ));


   const tabPanels_jsx = tabInfo_dictLst.map((tabInfo_dict, index) => (
      <div 
         className={ "tab-pane fade show" + (index === selected_idx ? " active" : "")}
         id={tabInfo_dict['id']} 
         role="tabpanel" 
         aria-labelledby={tabInfo_dict['id'] + "-tab"}
         key={"tabContents_jsx"+index}
      >
         <div className="embed-responsive embed-responsive-16by9">
            <iframe 
               className="embed-responsive-item"
               src={tabInfo_dict['url']}
               width="800"
               height="600"
            >
            </iframe>
         </div>
      </div>
   ));



   return (
      <div className="main">
         <ul 
            className="nav nav-tabs" 
            id="tabs1"
            role="tablist"
         >
            {tabs_jsx}
         </ul>
         <div 
            className="tab-content" 
            id="myTabContent"
         >
         {tabPanels_jsx}
         </div>
      </div>
   );
};


export default Dashboard;

import { Routes, Route, Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service";
import FilterPanel from "../components/FilterPanel";
// import EventBus from "./common/EventBus";

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
      {
         id: "testplot",
         label_str: "Test Dev Plot",
         url: `${grafana_url}&panelId=4`,
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

   const input_handler = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      // console.log(value);
      setGrafanaVar(Number(value));
   };

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
               id="embeddedPanel_id"
               className="embed-responsive-item"
               src={tabInfo_dict['url'] + `&${urlParams_str}`}
               width="1200"
               height="600"
               >
            </iframe>
         </div>
      </div>
   ));

   const reloadIFrame_cbk = ()=>{
      // document.getElementById('embeddedPanel_id');
      // urlParams_str
      // tabInfo_dict['url'] + `&${urlParams_str}`
      setUrlParams(`var-deli_country_var=${filter_country_str}`);
      console.log(`GK> ${urlParams_str}`);
   };

   return (
      <div className="main">
         <ul 
            className="nav nav-tabs" 
            id="tabs1"
            role="tablist"
         >
            {tabs_jsx}
         </ul>
         <FilterPanel
            filter_startYear_int={filter_startYear_int}
            setFilter_startYear_int={setFilter_startYear_int}
            filter_country_str={filter_country_str}
            setFilter_country_str={setFilter_country_str}
         />
         <button>Update dataset</button>
         <button onClick={(event)=> reloadIFrame_cbk() }>Update graph</button>
         <span>[{filter_country_str}]</span>
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

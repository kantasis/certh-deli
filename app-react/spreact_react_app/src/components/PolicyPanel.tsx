import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service.tsx";
import { Button, Dropdown } from 'react-bootstrap'; 
import PolicyFilter from "./PolicyFilter.tsx";
import { Accordion } from 'react-bootstrap';

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
      let policyFilter_str = `var-policy_filter=${encodeURIComponent(selectedPolicy_str)}`;
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

   const sources_dict:{ [key: string]: string }  = {
      'Austria': "Krebsrahmenprogramm Österreich 2014",
      'Belgium': "Joint Plan for the Chronically Ill-Integrated Care for Better Health",
      'Bulgaria': "NATIONAL PROGRAM FOR THE PREVENTION OF CHRONIC NON-COMMUNICABLE DISEASES -2014-2020 WORK PROGRAMME",
      'Croatia': "National Cancer Control Plan 2020-2030",
      'Cyprus': "National Cancer Plan 2019",
      'Chezh Republic': "National Cancer Control Plan  2030",
      'Denmark': "PATIENTS' CANCER PLAN CANCER PLAN IV",
      'Estonia': "Estonian Cancer Control Plan 2021-2030",
      'Finland': "National Cancer Plan II 2014-2025",
      'France': "FRANCE TEN-YEAR CANCER-CONTROL STRATEGY",
      'Germany': "Policies at place as found in action plans available in the Federal Ministry of Health website",
      'Greece': "National Public Health Plan 2021-2025 (Provisions for cancer are incorporated)",
      'Hungary': "National Cancer Program (2006)No Update",
      'Ireland': "National Cancer Strategy 2017-2026 ",
      'Italy': "National Cancer Plan  2023-2027",
      'Latvia': "Public Health Guidelines 2014-2020",
      'Lithuania': "THE NATIONAL PROGRAM FOR THE PREVENTION AND CONTROL OF CANCER FOR THE PERIOD 2014-2025",
      'Luxemburg': "National Cancer Plan 2020-2024",
      'Malta': "National Cancer Plan 2017-2021 (No update available)",
      'Netherlands': "The Dutch Cancer Agenda (2023)",
      'Poland': "Program wieloletni pn. NARODOWA STRATEGIA ONKOLOGICZNA na lata 2020-2030 & National Cancer Strategy 2017-2024",
      'Portugal': "The National Cancer Plan (2017) has a focus on sreaning and treatment; for primary prevention the only goal that sets is \"to boost the participation of citizens, with particular emphasis on the promotion of healthy lifestyles\". However, there are established primary prevetion policies and are available through the Ministry of Health website.",
      'Romania': "Planul National de Combatere a Cancerului 2022",
      'Slovakia': "National Oncology Program  2021-2025 ",
      'Slovenia': "National Cancer Control Program 2022-2026",
      'Spain': "Estrategia en Cáncer del Sistema Nacional de Salud (2010) + Estrategia para el Abordaje de la Cronicidad  en el Sistema Nacional de Salud (2012)",
      'Sweden': "National Cancer Strategy 2009 (No update available)",
   };

   return (<>

      <div className="row">

         {/* Left Navbar */}
         <div className="col-sm-2">
            <PolicyFilter
               selectedPolicy_str={selectedPolicy_str}
               set_selectedPolicy={set_selectedPolicy}
            />
         </div>

         {/* Center Content */}
         <div className="col-sm-8">
            <div className="embed-responsive embed-responsive-16by9">
            <iframe 
               id="embeddedPanel_id"
               className="embed-responsive-item"
               src={iFrame_url}
               width="100%"
               height="600px"
            >
            </iframe>
            {/* <div>{iFrame_url}</div> */}
         </div>

         </div>

         {/* Right Navbar */}
         <div className="col-sm-2">
         <h5>Sources</h5>
            <Accordion defaultActiveKey="-1">
               { Object.keys(sources_dict).map( key_str => (
                  <Accordion.Item 
                     eventKey={key_str} 
                     key={key_str}
                  >
                     <Accordion.Header>{key_str}</Accordion.Header>
                     <Accordion.Body className="text-start" >
                        <p>
                           {sources_dict[key_str]}
                        </p>
                     </Accordion.Body>
                  </Accordion.Item>
               ))}
            </Accordion>
         </div>

      </div>

   </>);
};

export default PolicyPanel;

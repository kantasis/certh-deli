import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service.tsx";
import { Accordion } from 'react-bootstrap';


const grafana_host = import.meta.env.VITE_GRAFANA_HOST;
const grafana_port = import.meta.env.VITE_GRAFANA_PORT;
const grafana_path = import.meta.env.VITE_GRAFANA_PATH;
const dashboard_name = import.meta.env.VITE_GRAFANA_DASHBOARD;

const panel_id = 4;
const grafana_url = `http://${grafana_host}:${grafana_port}/${grafana_path}/${dashboard_name}?panelId=${panel_id}&orgId=1&theme=light`

const Glossary: React.FC = () => {

   const [isLoggedIn, setIsLoggedIn] = useState(false);

   useEffect(
      () => {
         setIsLoggedIn(AuthService.isLoggedIn());
      },
      []
   );

   if (!isLoggedIn)
      return <h2>Unauthorized</h2>;

   const accordionContent_dictLst = [
      {
         title: 'Source',
         content: (<>
            <p>
               Global Burden of Disease 2019.<br/><br/>
               Data from 1990 to 2019.<br/><br/>
               Data from 34 European countries<br/><br/>
               CRC Incidence Age-Standardised Rate (ASR)<br/><br/>
               Data aggregated for Both sexes<br/><br/>
            </p>
         </>)
      },
      {
         title: 'Summary Exposure Value (SEV)',
         content: (<>
            <p>
            Measure of a population's exposure to a risk factor that takes into account the extent of exposure by risk level and the severity of that risk's contribution to disease burden. 
            </p>
         </>)
      },
      {
         title: 'Deaths',
         content: (<>
            <p>
            Number of deaths in the population per 100,000.
            </p>
         </>)
      },
      {
         title: 'Disability adjusted life years (DALYs)',
         content: (<>
            <p>
            Number of DALYs in the population per 100,000.
            </p>
         </>)
      },
      {
         title: 'Years of life lost (YLLs)',
         content: (<>
            <p>
            Number of YLLs in the population per 100,000
            </p>
         </>)
      },
      {
         title: 'Years lived with disability (YLDs)',
         content: (<>
            <p>
            Number of YLDs in the population per 100,000
            </p>
         </>)
      },
   ];

   return (<>

      <h5>Glossary</h5>
      <Accordion defaultActiveKey="-1">
         {accordionContent_dictLst.map((accordionContent_dict, itemIndex_int) => (
            <Accordion.Item 
               eventKey={itemIndex_int.toString()} 
               key={itemIndex_int}
            >
               <Accordion.Header>{accordionContent_dict['title']}</Accordion.Header>
               <Accordion.Body className="text-start" >{accordionContent_dict['content']}</Accordion.Body>
            </Accordion.Item>
         ))}
      </Accordion>

   </>);
};

export default Glossary;

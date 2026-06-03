import React, { useState, useEffect } from "react";
import Unauthorized from './Unauthorized';
import * as AuthService from "../services/auth.service.tsx";
import { Accordion } from 'react-bootstrap';

const accordionContent_dictLst = [
   {
      title: 'Data Sources',
      content: (<>
         <div style={{ height: '340px', overflow: 'scroll' }}>
            <p>
               <li><strong>Source: </strong>Global Burden of Disease Study 2021</li><br />

               <li><strong>Years: </strong>1990-2021</li><br />

               <li><strong>Geographic Coverage: </strong>46 countries in Europe</li><br />

               <li><strong>Age Groups: </strong>Under 25 (0–24 years), 25–50 (25 to 49 years), Above 50 (50 and older), Age-Standardized (Adjusted rates that account for differences in age distributions across populations)</li><br />

               <li><strong>Sex Groups: </strong>Both Sexes (Aggregated data for males and females), Males (males only), and Females (females only)</li><br />

               <li><strong>CRC Incidence Rate: </strong>Number of new CRC cases diagnosed per 100,000 population in a year</li><br />

               <li><strong>Risk factors: </strong>22 risk factors, comprising 4 lifestyle factors, 15 nutrition factors, 2 comorbidities, and 1 socioeconomic factor</li><br />

               <li><strong>Summary Exposure Value (SEV) rates: </strong>This metric represents the relative risk-weighted prevalence of exposure, accounting for both the extent of exposure and its contribution to disease burden. SEV is the metric for 21 risk factors (excluding socioeconomic factor)</li><br />
            </p>
         </div>
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

const Glossary: React.FC = () => {
   const [isLoggedIn, setIsLoggedIn] = useState(false);

   useEffect(
      () => {
         setIsLoggedIn(AuthService.isLoggedIn());
      },
      []
   );

   if (!isLoggedIn)
      return <Unauthorized />;

   return (<>
      <Accordion defaultActiveKey="-1" className="app-accordion">
            {accordionContent_dictLst.map((accordionContent_dict, itemIndex_int) => (
               <Accordion.Item
                  eventKey={itemIndex_int.toString()}
                  key={itemIndex_int}
               >
                  <Accordion.Header>{accordionContent_dict['title']}</Accordion.Header>
                  <Accordion.Body className="text-start">{accordionContent_dict['content']}</Accordion.Body>
               </Accordion.Item>
            ))}
      </Accordion>
   </>);
};

export default Glossary;

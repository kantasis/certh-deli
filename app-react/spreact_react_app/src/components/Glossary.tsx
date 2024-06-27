import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service.tsx";


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

   return (<>

      <div className="row">
         <h2>Glossary:</h2>
         <table className="table">
            <thead>
               <tr>
                  <th scope="col">Measure</th>
                  <th scope="col">Definition</th>
                  <th scope="col">Percent</th>
                  <th scope="col">Rate</th>
                  {/* <th scope="col">Years</th>
                  <th scope="col">Probability of death</th> */}
               </tr>
            </thead>
            <tbody>
            <tr>
                  <th scope="row">Summary Exposure Value (SEV)</th>
                  <td>The prevalence of cases weighted by the risk</td>
                  <td>n/a</td>
                  <td>Cases per 100,000 population</td>
                  {/* <td>n/a</td>
                  <td>n/a</td> */}
               </tr>
               <tr>
                  <th scope="row">Deaths</th>
                  <td>Number of deaths in the population</td>
                  <td>Proportion of deaths for a particular cause relative to deaths from all causes</td>
                  <td>Deaths per 100,000 population</td>
                  {/* <td>n/a</td>
                  <td>n/a</td> */}
               </tr>
               <tr>
                  <th scope="row">Disability adjusted life years (DALYs)</th>
                  <td>Number of DALYs in the population</td>
                  <td>Proportion of DALYs for a particular cause relative to DALYs for all causes</td>
                  <td>DALYs per 100,000 population</td>
                  {/* <td>n/a</td>
                  <td>n/a</td> */}
               </tr>
               <tr>
                  <th scope="row">Years of life lost (YLLs)</th>
                  <td>Number of YLLs in the population</td>
                  <td>Proportion of YLLs for a particular cause relative to YLDs for all causes</td>
                  <td>YLLs per 100,000 population</td>
                  {/* <td>n/a</td>
                  <td>n/a</td> */}
               </tr>
               <tr>
                  <th scope="row">Years lived with disability (YLDs)</th>
                  <td>Number of YLDs in the population</td>
                  <td>Proportion of YLDs for a particular cause relative to YLDs for all causes</td>
                  <td>YLDs per 100,000 population</td>
                  {/* <td>n/a</td>
                  <td>n/a</td> */}
               </tr>
               {/* <tr>
                  <th scope="row">Prevalence</th>
                  <td>Total number of cases in the population</td>
                  <td>Proportion of total cases of a particular cause relative to cases from all causes</td>
                  <td>Total cases per 100,000 population</td>
                  <td>n/a</td>
                  <td>n/a</td>
               </tr>
               <tr>
                  <th scope="row">Incidence</th>
                  <td>Number of new cases in the population</td>
                  <td>Proportion of new cases of a particular cause relative to cases from all causes</td>
                  <td>New cases per 100,000 population</td>
                  <td>n/a</td>
                  <td>n/a</td>
               </tr>
               <tr>
                  <th scope="row">Maternal mortality ratio (MMR)</th>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>Deaths per 100,000 live births</td>
                  <td>n/a</td>
                  <td>n/a</td>
               </tr>
               <tr>
                  <th scope="row">Probability of death</th>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>Probability of dying due to a specific cause between a given age start and end, contingent upon being alive at age start</td>
               </tr>
               <tr>
                  <th scope="row">Life expectancy</th>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>Years lived</td>
                  <td>n/a</td>
               </tr>
               <tr>
                  <th scope="row">Healthy life expectancy (HALE)</th>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>Years lived</td>
                  <td>n/a</td>
               </tr>
               <tr>
                  <th scope="row">Summary exposure value (SEV)</th>
                  <td>n/a</td>
                  <td>n/a</td>
                  <td>0 to 100, where 0 is no risk and 100 is the highest level of risk</td>
                  <td>n/a</td>
                  <td>n/a</td>
               </tr> */}
            </tbody>
         </table>
      </div>

   </>);
};

export default Glossary;

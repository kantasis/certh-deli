import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service.tsx";
import { Button, Dropdown } from 'react-bootstrap'; 
import { Accordion } from 'react-bootstrap';
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
   const [selectedFactor_int, set_selectedFactor] = useState(0);
   const [glossaryTerm_int, set_glossaryTerm] = useState(0);

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

   const accordionContent_dictLst = [
      {
         title: 'Method',
         content: (<>
            <p>
               Random Effects Linear Regression was performed with country as a Random Effect. <br/>
               Final number of risk factors used in the model was 13.<br/>
               Time-lag analyses of 1, 3, 5 and 10 years between the dependent variable (CRC Incidence) and the independent variables (risk factors) investigated potential downstream effects Cai et al. 2024 Public Health (+ link).<br/>
               For example, SEV for 1990 was correlated with CRC incidence for 1991, 1993, 1995 and 2000. SEV for 1991 was correlated with CRC incidence for 1992, 1994, 1996 and 2001 and so on. 
            </p>
         </>)
      },
      {
         title: 'SOURCE',
         content: (<>
            <p>
               Global Burden of Disease 2019 (+ link)<br/>
               Data from 1990 to 2019<br/>
               Data from 34 European countries<br/>
               CRC Incidence Age-Standardised Rate (ASR)<br/>
               Data aggregated for Both sexes<br/>
            </p>
         </>)
      },
   ];
   
   // const images_dictLst = [
   //    {
   //       label: "01",
   //       value: "01.png"
   //    },
   //    {
   //       label: "02",
   //       value: "02.png"
   //    },
   //    {
   //       label: "03",
   //       value: "03.png"
   //    },
   //    {
   //       label: "04",
   //       value: "04.png"
   //    },
   //    {
   //       label: "05",
   //       value: "05.png"
   //    },
   //    {
   //       label: "06",
   //       value: "06.png"
   //    },
   //    {
   //       label: "07",
   //       value: "07.png"
   //    },
   //    {
   //       label: "08",
   //       value: "08.png"
   //    },
   //    {
   //       label: "09",
   //       value: "09.png"
   //    },
   //    {
   //       label: "10",
   //       value: "10.png"
   //    },
   //    {
   //       label: "11",
   //       value: "11.png"
   //    },
   //    {
   //       label: "13",
   //       value: "13.png"
   //    },
   // ];

   const yearLagsImages_strLst = [
      "01.png",
      "02.png",
      "03.png",
      "04.png",
   ];

   const riskFactorImages_strLst = [
      "05.png",
      "06.png",
      "07.png",
      "08.png",
      "09.png",
      "10.png",
      "11.png",
      "12.png",
      "13.png",
   ];

   const factors_dictLst = [
      {
         label: "Year Lags",
         value: 0,
         description: "Summary Exposure Value1 of various CRC Risk Factors",
      },
      {
         label: "Risk Factors",
         value: 1,
         description: "Time interval between Risk Factor exposure and CRC incidence",
      },
   ]

   const yearLags_html = (<>
      <table>
            {yearLagsImages_strLst.map((_, rowIndex_int) => {
               const column_cnt = 2;
               if (rowIndex_int%column_cnt!=0) return<></>;
               const rowImages_strLst = yearLagsImages_strLst.slice(rowIndex_int,rowIndex_int+column_cnt)
               console.log('asdf');
               return (<>
                  <tr key={`row:${rowIndex_int}`}>
                     {rowImages_strLst.map((yearLagsImage_str, colIndex_int)=>(
                        <td key={`cell-${rowIndex_int}-${colIndex_int}`}><img src={yearLagsImage_str} style={style.image}/></td>
                     ))}
                  </tr>
               </>)

            })}
      </table>
   </>);
   
   const riskFactors_html = (<>
      <table>
            {riskFactorImages_strLst.map((_, rowIndex_int) => {
               const column_cnt = 3;
               if (rowIndex_int%column_cnt!=0) return<></>;
               const rowImages_strLst = riskFactorImages_strLst.slice(rowIndex_int,rowIndex_int+column_cnt)
               return (<>
                  <tr key={`row:${rowIndex_int}`}>
                     {rowImages_strLst.map((yearLagsImage_str, colIndex_int)=>(
                        <td key={`cell-${rowIndex_int}-${colIndex_int}`}><img src={yearLagsImage_str} style={style.image}/></td>
                     ))}
                  </tr>
               </>)

            })}
      </table>
   </>);
   
   return (<>

      <h3>ONCODIR Predictive Analytics</h3>
      <p>Regression analysis showing the impact of exposure to various risk factors on CRC incidence</p>

      {/* Filters */}
      <div className="row">

         <AnalyticsFilter
            selectedFactor_int={selectedFactor_int}
            set_selectedFactor={set_selectedFactor}
            factors_dictLst={factors_dictLst}
         />

      </div>
      
      <div className="row">
         {[yearLags_html, riskFactors_html][selectedFactor_int]}
         {/* <img alt="analysis" src={selectedFactor_int} style={style.image}/> */}
      </div>
      
      <Accordion defaultActiveKey="0">
         {accordionContent_dictLst.map((accordionContent_dict, itemIndex_int) => (
            <Accordion.Item 
               eventKey={itemIndex_int.toString()} 
               key={itemIndex_int}
            >
               <Accordion.Header>{accordionContent_dict['title']}</Accordion.Header>
               <Accordion.Body>{accordionContent_dict['content']}</Accordion.Body>
            </Accordion.Item>
         ))}
      </Accordion>

   </>);
};

export default AnalyticsPanel;

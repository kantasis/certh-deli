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
   const [selectedAnalysis_int, set_selectedAnalysis] = useState(0);

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
         padding: '15% 0%'
      }
   };
   
   const accordionContent_dictLst = [
      {
         title: 'Source',
         content: (<>
            <p>
               Global Burden of Disease 2019 (+ link) Data from 1990 to 2019<br/>
               <br/>
               Data from 34 European countries<br/>
               CRC Incidence Age-Standardised Rate (ASR)<br/>
               Data aggregated for Both sexes<br/>
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
         title: 'Year Lags',
         content: (<>
            <p>
            Year lags refer to the time interval between risk factor exposure and CRC incidence. Based on: Cai et al. 2024 (Public Health).
            </p>
         </>)
      },
      {
         title: 'Methodology',
         content: (<>
            <p>
            Random Effects Linear Regression was performed with country as a Random Effect. Final number of risk factors used in the model was 13. Time-lag analyses of 1, 3, 5 and 10 years between CRC Incidence and Risk Factors investigated potential downstream effects. For example, SEV for 1990 was correlated with CRC incidence for 1991, 1993, 1995 and 2000. SEV for 1991 was correlated with CRC incidence for 1992, 1994, 1996 and 2001 and so on.
            </p>
         </>)
      },
   ];

   const yearLagsImages_strLst = [
      "1 Year Lag.png",
      "3 Years Lag.png",
      "5 Years Lag.png",
      "10 Years Lag.png",
   ];

   const riskFactorImages_strLst = [
      "Alcohol use.png",
      "Diet high in red meat.png",
      "Diet high in trans fatty acids.png",
      "Diet low in polyunsaturated fatty acids.png",
      "Diet low in seafood omega-3 fatty acids.png",
      "Diet low in vegetables.png",
      "Diet low in whole grains.png",
      "High body-mass index.png",
      "Low physical activity.png",
   ];

   const yearLags_html = (<>
      <table><tbody>
         {yearLagsImages_strLst.map((_, rowIndex_int) => {
            const column_cnt = 2;
            if (rowIndex_int%column_cnt!=0) return<></>;
            const rowImages_strLst = yearLagsImages_strLst.slice(rowIndex_int,rowIndex_int+column_cnt)
            return (<>
               <tr key={`row:${rowIndex_int}`}>
                  {rowImages_strLst.map((yearLagsImage_str, colIndex_int)=>(
                     <td key={`cell-${rowIndex_int}-${colIndex_int}`}><img src={yearLagsImage_str} style={style.image}/></td>
                  ))}
               </tr>
            </>)
         })}
      </tbody></table>
   </>);
   
   const riskFactors_html = (<>
      <table><tbody>
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
      </tbody></table>
   </>);

   const analyses_dictLst = [
      {
         value: 0,
         label: "",
         title:"",
         caption: "",
         html:(<></>),
      },
      {
         value: 1,
         label: "Per Year Lag",
         title:"Change of associations between exposure to a specific risk factor and CRC incidence as year lags increase between them. “Only statistically significant associations between risk factors and CRC incidence are shown. Higher coefficients indicate a stronger association between risk factor Summary Exposure Value (SEV) and CRC incidence. Negative coefficients may be related to a number of factors, e.g. the presence of confounding variables.",
         caption: "Time interval between Risk Factor exposure and CRC incidence",
         html:yearLags_html,
      },
      {
         value: 2,
         label: "Per Risk Factor",
         title:"Associations between exposure to various risk factors and CRC incidence for a specific year lag between them. “Only statistically significant associations between risk factors and CRC incidence are shown. Higher coefficients indicate a stronger association between risk factor Summary Exposure Value (SEV) and CRC incidence. Negative coefficients may be related to a number of factors, e.g. the presence of confounding variables.",
         caption: "Summary Exposure Value of various CRC Risk Factors",
         html:riskFactors_html,
      },
   ]
   
   return (<>

      <div className="row">

         {/* Left column */}
         <div className="col-sm-2">
            <AnalyticsFilter
               selectedAnalysis_int={selectedAnalysis_int}
               set_selectedAnalysis={set_selectedAnalysis}
               analyses_dictLst={analyses_dictLst}
            />
            <p className="text-start">{analyses_dictLst[selectedAnalysis_int]['title']}</p>
         </div>

         {/* Centerpiece*/}
         <div className="col-sm-8">
            <h3>Regression analysis showing the impact of exposure to various risk factors on CRC incidence</h3>
            <h4>{analyses_dictLst[selectedAnalysis_int]['caption']}</h4>
            {analyses_dictLst[selectedAnalysis_int]['html']}
            {/* {selectedAnalysis_dict['html']} */}
            {/* {yearLags_html} */}
         </div>

         {/* Right column */}
         <div className="col-sm-2">
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
         </div>

      </div>
   </>);
};

export default AnalyticsPanel;

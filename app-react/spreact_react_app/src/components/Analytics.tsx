import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service.tsx";
import { Button, Dropdown } from 'react-bootstrap';
import { Accordion } from 'react-bootstrap';
import AnalyticsFilter from "./AnalyticsFilter.tsx";
import Glossary from "./Glossary.tsx";
import AnalyticsRiskFactorFilter from "./AnalyticsRiskFactorFilter.tsx";
import AnalyticsYearLagFilter from "./AnalyticsYearLagFilter.tsx";

const grafana_host = import.meta.env.VITE_GRAFANA_HOST;
const grafana_port = import.meta.env.VITE_GRAFANA_PORT;
const grafana_path = import.meta.env.VITE_GRAFANA_PATH;
const dashboard_name = import.meta.env.VITE_GRAFANA_DASHBOARD;


const grafana_url = `http://${grafana_host}:${grafana_port}/${grafana_path}/${dashboard_name}?orgId=1&theme=light`;

const AnalyticsPanel: React.FC = () => {

   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [selectedAnalysis_int, set_selectedAnalysis] = useState(0);
   const [selectedRiskFactor_int, set_selectedRiskFactors] = useState(0);
   const [selectedYearLag_int, set_selectedYearLag] = useState(0);


   useEffect(
      () => {
         setIsLoggedIn(AuthService.isLoggedIn());
      },
      []
   );

   if (!isLoggedIn)
      return <h2>Unauthorized</h2>;

   const style = {
      image: {
         width: '100%',
         height: '100%',
         objectFit: 'cover', // Maintains aspect ratio, while covering the area
         padding: '2% 0%'
      }
   };

   const accordionContent_dictLst = [
      {
         title: 'Source',
         content: (<>
            <p>
               Global Burden of Disease 2019.<br /><br />
               Data from 1990 to 2019.<br /><br />
               Data from 34 European countries<br /><br />
               CRC Incidence Age-Standardised Rate (ASR)<br /><br />
               Data aggregated for Both sexes<br /><br />
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
               Random Effects Linear Regression was performed with country as a Random Effect.<br /><br />
               Final number of risk factors used in the model was 13. <br /><br />
               Time-lag analyses of 1, 3, 5 and 10 years between CRC Incidence and Risk Factors investigated potential downstream effects.<br /><br />
               For example, SEV for 1990 was correlated with CRC incidence for 1991, 1993, 1995 and 2000. <br /><br />
               SEV for 1991 was correlated with CRC incidence for 1992, 1994, 1996 and 2001 and so on.<br /><br />
               Negative coefficients may be related to a number of factors, e.g. the presence of confounding variables.
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

   const yearLags_html = (<>
      <table><tbody>
         {/* {yearLagsImages_strLst.map((_, rowIndex_int) => {
            const column_cnt = 2;
            if (rowIndex_int%column_cnt!=0) return<></>;
            const rowImages_strLst = yearLagsImages_strLst.slice(rowIndex_int,rowIndex_int+column_cnt)
            return (<>
               <tr key={`row:${rowIndex_int}`}>
                  {rowImages_strLst.map((yearLagsImage_str, colIndex_int)=>(
                     <td key={`cell-${rowIndex_int}-${colIndex_int}`}>
                        <img src={yearLagsImage_str} style="{style.image}"/>
                     </td>
                  ))}
               </tr>
            </>)
         })} */}
      </tbody></table>
   </>);

   // const riskFactorImages_strLst = [
   //    "Alcohol use.png",
   //    "Diet high in red meat.png",
   //    "Diet high in trans fatty acids.png",
   //    "Diet low in polyunsaturated fatty acids.png",
   //    "Diet low in seafood omega-3 fatty acids.png",
   //    "Diet low in vegetables.png",
   //    "Diet low in whole grains.png",
   //    "High body-mass index.png",
   //    "Low physical activity.png",
   // ];

   const riskFactors_html = (<>
      <table><tbody>
         {/* {riskFactorImages_strLst.map((_, rowIndex_int) => {
               const column_cnt = 2;
               if (rowIndex_int%column_cnt!=0) return<></>;
               const rowImages_strLst = riskFactorImages_strLst.slice(rowIndex_int,rowIndex_int+column_cnt)
               return (<>
                  <tr key={`row:${rowIndex_int}`}>
                     {rowImages_strLst.map((yearLagsImage_str, colIndex_int)=>(
                        <td key={`cell-${rowIndex_int}-${colIndex_int}`}><img src={yearLagsImage_str} style={style.image}/></td>
                     ))}
                  </tr>
               </>)
            })} */}
      </tbody></table>
   </>);
   const yearLag_dictLst = [
      {
         value: 0,
         label: "1 Year",
         var_filter: 1
      },
      {
         value: 1,
         label: "3 Years",
         var_filter: 3
      },
      {
         value: 2,
         label: "5 Years",
         var_filter: 5
      },
      {
         value: 3,
         label: "10 Years",
         var_filter: 10
      },
   ];
   // TODO: Get this from the DB
   const riskFactors_dictLst = [
      {
         value: 0,
         label: "Alcohol use",
      },
      {
         value: 1,
         label: "Diet high in red meat",
      },
      {
         value: 2,
         label: "Diet high in trans fatty acids",
      },
      {
         value: 3,
         label: "Diet low in polyunsaturated fatty acids",
      },
      {
         value: 4,
         label: "Diet low in seafood omega-3 fatty acids",
      },
      {
         value: 5,
         label: "Diet low in vegetables",
      },
      {
         value: 6,
         label: "Diet low in whole grains",
      },
      {
         value: 7,
         label: "High body-mass index",
      },
      {
         value: 8,
         label: "Low physical activity",
      },
   ];

   const selectedFactor_str = riskFactors_dictLst[selectedRiskFactor_int]['label'];

   const getUriParams = () => {
      const factorFilter_str = `var-riskFactor_filter=${riskFactors_dictLst[selectedRiskFactor_int].label}`;
      const panelId = 6; // Panel for Risk Factor
      return `${factorFilter_str}&panelId=${panelId}`;
   };

   const iFrame_url = `${grafana_url}&${getUriParams()}`;
   // riskFactor_filter
   const riskFactor_html = (<>
      <iframe
         id="embeddedPanel_id"
         className="embed-responsive-item"
         src={iFrame_url}
         width="100%"
         height="600px"
      >
      </iframe>
      {<div>
         {/* {iFrame_url} */}
      </div>}
   </>);
   const selectedYearLag_str = yearLag_dictLst[selectedYearLag_int]['var_filter'];

   const getUriParams2 = () => {
      const panelId = 7;
      let yearLag_str = `var-yearLag_filter=${selectedYearLag_str}`;
      console.log(yearLag_str)
      return `${yearLag_str}&panelId=${panelId}`;
   };
   const iFrame_url2 = `${grafana_url}&${getUriParams2()}`;
   // yearLag_filter
   const yearLag_html = (<>
      <iframe
         id="embeddedPanel_id"
         className="embed-responsive-item"
         src={iFrame_url2}
         width="100%"
         height="600px"
      >
      </iframe>
      {<div>
         {/* {iFrame_url2} */}
      </div>}
   </>);

   const analyses_dictLst = [
      {
         value: 0,
         label: "Select...",
         title: "",
         caption: "",
         html: (<>
            <p>.</p>
            <p>.</p>
            <p>
               In this page you can see the results of a regression analysis showing the impact of exposure to various risk factors on CRC incidence.
               <br />
               <br />
               Please select a type of presentation from the drop-down menu on the left.
               <br />
               <br />
               In the menu on the right hand side you can find details about the data and methodology of the analysis.
               <br />
            </p>
         </>),
      },
      {
         value: 1,
         label: "Per Year Lag",
         caption: "Time interval between Risk Factor exposure and CRC incidence",
         title: (<>
            <p>
               <br></br><ul>
               <li>Year lags refer to the time interval between risk factor exposure and CRC incidence.</li><br />
               <li>Only statistically significant associations between risk factors and CRC incidence are shown. </li><br />
               <li>Higher coefficients indicate a stronger association between risk factor Summary Exposure Value (SEV) and CRC incidence. </li><br />
               </ul>
            </p>
         </>),
         html: yearLag_html,
      },
      {
         value: 2,
         label: "Per Risk Factor",
         title: (<>
            <p>
               <br></br><ul>
              <li> Year lags refer to the time interval between risk factor exposure and CRC incidence.</li><br />
              <li>Only statistically significant associations between risk factors and CRC incidence are shown. </li><br />
              <li> Higher coefficients indicate a stronger association between risk factor Summary Exposure Value (SEV) and CRC incidence. </li><br />
               </ul>
            </p>
         </>),
         caption: "Summary Exposure Value of various CRC Risk Factors",
         html: riskFactor_html,
      },
      // {
      //    value: 3,
      //    label: "Interactive",
      //    title:(<>
      //       <p>
      //          Interactive Chart using Grafana
      //       </p>
      //    </>),
      //    caption: "Interactive Chart using Grafana",
      //    html:interactive_html,
      // },
   ]

   return (<>

      <div className="row">

         {/* Left column */}
         <div className="col-sm-2 mt-2">
             <h6><strong>Select Presentation</strong></h6>
            <p></p>
            <AnalyticsFilter
               selectedAnalysis_int={selectedAnalysis_int}
               set_selectedAnalysis={set_selectedAnalysis}
               analyses_dictLst={analyses_dictLst}
            />

            <br />
            {analyses_dictLst[selectedAnalysis_int]['value'] === 2 && (
               <AnalyticsRiskFactorFilter
                  selectedRiskFactor_int={selectedRiskFactor_int}
                  set_selectedRiskFactors={set_selectedRiskFactors}
                  riskFactors_dictLst={riskFactors_dictLst}
               />
            )}
            {analyses_dictLst[selectedAnalysis_int]['value'] === 1 && (
               <AnalyticsYearLagFilter
                  selectedYearLag_int={selectedYearLag_int}
                  set_selectedYearLag={set_selectedYearLag}
                  YearLag_dictLst={yearLag_dictLst}
               />
            )}
            <p className="text-start">{analyses_dictLst[selectedAnalysis_int]['title']}</p>
         </div>

         {/* Centerpiece*/}
         <div className="col-sm-8 mt-5">
            {/* <h4>{analyses_dictLst[selectedAnalysis_int]['caption']}</h4> */}
            <div></div>
            {/* TODO: auta na eksafanizontai otan to epilegeis */}
            {analyses_dictLst[selectedAnalysis_int]['html']}
            {/* {selectedAnalysis_dict['html']} */}
            {/* {yearLags_html} */}


         </div>

         {/* Right column */}
         <div className="col-sm-2">
            <p>.</p>
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

import React, { useState, useEffect, useRef } from "react";
import Unauthorized from './Unauthorized';
import * as AuthService from "../services/auth.service.tsx";
import { Button, Dropdown } from 'react-bootstrap';
import { Accordion } from 'react-bootstrap';
import AnalyticsFilter from "./AnalyticsFilter.tsx";
import Glossary from "./Glossary.tsx";
import AnalyticsRiskFactorFilter from "./AnalyticsRiskFactorFilter.tsx";
import AnalyticsYearLagFilter from "./AnalyticsYearLagFilter.tsx";
import Comments from "./Comments.tsx";
import { Modal } from 'react-bootstrap';
import SaveGraphButton from "./SaveGraphButton.tsx";
import { useLocation } from "react-router-dom";

const grafana_host = import.meta.env.VITE_GRAFANA_HOST;
const grafana_port = import.meta.env.VITE_GRAFANA_PORT;
const grafana_path = import.meta.env.VITE_GRAFANA_PATH;
const dashboard_name = import.meta.env.VITE_GRAFANA_DASHBOARD;


const grafana_url = `${window.location.protocol}//${grafana_host}:${grafana_port}/${grafana_path}/${dashboard_name}?orgId=1&theme=light`;

const AnalyticsPanel: React.FC = () => {
   const savedParamsRef = useRef<{ analysis: number, riskFactor: string | null, yearLag: number } | null>(null);

   const [isLoggedIn, setIsLoggedIn] = useState(() => AuthService.isLoggedIn());
   const [selectedAnalysis_int, set_selectedAnalysis] = useState(0);
   const [selectedRiskFactor_int, set_selectedRiskFactors] = useState(0);
   const [selectedYearLag_int, set_selectedYearLag] = useState(0);

   const [showModal, setShowModal] = useState(false);
   const [modalContent, setModalContent] = useState<React.ReactNode>(null);
   const [modalTitle, setModalTitle] = useState<string>('');

   const [isBiasModal, setIsBiasModal] = useState(false);
   const [biasContent, setBiasContent] = useState<string[]>([]);
   const [currentPage, setCurrentPage] = useState(0);
   const itemsPerPage = 5;
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
   const location = useLocation();
   const savedIframeUrl = location.state?.iframeUrl;


   useEffect(() => {
      if (!savedIframeUrl) return;

      const url = new URL(savedIframeUrl);
      const params = new URLSearchParams(url.search);

      const analysis = parseInt(params.get("var-analysis_filter") || "0", 10);
      const yearLag = parseInt(params.get("var-yearLag_filter") || "0", 10);
      const riskFactor = params.get("var-riskFactor_filter");

      set_selectedAnalysis(analysis);

      if (analysis === 2 && riskFactor) {
         const index = riskFactors_dictLst.findIndex(item => item.label === riskFactor);
         if (index !== -1) set_selectedRiskFactors(index);
      }

      if (analysis === 1) {
         const yearLagIndex = yearLag_dictLst.findIndex(i => Number(i.var_filter) === yearLag);
         if (yearLagIndex !== -1) set_selectedYearLag(yearLagIndex);
      }
   }, [savedIframeUrl]);


   useEffect(() => {
      if (!savedParamsRef.current) return;

      const { analysis, riskFactor, yearLag } = savedParamsRef.current;

      console.log("Applying saved params:", { analysis, riskFactor, yearLag });

      if (analysis === 2 && riskFactor) {
         const index = riskFactors_dictLst.findIndex(item => item.label === riskFactor);
         console.log("Risk factor index found:", index);
         if (index !== -1) set_selectedRiskFactors(index);
      }

      if (analysis === 1) {
         const yearLagIndex = yearLag_dictLst.findIndex(i => Number(i.var_filter) === yearLag);
         console.log("Year lag index found:", yearLagIndex);
         if (yearLagIndex !== -1) set_selectedYearLag(yearLagIndex);
      }

      savedParamsRef.current = null;
   }, [selectedAnalysis_int]);






   useEffect(() => {
      fetch("/src/assets/bias_assessment.json")
         .then((res) => res.json())
         .then((data) => {
            const alerts = data?.["Alerts Consolidation"]?.["Bias Analysis Alerts"];
            if (Array.isArray(alerts)) {
               setBiasContent(alerts);
            }
         })
         .catch((err) => console.error("Failed to load Bias Analysis Alerts:", err));
   }, []);

   useEffect(
      () => {
         setIsLoggedIn(AuthService.isLoggedIn());
      },
      []
   );
   const paginatedBiasContent = () => {
      const totalPages = Math.ceil(biasContent.length / itemsPerPage);
      const start = currentPage * itemsPerPage;
      const end = start + itemsPerPage;
      const currentItems = biasContent.slice(start, end);

      return (
         <>
            <ul>
               {currentItems.map((item, idx) => (
                  <li key={idx}>{item}</li>
               ))}
            </ul>
            <div className="d-flex justify-content-between align-items-center mt-3">
               <Button
                  variant="primary"
                  onClick={() => setCurrentPage(p => p - 1)}
                  disabled={currentPage === 0}
               >
                  Previous
               </Button>

               <span className="mx-3">
                  Page {currentPage + 1} of {totalPages}
               </span>

               <Button
                  variant="primary"
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={end >= biasContent.length}
               >
                  Next
               </Button>

            </div>
            <div className="mt-3 text-center">Click <a href="/src/assets/Bias_Analysis_Report.pdf" target="_blank">here</a> to download the Bias Analysis Report</div>
         </>
      );
   };

   const handleAccordionModal = (title: string, isBias: boolean) => {
      setModalTitle(title);
      setIsBiasModal(isBias);
      setShowModal(true);
   };
   if (!isLoggedIn)
      return <Unauthorized />;

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
      ...(biasContent.length > 0 ? [{
         title: 'Bias Assessment',
         content: (
            <ul>
               {biasContent.map((item, idx) => (
                  <li key={idx}>{item}</li>
               ))}
            </ul>
         )
      }] : [])
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


   const selectedFactor_str = riskFactors_dictLst[selectedRiskFactor_int]['label'];

   const getUriParams = () => {
      const analysis = selectedAnalysis_int;
      console.log(analysis)

         const riskFactor = riskFactors_dictLst[selectedRiskFactor_int].label;
         return `var-riskFactor_filter=${encodeURIComponent(riskFactor)}&var-analysis_filter=${analysis}&panelId=6`;

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
         <SaveGraphButton iframeUrl={iFrame_url} />
         {/* {iFrame_url} */}
      </div>}
   </>);
   const selectedYearLag_str = yearLag_dictLst[selectedYearLag_int]['var_filter'];

   const getUriParams2 = () => {
      const analysis = selectedAnalysis_int;
      const yearLag = yearLag_dictLst[selectedYearLag_int].var_filter;


      return `var-yearLag_filter=${yearLag}&var-analysis_filter=${analysis}&panelId=7`;
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
         <SaveGraphButton iframeUrl={iFrame_url2} />
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
            {/* <h5>Glossary</h5> */}
            <Accordion defaultActiveKey="-1">
               {accordionContent_dictLst.map((accordionContent_dict, itemIndex_int) => {
                  const isBiasAssessment = accordionContent_dict.title === "Bias Assessment";

                  return (
                     <Accordion.Item
                        eventKey={itemIndex_int.toString()}
                        key={itemIndex_int}
                     >
                        <Accordion.Header
                           onClick={(e) => {
                              if (isBiasAssessment) {
                                 e.preventDefault(); // prevent default expand behavior
                                 handleAccordionModal(
                                    accordionContent_dict.title = "The following biases were detected in the data used for the CRC Predictive Analytics:",
                                    true
                                 );
                              }
                           }}
                        >
                           {accordionContent_dict.title}
                        </Accordion.Header>

                        {/* Only render body for non-Bias Assessment */}
                        {!isBiasAssessment && (
                           <Accordion.Body className="text-start">
                              {accordionContent_dict.content}
                           </Accordion.Body>
                        )}
                     </Accordion.Item>
                  );
               })}
            </Accordion>

            <Comments />
            {/* Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
               <Modal.Header closeButton>
                  <Modal.Title>{modalTitle}</Modal.Title>
               </Modal.Header>
               <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                  {isBiasModal ? paginatedBiasContent() : modalContent}
               </Modal.Body>
            </Modal>
         </div>

      </div>
   </>);
};

export default AnalyticsPanel;

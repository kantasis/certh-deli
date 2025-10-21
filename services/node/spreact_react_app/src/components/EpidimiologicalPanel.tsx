import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service.tsx";
import { Button, Dropdown } from 'react-bootstrap';
import CountryFilter from "./CountryFilter.tsx";
import YearFilter from "./YearFilter.tsx";
import { Accordion } from 'react-bootstrap';
import SexFilter from "./SexFilter.tsx";
import AgeFilter from "./AgeFilter.tsx";
import CrcFactorsFilter from "./CrcFactorsFilter.tsx";
import Comments from "./Comments.tsx";
import { useLocation } from "react-router-dom";
import SaveGraphButton from "./SaveGraphButton.tsx";


const grafana_host = import.meta.env.VITE_GRAFANA_HOST;
const grafana_port = import.meta.env.VITE_GRAFANA_PORT;
const grafana_path = import.meta.env.VITE_GRAFANA_PATH;
const dashboard_name = import.meta.env.VITE_GRAFANA_DASHBOARD;

const panel_id = 1;
const grafana_url = `https://${grafana_host}:${grafana_port}/${grafana_path}/${dashboard_name}?panelId=${panel_id}&orgId=1&theme=light`

// var envs_json = JSON.stringify(import.meta.env, null, 2); // spacing level = 2

const NewDash: React.FC = () => {

   const location = useLocation();
  const savedIframeUrl = location.state?.iframeUrl;

    useEffect(() => {
    if (!savedIframeUrl) return;

    const url = new URL(savedIframeUrl);
    const params = new URLSearchParams(url.search);

    const countryFilters = params.getAll("var-country_filter");
    const minYear = parseInt(params.get("var-minyear_filter") || "0");
    const maxYear = parseInt(params.get("var-maxyear_filter") || "0");
    const sexParam = params.get("var-sex_filter");
    const ageParam = params.get("var-age_filter");
    const factorParam = params.get("var-crcFactor_filter");

    set_selectedCountries(countryFilters);
    set_minYear(minYear);
    set_maxYear(maxYear);
    set_selectedSex(sex_dictLst.findIndex(s => s.var_filter === sexParam));
    set_selectedAge(age_dictLst.findIndex(a => a.var_filter === ageParam));
    set_selectedCrcFactors(crcFactors_dictLst.findIndex(f => f.var_filter === factorParam));
  }, [savedIframeUrl]);

   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [selectedCountries_lst, set_selectedCountries] = useState([
      "Belgium",
      "Greece",
      "Italy",
   ]);
   const [minYear_int, set_minYear] = useState(0);
   const [maxYear_int, set_maxYear] = useState(0);

   const [selectedSex_int, set_selectedSex] = useState(0);
   const [selectedAge_int, set_selectedAge] = useState(0);


   const [selectedCrcFactors_int, set_selectedCrcFactors] = useState(0);

   const sex_dictLst = [
      {
         value: 0,
         label: " Both Sexes",
         var_filter: "Both"
      },
      {
         value: 1,
         label: "Male",
         var_filter: "Male"
      },
      {
         value: 2,
         label: "Female",
         var_filter: "Female"
      },

   ];
   const age_dictLst = [
      {
         value: 0,
         label: "Age Standardized Rate (ASR)",
         var_filter: "Age-standardized"
      },
      {
         value: 1,
         label: "Under 25",
         var_filter: "Under 25"
      },
      {
         value: 2,
         label: "25 to 50",
         var_filter: "25 to 50"
      },
      {
         value: 3,
         label: "Above 50",
         var_filter: "Above 50"
      },

   ];
   const crcFactors_dictLst = [
      {
         value: 0,
         label: "Incidence",
         var_filter: "CRC_incidence_val_Rate"
      },
      {
         value: 1,
         label: "DALYs",
         var_filter: "Colon and rectum cancer_Rate_DALYs_val"
      },
      {
         value: 2,
         label: "YLDs",
         var_filter: "Colon and rectum cancer_Rate_YLDs_val"
      },
      {
         value: 3,
         label: "YLLs",
         var_filter: "Colon and rectum cancer_Rate_YLLs_val"
      },
   ];





   const getUriParams = () => {
      let countryFilter_str = selectedCountries_lst.map((country_str, index) => `var-country_filter=${country_str}`).join('&');
      let yearFilter_str = `var-minyear_filter=${minYear_int}&var-maxyear_filter=${maxYear_int}`;
      let selectedSex_str = sex_dictLst[selectedSex_int]['var_filter'];
      let selectedAge_str = age_dictLst[selectedAge_int]['var_filter'];
      let selectedCrcFactor_str = crcFactors_dictLst[selectedCrcFactors_int]['var_filter'];
      return `${countryFilter_str}&${yearFilter_str}&var-sex_filter=${selectedSex_str}&var-age_filter=${selectedAge_str}&var-crcFactor_filter=${selectedCrcFactor_str}`;
   };
   console.log(selectedSex_int)
   const iFrame_url = `${grafana_url}&${getUriParams()}`;


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
         title: 'Incidence',
         content: (<>
            <p>
               Number of new CRC cases diagnosed per 100,000 population

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
      <div className="row mt-5">

         {/* Left Navbar */}
         <div className="col-sm-2">

            <CountryFilter
               selectedCountries_lst={selectedCountries_lst}
               set_selectedCountries={set_selectedCountries}
            />

            <YearFilter
               minYear_int={minYear_int}
               set_minYear={set_minYear}
               maxYear_int={maxYear_int}
               set_maxYear={set_maxYear}
            />
            <CrcFactorsFilter
               selectedCrcFactor_int={selectedCrcFactors_int}
               set_selectedCrcFactor={set_selectedCrcFactors}
               crcFactor_dictLst={crcFactors_dictLst}
            />
            <SexFilter
               selectedSex_int={selectedSex_int}
               set_selectedSex={set_selectedSex}
               sex_dictLst={sex_dictLst}
            />
            <AgeFilter
               selectedAge_int={selectedAge_int}
               set_selectedAge={set_selectedAge}
               age_dictLst={age_dictLst}
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
            </div>
               <SaveGraphButton iframeUrl={iFrame_url} />
            {/* {<p>{iFrame_url}</p> } */}
         </div>

         {/* Right Navbar */}
         <div className="col-sm-2">
            {/* TODO: use a component for this perhaps? */}
            {/* <h5>Glossary</h5> */}
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
            <Comments />
         </div>

      </div>

      {/* <div>{iFrame_url}</div> */}

   </>);
};

export default NewDash;

import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service.tsx";
import { Button, Dropdown } from 'react-bootstrap';
import CountryFilter from "./CountryFilter.tsx";
import YearFilter from "./YearFilter.tsx";
import { Accordion } from 'react-bootstrap';
import SexFilter from "./SexFilter.tsx";
import AgeFilter from "./AgeFilter.tsx";


const grafana_host = import.meta.env.VITE_GRAFANA_HOST;
const grafana_port = import.meta.env.VITE_GRAFANA_PORT;
const grafana_path = import.meta.env.VITE_GRAFANA_PATH;
const dashboard_name = import.meta.env.VITE_GRAFANA_DASHBOARD;

const panel_id = 1;
const grafana_url = `http://${grafana_host}:${grafana_port}/${grafana_path}/${dashboard_name}?panelId=${panel_id}&orgId=1&theme=light`

// var envs_json = JSON.stringify(import.meta.env, null, 2); // spacing level = 2

const NewDash: React.FC = () => {

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
   const getUriParams = () => {
      let countryFilter_str = selectedCountries_lst.map((country_str, index) => `var-country_filter=${country_str}`).join('&');
      let yearFilter_str = `var-minyear_filter=${minYear_int}&var-maxyear_filter=${maxYear_int}`;
      let selectedSex_str = sex_dictLst[selectedSex_int]['var_filter'];
      let selectedAge_str = age_dictLst[selectedAge_int]['var_filter'];
      return `${countryFilter_str}&${yearFilter_str}&var-sex_filter=${selectedSex_str}&var-age_filter=${selectedAge_str}`;
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
   ];


   return (<>
      <div className="row">

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
            {/* {<p>{iFrame_url}</p> } */}
         </div>

         {/* Right Navbar */}
         <div className="col-sm-2">
            {/* TODO: use a component for this perhaps? */}
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

      {/* <div>{iFrame_url}</div> */}

   </>);
};

export default NewDash;

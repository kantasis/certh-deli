import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service.tsx";
import { Button, Dropdown } from 'react-bootstrap';
import SpainRegionsFilter from "./SpainRegionsFilter.tsx";
import YearFilter from "./YearFilter.tsx";
import { Accordion } from 'react-bootstrap';
import SexFilter from "./SexFilter.tsx";
import AgeGroupFilter from "./AgeGroups.tsx";


const grafana_host = import.meta.env.VITE_GRAFANA_HOST;
const grafana_port = import.meta.env.VITE_GRAFANA_PORT;
const grafana_path = import.meta.env.VITE_GRAFANA_PATH;
const dashboard_name = import.meta.env.VITE_GRAFANA_DASHBOARD;

const panel_id = 11;
const grafana_url = `http://${grafana_host}:${grafana_port}/${grafana_path}/${dashboard_name}?panelId=${panel_id}&orgId=1&theme=light`

// var envs_json = JSON.stringify(import.meta.env, null, 2); // spacing level = 2

const CrcIncidenceDataPanel: React.FC = () => {

   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [selectedRegions_lst, set_selectedRegions] = useState([
      'Andalucia', 'Asturias', 'Aragon', 
   ]);
   const [minYear_int, set_minYear] = useState(2012);
   const [maxYear_int, set_maxYear] = useState(2023);

   const [selectedSex_int, set_selectedSex] = useState(0);
   const [selectedAgeGroup_int, set_selectedAgeGroup] = useState(0);

   const sex_dictLst = [
    //   {
    //      value: 0,
    //      label: " Both Sexes",
    //      var_filter: "Both"
    //   },
      {
         value: 0,
         label: "Male",
         var_filter: "Male"
      },
      {
         value: 1,
         label: "Female",
         var_filter: "Female"
      },

   ];
   const ageGroup_dictLst = [
      {
         value: 0,
         label: "Age Group (45-49)",
         var_filter: "45-49"
      },
      {
        value: 1,
        label: "Age Group (60-64)",
        var_filter: "60-64"
     },
     

   ];
   const getUriParams = () => {
      let regionFilter_str = selectedRegions_lst.map((region_str, index) => `var-region_filter=${region_str}`).join('&');
      let yearFilter_str = `var-minyear_filter=${minYear_int}&var-maxyear_filter=${maxYear_int}`;
      let selectedSex_str = sex_dictLst[selectedSex_int]['var_filter'];
      let selectedAgeGroup_str = ageGroup_dictLst[selectedAgeGroup_int]['var_filter'];
      return `${regionFilter_str}&${yearFilter_str}&var-sex_filter=${selectedSex_str}&var-ageGroup_filter=${selectedAgeGroup_str}`;
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
            This data are very useful for the exchange of experts included in LIT-03, in order to illustrate the limited quality of the information available for decision making.
               
            </p>
         </>)
      },
   ];

   return (<>
      <div className="row">

         {/* Left Navbar */}
         <div className="col-sm-2">

            <SpainRegionsFilter
               selectedRegions_lst={selectedRegions_lst}
               set_selectedRegions={set_selectedRegions}
               showSpain={false} 
            />

            <YearFilter
               minYear_int={minYear_int}
               set_minYear={set_minYear}
               maxYear_int={maxYear_int}
               set_maxYear={set_maxYear}
               floorYear_int={2012}  // Custom range for this panel
                ceilYear_int={2023}
            />

            <SexFilter
               selectedSex_int={selectedSex_int}
               set_selectedSex={set_selectedSex}
               sex_dictLst={sex_dictLst}
            />
            <AgeGroupFilter
               selectedAgeGroup_int={selectedAgeGroup_int}
               set_selectedAgeGroup={set_selectedAgeGroup}
               ageGroup_dictLst={ageGroup_dictLst}
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

export default CrcIncidenceDataPanel;

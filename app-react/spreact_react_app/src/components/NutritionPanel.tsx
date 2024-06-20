import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service.tsx";
import { Button, Dropdown } from 'react-bootstrap'; 
import CountryFilter from "./CountryFilter.tsx";
import YearFilter from "./YearFilter.tsx";
// import Multiselect from 'react-bootstrap-multiselect';


const grafana_host = import.meta.env.VITE_GRAFANA_HOST;
const grafana_port = import.meta.env.VITE_GRAFANA_PORT;
const grafana_path = import.meta.env.VITE_GRAFANA_PATH;
const dashboard_name = import.meta.env.VITE_GRAFANA_DASHBOARD;
const panel_id = 2;
const grafana_url = `http://${grafana_host}:${grafana_port}/${grafana_path}/${dashboard_name}?panelId=${panel_id}&orgId=1&theme=light`

// var envs_json = JSON.stringify(import.meta.env, null, 2); // spacing level = 2

const NewDash: React.FC = () => {

   const countries_strLst = [
      "Greece",
      "Romania",
      "Lithuania",
      "Belgium",
      "Italy",
      "Spain"
   ];

   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [selectedCountries_lst, set_selectedCountries] = useState([countries_strLst[0]]);
   const [iFrameUrl_str, setIFrameUrl] = useState('');
   const [minYear_int, set_minYear] = useState(1990);
   const [maxYear_int, set_maxYear] = useState(2020);

   const getUriParams = () => {
      let countryFilter_str = selectedCountries_lst.map( (country_str, index) => `var-country_filter=${country_str}`).join('&');
      let yearFilter_str = `var-minyear_filter=${minYear_int}&var-maxyear_filter=${maxYear_int}`;
      return `${countryFilter_str}&${yearFilter_str}`;
   };

   useEffect(
      () => {
         setIsLoggedIn(AuthService.isLoggedIn());
         setIFrameUrl(`${grafana_url}&${getUriParams()}`);
      },
      []
   );

   if (!isLoggedIn)
      return <h2>Unauthorized</h2>;

   return (<>
      <div className="row">

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

      </div>
      
      <Button
         onClick={ () => setIFrameUrl(`${grafana_url}&${getUriParams()}`) }
      >
         Update Panel
      </Button>

      <div className="embed-responsive embed-responsive-16by9">
         <iframe 
            id="embeddedPanel_id"
            className="embed-responsive-item"
            src={iFrameUrl_str}
            width="100%"
            height="600px"
         >
         </iframe>
      </div>

   </>);
};

export default NewDash;

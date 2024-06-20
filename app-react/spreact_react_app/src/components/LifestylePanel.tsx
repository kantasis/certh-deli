import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service.tsx";
import { Button, Dropdown } from 'react-bootstrap'; 
import CountryFilter from "./CountryFilter.tsx";
import YearFilter from "./YearFilter.tsx";
import FactorFilter from "./FactorFilter.tsx";
// import Multiselect from 'react-bootstrap-multiselect';


const grafana_host = import.meta.env.VITE_GRAFANA_HOST;
const grafana_port = import.meta.env.VITE_GRAFANA_PORT;
// const grafana_path = import.meta.env.VITE_GRAFANA_PATH;
const grafana_path = "d-solo/adpbvtgvi2k1sf";

const dashboard_name = import.meta.env.VITE_GRAFANA_DASHBOARD;
const panel_id = 3;
const grafana_url = `http://${grafana_host}:${grafana_port}/${grafana_path}/${dashboard_name}?panelId=${panel_id}&orgId=1&theme=light`

// var envs_json = JSON.stringify(import.meta.env, null, 2); // spacing level = 2

const NewDash: React.FC = () => {

   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [selectedCountries_lst, set_selectedCountries] = useState([]);
   const [selectedFactor_str, set_selectedFactor] = useState('');
   const [iFrameUrl_str, setIFrameUrl] = useState('');
   const [minYear_int, set_minYear] = useState(1990);
   const [maxYear_int, set_maxYear] = useState(2020);

   const getUriParams = () => {
      let countryFilter_str = selectedCountries_lst.map( (country_str, index) => `var-country_filter=${country_str}`).join('&');
      let yearFilter_str = `var-minyear_filter=${minYear_int}&var-maxyear_filter=${maxYear_int}`;
      let factorFilter_str = `var-factor_filter=${selectedFactor_str}`;
      return `${countryFilter_str}&${yearFilter_str}&${factorFilter_str}`;
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

      {/* Filters */}
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

         <FactorFilter
            selectedFactor_str={selectedFactor_str}
            set_selectedFactor={set_selectedFactor}
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
         <div>{iFrameUrl_str}</div>
         <div>{selectedCountries_lst}</div>
      </div>

   </>);
};

export default NewDash;

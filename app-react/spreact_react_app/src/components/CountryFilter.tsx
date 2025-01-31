import React, { useState, useEffect } from "react";
import { Form } from 'react-bootstrap';

// Interface for the properties of this component
interface FilterProps {
   // Lifted up State
   selectedCountries_lst: string[],
   set_selectedCountries: Function,
}


const CountryFilter: React.FC<FilterProps> = ({ selectedCountries_lst, set_selectedCountries }) => {

   const countries_strLst = [
      "Greece",
      "Romania",
      "Lithuania",
      "Belgium",
      "Italy",
      "Spain",
      "Andorra",
      "Cyprus",
      "Turkey",
      "Switzerland",
      "Hungary",
      "Luxembourg",
      "Sweden",
      "Norway",
      "Belarus",
      "United Kingdom",
      "Russian Federation",
      "Netherlands",
      "Montenegro",
      "Austria",
      "Ireland",
      "Germany",
      "Serbia",
      "Portugal",
      "Finland",
      "Malta",
      "Albania",
      "Ukraine",
      "Bulgaria",
      "Croatia",
      "Latvia",
      "England",
      "Slovenia",
      "North Macedonia",
      "France",
      "Estonia",
      "Slovakia",
      "Monaco",
      "Israel",
      "Poland",
      "Iceland",
      "Republic of Moldova",
      "Denmark",
      "Bosnia and Herzegovina",
      "Czechia"
   ];

   useEffect(
      () => {
         if (selectedCountries_lst.length == 0)
            set_selectedCountries([countries_strLst[0]]);
      },
      []
   );


   const toggleCountry_cbk = (selection_str: string) => {
      console.log("GK> -------");
      console.log("GK> List: " + selectedCountries_lst);

      if (selectedCountries_lst.includes(selection_str)) {
         console.log("GK> removing: " + selection_str);
         set_selectedCountries(
            selectedCountries_lst.filter(
               (item) => item !== selection_str
            )
         );
      } else {
         console.log("GK> adding: " + selection_str);
         set_selectedCountries([...selectedCountries_lst, selection_str]);
      }

      console.log("GK> List: " + selectedCountries_lst);
   }

   return (<>
      <div className="col-lg">
         <label
            className="form-label"
            htmlFor="countrySelect_id"
         >
            Select Countries
         </label>
         <Form id="countrySelect_id">
            <Form.Control
               as="select"
               multiple
               value={selectedCountries_lst}
               onChange={(e) => toggleCountry_cbk(e.target.value)}
            >
               {countries_strLst.map((country_str, index) => (
                  <option key={index} value={country_str}>
                     {country_str}
                  </option>
               ))}
            </Form.Control>
         </Form>

      </div>
   </>);
};


export default CountryFilter;

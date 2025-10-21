import { Routes, Route, Link } from "react-router-dom";
import React, { useState, useEffect } from "react";

// Interface for the properties of this component
interface FilterProps {
   // Lifted up State
   filter_startYear_int: number,
   setFilter_startYear_int: Function,
   filter_country_str: string,
   setFilter_country_str: Function,
}

const FilterPanel: React.FC<FilterProps> = ({filter_startYear_int, setFilter_startYear_int, filter_country_str, setFilter_country_str}) => {

   const countries_strLst = [
      "Greece",
      "Romania",
      "Lithuania",
      "Belgium",
      "Italy",
      "Spain"
   ];
   
   const countries_jsx = countries_strLst.map( (country_str, index) => (
      <option key={"country"+index} value={country_str} >{country_str}</option>
   ));

   const changeCountry = (event: React.FormEvent<HTMLSelectElement>) => {
      setFilter_country_str(event.currentTarget.value)
      console.log(filter_country_str)
   };
   return (<>
   
      <div className="row">
         
         {/* Range Filter */}
         <div className="col-sm">
            <label htmlFor="startYear_id" className="form-label">Start Year</label>
            <input 
               className="form-range" 
               id="startYear_id"
               type="range"
               min="1990"
               max="2022"
               value={filter_startYear_int}
               onChange={(e: React.FormEvent<HTMLInputElement>) => setFilter_startYear_int(e.currentTarget.value)}
            />
         </div>

         {/* Country Filter */}
         <div className="col-lg">
            <label htmlFor="customRange1 customRange2" className="form-label">Select Coutnries</label>
            <select 
               multiple 
               className="form-select" 
               aria-label="multiple select example"
               onChange={e => changeCountry(e)}
            >
               {countries_jsx}
            </select>
         </div>
         
         {/* Limit Filter */}
         <div className="col-sm">
            <label 
               className="form-label" 
               htmlFor="typeNumber"
            >
               Limit Results
            </label>
            <input 
               // value={grafanaVar_int}
               type="number" 
               id="typeNumber" 
               className="form-control" 
               // onChange={(event) => input_handler(event) }
            />
         </div>
      </div>
   </>);
};


export default FilterPanel;

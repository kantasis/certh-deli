import React, { useState, useEffect } from "react";
import { Form } from 'react-bootstrap';

// Interface for the properties of this component
interface FilterProps {
   // Lifted up States
   minYear_int: number,
   set_minYear: Function,
   maxYear_int: number,
   set_maxYear: Function,
}
 
const YearFilter: React.FC<FilterProps> = ({minYear_int, set_minYear, maxYear_int, set_maxYear}) => {

   const floorYear_int = 1990;
   const ceilYear_int = 2019;

   useEffect(
      () => {
         set_minYear(floorYear_int);
         set_maxYear(ceilYear_int);
      },
      []
   );

   return (<>
      <div className="col-lg">
         <div className="row">
            <div className="col-lg">
               <label 
                  className="form-label"
                  htmlFor="countrySelect_id" 
               >
                  <strong>Select Min Year: </strong> <span style={{color:'green', fontWeight: '600'}}>{minYear_int}</span>
               </label>
               <input 
                  id="customRange1"
                  className="form-range" 
                  type="range" 
                  min={floorYear_int}
                  max={ceilYear_int}
                  value={minYear_int}
                  onChange={ (e) => set_minYear(Math.min(maxYear_int, +e.target.value))}
               />
            </div>
         </div>
         <div className="row">
            <div className="col-lg">
               <label 
                  className="form-label"
                  htmlFor="countrySelect_id" 
               >
                 <strong>  Select Max Year: </strong> <span style={{color:'green', fontWeight: '600'}}>{maxYear_int}</span>
               </label>
               <input 
                  id="customRange1"
                  className="form-range" 
                  type="range" 
                  min={floorYear_int}
                  max={ceilYear_int}
                  value={maxYear_int}
                  onChange={ (e) => set_maxYear(Math.max(minYear_int, +e.target.value))}
               />
            </div>
         </div>
      </div>
   </>);
};


export default YearFilter;

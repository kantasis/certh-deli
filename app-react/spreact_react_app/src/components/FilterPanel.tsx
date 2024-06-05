import { Routes, Route, Link } from "react-router-dom";
import React, { useState, useEffect } from "react";

const FilterPanel: React.FC = () => {

   return (<>
   
      <div className="row">
         
         <div className="col-sm">
            <label htmlFor="customRange1 customRange2" className="form-label">Date Range</label>
            <input type="range" className="form-range" min="2000" max="2024" step="1" id="customRange1"/>
            <input type="range" className="form-range" min="2000" max="2024" step="1" id="customRange2"/>
         </div>
         <div className="col-lg">
            <label htmlFor="customRange1 customRange2" className="form-label">Select Coutnries</label>
            <select multiple className="form-select" aria-label="multiple select example">

               <option value="php">PHP</option>
               <option value="javascript">JavaScript</option>
               <option value="java">Java</option>
               <option value="sql">SQL</option>
               <option value="jquery">Jquery</option>
               <option value=".net">.Net</option>
            </select>

         </div>
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

import React, { useState, useEffect } from "react";
import { Form } from 'react-bootstrap';

// Interface for the properties of this component
interface FilterProps {
   // Lifted up State
   selectedRiskFactor_int: number,
   set_selectedRiskFactors: Function,
   riskFactors_dictLst: Array<any>,
}

const AnalyticsRiskFactorFilter: React.FC<FilterProps> = ({selectedRiskFactor_int, set_selectedRiskFactors, riskFactors_dictLst}) => {

   useEffect(
      () => {
         // let temp = riskFactors_dictLst[0]['value'];
         // set_selectedRiskFactors(temp);
      },
      []
   );

   return (<>
         <label 
            className="form-label"
            htmlFor="factorSelect_id" 
         >
            <h6>Select Risk Factor</h6>
         </label>
         <Form id="factorSelect_id">
            <Form.Control 
               as="select" 
               value={selectedRiskFactor_int} 
               onChange={(e) => {
                  set_selectedRiskFactors(
                     e.target.value
                  )
               }}
            >
               {riskFactors_dictLst.map((riskFactor_dict, index) => (
                  <option 
                     key={index} 
                     value={riskFactor_dict['value']}
                     data-toggle="tooltip"
                     data-placement="right"
                     title={riskFactor_dict['label']}
                     // onClick={()=>( set_selectedRiskFactors(riskFactor_dict) )}
                  >
                     {riskFactor_dict['label']}
                  </option>
               ))}
            </Form.Control>
      </Form>
      </>);
};


export default AnalyticsRiskFactorFilter;

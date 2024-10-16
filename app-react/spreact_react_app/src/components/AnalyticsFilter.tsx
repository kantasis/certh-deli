import React, { useState, useEffect } from "react";
import { Form } from 'react-bootstrap';

// Interface for the properties of this component
interface FilterProps {
   // Lifted up State
   selectedFactor_int: number,
   set_selectedFactor: Function,
   factors_dictLst: Array<any>,
}

 
const AnalyticsFilter: React.FC<FilterProps> = ({selectedFactor_int, set_selectedFactor, factors_dictLst}) => {

   useEffect(
      () => {
         let temp = factors_dictLst[0]['value'];
         console.log(`Setting: ${temp}`);
         set_selectedFactor(temp);
      },
      []
   );

   return (<>
      <div className="col-lg">
         <label 
            className="form-label"
            htmlFor="factorSelect_id" 
         >
            Select Analysis
         </label>
         <Form id="factorSelect_id">
            <Form.Control 
               as="select" 
               value={selectedFactor_int} 
               onChange={(e) => set_selectedFactor(e.target.value)}
            >
               {factors_dictLst.map((factor_dict, index) => (
                  <option key={index} value={factor_dict['value']}>
                     {factor_dict['label']}
                  </option>
               ))}
            </Form.Control>
      </Form>
      {/* {selectedFactor_int} */}
      </div>
   </>);
};


export default AnalyticsFilter;

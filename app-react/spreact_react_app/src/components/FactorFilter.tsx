import React, { useState, useEffect } from "react";
import { Form } from 'react-bootstrap';

// Interface for the properties of this component
interface FilterProps {
   // Lifted up State
   selectedFactor_str: string,
   set_selectedFactor: Function,
}

 
const FactorFilter: React.FC<FilterProps> = ({selectedFactor_str, set_selectedFactor}) => {

   const factors_dictLst = [
      {
         label: "SEV",
         value: "_Rate_SEV_val"
      },
      {
         label: "DALYs",
         value: "_Rate_DALYs_val"
      },
      {
         label: "Deaths",
         value: "_Rate_Deaths_val"
      },
      {
         label: "YLDs",
         value: "_Rate_YLDs_val"
      },
      {
         label: "YLLs",
         value: "_Rate_YLLs_val"
      },
   ];

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
            Select Coutnries
         </label>
         <Form id="factorSelect_id">
            <Form.Control 
               as="select" 
               value={selectedFactor_str} 
               onChange={(e) => set_selectedFactor(e.target.value)}
            >
               {factors_dictLst.map((factor_dict, index) => (
                  <option key={index} value={factor_dict['value']}>
                     {factor_dict['label']}
                  </option>
               ))}
            </Form.Control>
      </Form>
      {selectedFactor_str}
      </div>
   </>);
};


export default FactorFilter;

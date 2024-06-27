import React, { useState, useEffect } from "react";
import { Form } from 'react-bootstrap';

// Interface for the properties of this component
interface FilterProps {
   // Lifted up State
   selectedPolicy_str: string,
   set_selectedPolicy: Function,
}

 
const PolicyFilter: React.FC<FilterProps> = ({selectedPolicy_str, set_selectedPolicy}) => {

   const policies_dictLst = [
      {
         label: "Physical Activity",
         value: "Physical Activity"
      },
      {
         label: "Smoking",
         value: "Smoking"
      },
      {
         label: "Environment",
         value: "Environment"
      },
      {
         label: "Alcohol Usage",
         value: "Alcohol"
      },
      {
         label: "Nutrition",
         value: "Nutrition"
      },
      {
         label: "Health Literacy",
         value: "Health Literacy"
      },
      {
         label: "Health Promotion",
         value: "Health Promotion"
      },
      {
         label: "Health Education",
         value: "Health Education"
      },
   ];

   useEffect(
      () => {
         let temp = policies_dictLst[0]['value'];
         console.log(`Setting: ${temp}`);
         set_selectedPolicy(temp);
      },
      []
   );

   return (<>
      <div className="col-sm">
         <label 
            className="form-label"
            htmlFor="policySelect_id" 
         >
            Select Policy
         </label>
         <Form id="policySelect_id">
            <Form.Control 
               as="select" 
               value={selectedPolicy_str} 
               onChange={(e) => set_selectedPolicy(e.target.value)}
            >
               {policies_dictLst.map((policy_dict, index) => (
                  <option key={index} value={policy_dict['value']}>
                     {policy_dict['label']}
                  </option>
               ))}
            </Form.Control>
      </Form>
      {/* {selectedPolicy_str} */}
      </div>
   </>);
};


export default PolicyFilter;

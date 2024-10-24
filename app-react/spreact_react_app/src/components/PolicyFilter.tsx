import React, { useState, useEffect } from "react";
import { Form } from 'react-bootstrap';

// Interface for the properties of this component
interface FilterProps {
   // Lifted up State
   selectedPolicy_str: string,
   set_selectedPolicy: Function,
}

 
const PolicyFilter: React.FC<FilterProps> = ({selectedPolicy_str, set_selectedPolicy}) => {

   // TODO: Fix the trailing spaces from the database
   const policies_strLst = [
      "Alcohol Consumption",
      "Diabetes",
      "Environmental Factors ", // YES with the trailing space
      "Governance",
      "Health Education",
      "Health Literacy",
      "Health Promotion",
      "Mental Health",
      "Nutrition",
      "Occupational Risk Factors ",
      "Personalized Medicine",
      "Physical Activity",
      "Psychotropic Substances",
      "R&D",
      "Smoking",
      "Vaccinations & Communicable Di ",
   ];

   useEffect(
      () => {
         let temp = policies_strLst[0];
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
            Select Policy Domain
         </label>
         <Form id="policySelect_id">
            <Form.Control 
               as="select" 
               value={selectedPolicy_str} 
               onChange={(e) => set_selectedPolicy(e.target.value)}
            >
               {policies_strLst.map((policy_str, index) => (
                  <option key={index} value={policy_str}>
                     {policy_str}
                  </option>
               ))}
            </Form.Control>
      </Form>
      {/* {selectedPolicy_str} */}
      </div>
   </>);
};


export default PolicyFilter;

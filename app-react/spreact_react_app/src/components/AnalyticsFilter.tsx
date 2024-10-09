import React, { useState, useEffect } from "react";
import { Form } from 'react-bootstrap';

// Interface for the properties of this component
interface FilterProps {
   // Lifted up State
   selectedFactor_str: string,
   set_selectedFactor: Function,
}

 
const AnalyticsFilter: React.FC<FilterProps> = ({selectedFactor_str, set_selectedFactor}) => {

   const factors_dictLst = [
      {
         label: "01",
         value: "01.png"
      },
      {
         label: "02",
         value: "02.png"
      },
      {
         label: "03",
         value: "03.png"
      },
      {
         label: "04",
         value: "04.png"
      },
      {
         label: "05",
         value: "05.png"
      },
      {
         label: "06",
         value: "06.png"
      },
      {
         label: "07",
         value: "07.png"
      },
      {
         label: "08",
         value: "08.png"
      },
      {
         label: "09",
         value: "09.png"
      },
      {
         label: "10",
         value: "10.png"
      },
      {
         label: "11",
         value: "11.png"
      },
      {
         label: "13",
         value: "13.png"
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
            Select Analysis
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
      {/* {selectedFactor_str} */}
      </div>
   </>);
};


export default AnalyticsFilter;

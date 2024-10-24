import React, { useState, useEffect } from "react";
import { Form } from 'react-bootstrap';

// Interface for the properties of this component
interface FilterProps {
   // Lifted up State
   selectedAnalysis_int: number,
   set_selectedAnalysis: Function,
   analyses_dictLst: Array<any>,
}

 
const AnalyticsFilter: React.FC<FilterProps> = ({selectedAnalysis_int, set_selectedAnalysis, analyses_dictLst}) => {

   useEffect(
      () => {
         // let temp = analyses_dictLst[0]['value'];
         // set_selectedAnalysis(temp);
      },
      []
   );

   return (<>
         <label 
            className="form-label"
            htmlFor="factorSelect_id" 
         >
            <h6>Select Presentation</h6>
         </label>
         <Form id="factorSelect_id">
            <Form.Control 
               as="select" 
               value={selectedAnalysis_int} 
               onChange={(e) => {
                  set_selectedAnalysis(
                     e.target.value
                  )
               }}
            >
               {analyses_dictLst.map((analysis_dict, index) => (
                  <option 
                     key={index} 
                     value={analysis_dict['value']}
                     data-toggle="tooltip"
                     data-placement="right"
                     title={analysis_dict['caption']}
                     // onClick={()=>( set_selectedAnalysis(analysis_dict) )}
                  >
                     {analysis_dict['label']}
                  </option>
               ))}
            </Form.Control>
      </Form>
      </>);
};


export default AnalyticsFilter;

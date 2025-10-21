import React, { useState, useEffect } from "react";
import { Form } from 'react-bootstrap';

// Interface for the properties of this component
interface FilterProps {
    // Lifted up State
    selectedCrcFactor_int: number,
    set_selectedCrcFactor: Function,
    crcFactor_dictLst: Array<any>,
}

const CrCFactorsFilter: React.FC<FilterProps> = ({ selectedCrcFactor_int, set_selectedCrcFactor, crcFactor_dictLst }) => {

    useEffect(
        () => {
          
        },
        []
    );

    return (<>
        <label
            className="form-label"
            htmlFor="crcFactorSelect_id"
        >
            <h6><strong>Select Measure </strong></h6>
        </label>
        <Form id="crcFactorSelect_id">
            <Form.Control
                as="select"
                value={selectedCrcFactor_int}
                onChange={(e) => {
                    set_selectedCrcFactor(
                        e.target.value
                    )
                }}
            >
                {crcFactor_dictLst.map(( crcFactor_dict, index) => (
                    <option
                        key={index}
                        value={ crcFactor_dict['value']}
                        data-toggle="tooltip"
                        data-placement="right"
                        title={ crcFactor_dict['label']}
                    // onClick={()=>( set_selectedYearLag(yearLag_dict) )}
                    >
                        {crcFactor_dict['label']}
                    </option>
                ))}
            </Form.Control>
        </Form>
    </>);
};


export default CrCFactorsFilter;

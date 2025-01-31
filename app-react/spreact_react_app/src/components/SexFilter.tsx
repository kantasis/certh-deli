import React, { useState, useEffect } from "react";
import { Form } from 'react-bootstrap';

// Interface for the properties of this component
interface FilterProps {
    // Lifted up State
    selectedSex_int: number,
    set_selectedSex: Function,
    sex_dictLst: Array<any>,
}

const SexFilter: React.FC<FilterProps> = ({ selectedSex_int, set_selectedSex, sex_dictLst }) => {

    useEffect(
        () => {
          
        },
        []
    );

    return (<>
        <label
            className="form-label"
            htmlFor="sexSelect_id"
        >
            <h6>Select Sex</h6>
        </label>
        <Form id="sexSelect_id">
            <Form.Control
                as="select"
                value={selectedSex_int}
                onChange={(e) => {
                    set_selectedSex(
                        e.target.value
                    )
                }}
            >
                {sex_dictLst.map((sex_dict, index) => (
                    <option
                        key={index}
                        value={sex_dict['value']}
                        data-toggle="tooltip"
                        data-placement="right"
                        title={sex_dict['label']}
                    // onClick={()=>( set_selectedYearLag(yearLag_dict) )}
                    >
                        {sex_dict['label']}
                    </option>
                ))}
            </Form.Control>
        </Form>
    </>);
};


export default SexFilter;

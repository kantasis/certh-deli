import React, { useState, useEffect } from "react";
import { Form } from 'react-bootstrap';

// Interface for the properties of this component
interface FilterProps {
    // Lifted up State
    selectedAge_int: number,
    set_selectedAge: Function,
    age_dictLst: Array<any>,
}

const AgeFilter: React.FC<FilterProps> = ({ selectedAge_int, set_selectedAge, age_dictLst }) => {

    useEffect(
        () => {
          
        },
        []
    );

    return (<>
        <label
            className="form-label"
            htmlFor="ageSelect_id"
        >
            <h6>Select Age</h6>
        </label>
        <Form id="ageSelect_id">
            <Form.Control
                as="select"
                value={selectedAge_int}
                onChange={(e) => {
                    set_selectedAge(
                        e.target.value
                    )
                }}
            >
                {age_dictLst.map((age_dict, index) => (
                    <option
                        key={index}
                        value={age_dict['value']}
                        data-toggle="tooltip"
                        data-placement="right"
                        title={age_dict['label']}
                    // onClick={()=>( set_selectedYearLag(yearLag_dict) )}
                    >
                        {age_dict['label']}
                    </option>
                ))}
            </Form.Control>
        </Form>
    </>);
};


export default AgeFilter;

import React, { useState, useEffect } from "react";
import { Form } from 'react-bootstrap';

// Interface for the properties of this component
interface FilterProps {
    // Lifted up State
    selectedAgeGroup_int: number,
    set_selectedAgeGroup: Function,
    ageGroup_dictLst: Array<any>,
}

const AgeGroupFilter: React.FC<FilterProps> = ({ selectedAgeGroup_int, set_selectedAgeGroup, ageGroup_dictLst }) => {

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
            <h6><strong>Select Age Group </strong></h6>
        </label>
        <Form id="ageSelect_id">
            <Form.Control
                as="select"
                value={selectedAgeGroup_int}
                onChange={(e) => {
                    set_selectedAgeGroup(
                        e.target.value
                    )
                }}
            >
                {ageGroup_dictLst.map((ageGroup_dict, index) => (
                    <option
                        key={index}
                        value={ageGroup_dict['value']}
                        data-toggle="tooltip"
                        data-placement="right"
                        title={ageGroup_dict['label']}
                    // onClick={()=>( set_selectedYearLag(yearLag_dict) )}
                    >
                        {ageGroup_dict['label']}
                    </option>
                ))}
            </Form.Control>
        </Form>
    </>);
};


export default AgeGroupFilter;

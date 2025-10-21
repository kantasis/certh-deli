import React, { useState, useEffect } from "react";
import { Form } from 'react-bootstrap';

// Interface for the properties of this component
interface FilterProps {
    // Lifted up State
    selectedYearLag_int: number,
    set_selectedYearLag: Function,
    YearLag_dictLst: Array<any>,
}

const AnalyticsYearLagFilter: React.FC<FilterProps> = ({ selectedYearLag_int, set_selectedYearLag, YearLag_dictLst }) => {

    useEffect(
        () => {
            // let temp = YearLag_dictLst[0]['value'];
            // set_selectedYearLag(temp);
        },
        []
    );

    return (<>
        <label
            className="form-label"
            htmlFor="yearSelect_id"
        >
            <h6><strong>Select Year Lag</strong></h6>
        </label>
        <Form id="yearSelect_id">
            <Form.Control
                as="select"
                value={selectedYearLag_int}
                onChange={(e) => {
                    set_selectedYearLag(
                        e.target.value
                    )
                }}
            >
                {YearLag_dictLst.map((yearLag_dict, index) => (
                    <option
                        key={index}
                        value={yearLag_dict['value']}
                        data-toggle="tooltip"
                        data-placement="right"
                        title={yearLag_dict['label']}
                    // onClick={()=>( set_selectedYearLag(yearLag_dict) )}
                    >
                        {yearLag_dict['label']}
                    </option>
                ))}
            </Form.Control>
        </Form>
    </>);
};


export default AnalyticsYearLagFilter;

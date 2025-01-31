import React, { useState, useEffect } from "react";
import { Form } from 'react-bootstrap';

// Interface for the properties of this component
interface FilterProps {
    // Lifted up State
    selectedRiskFactorExposure_int: number,
    set_selectedRiskFactorExposure: Function,
    riskFactorExposure_dictLst: Array<any>,
}

const RiskFactorExposureFilter: React.FC<FilterProps> = ({ selectedRiskFactorExposure_int, set_selectedRiskFactorExposure, riskFactorExposure_dictLst }) => {

    useEffect(
        () => {
          
        },
        []
    );

    return (<>
        <label
            className="form-label"
            htmlFor="riskFactorExposureSelect_id"
        >
            <h6>Select Risk Factor</h6>
        </label>
        <Form id="riskFactorSelect_id">
            <Form.Control
                as="select"
                value={selectedRiskFactorExposure_int}
                onChange={(e) => {
                    set_selectedRiskFactorExposure(
                        e.target.value
                    )
                }}
            >
                {riskFactorExposure_dictLst.map((riskFactorExposure_dict, index) => (
                    <option
                        key={index}
                        value={riskFactorExposure_dict['value']}
                        data-toggle="tooltip"
                        data-placement="right"
                        title={riskFactorExposure_dict['label']}
                    // onClick={()=>( set_selectedYearLag(yearLag_dict) )}
                    >
                        {riskFactorExposure_dict['label']}
                    </option>
                ))}
            </Form.Control>
        </Form>
    </>);
};


export default RiskFactorExposureFilter;

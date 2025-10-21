import React, { useState, useEffect } from "react";
import { Form } from 'react-bootstrap';

// Interface for the properties of this component
interface FilterProps {
    // Lifted up State
    selectedRiskFactorSpainRegion_int: string,
    set_selectedRiskFactorSpainRegion: Function,
    riskFactorSpainRegion_dictLst: Array<any>,
}

const RiskFactorSpainRegionFilter: React.FC<FilterProps> = ({ selectedRiskFactorSpainRegion_int, set_selectedRiskFactorSpainRegion, riskFactorSpainRegion_dictLst }) => {

    useEffect(
        () => {

        },
        []
    );

    return (<>
        <label
            className="form-label"
            htmlFor="riskFactorSpainRegionSelect_id"
        >
            <h6><strong>Select Risk Factor</strong></h6>
        </label>
        <Form id="riskFactorSelect_id">
            <Form.Control
                as="select"
                value={selectedRiskFactorSpainRegion_int}
                onChange={(e) => {
                    set_selectedRiskFactorSpainRegion(
                        e.target.value
                    )
                }}
            >
                {riskFactorSpainRegion_dictLst.map((riskFactorSpainRegion_dict, index) => (
                    <option
                        key={index}
                        value={riskFactorSpainRegion_dict['value']}
                        data-toggle="tooltip"
                        data-placement="right"
                        title={riskFactorSpainRegion_dict['label']}
                    // onClick={()=>( set_selectedYearLag(yearLag_dict) )}
                    >
                        {riskFactorSpainRegion_dict['label']}
                    </option>
                ))}
            </Form.Control>
        </Form>
    </>);
};


export default RiskFactorSpainRegionFilter;

import React, { useState, useEffect } from "react";
import { Form } from 'react-bootstrap';

// Interface for the properties of this component
interface FilterProps {
    selectedSex_int: number | null, // Allow null for "Select..."
    set_selectedSex: (value: number | null) => void, // Ensure correct type
    sex_dictLst: Array<{ value: number | null, label: string }>, // Type safety
}

const SexFilter: React.FC<FilterProps> = ({ selectedSex_int, set_selectedSex, sex_dictLst }) => {
    return (
        <>
            <label className="form-label" htmlFor="sexSelect_id">
                <h6><strong>Select Sex</strong></h6>
            </label>
            <Form id="sexSelect_id">
                <Form.Control
                    as="select"
                    value={selectedSex_int ?? ""} // Handle null case
                    onChange={(e) => {
                        const selectedValue = e.target.value === "" ? null : Number(e.target.value);
                        set_selectedSex(selectedValue);
                    }}
                >
                    {sex_dictLst.map((sex_dict, index) => (
                        <option
                            key={index}
                            value={sex_dict.value ?? ""} // Empty string for "Select..."
                            title={sex_dict.label}
                        >
                            {sex_dict.label}
                        </option>
                    ))}
                </Form.Control>
            </Form>
        </>
    );
};

export default SexFilter;

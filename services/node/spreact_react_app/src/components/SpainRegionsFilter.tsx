import React, { useState, useEffect } from "react";
import { Form } from 'react-bootstrap';

// Interface for the properties of this component
interface FilterProps {
    selectedRegions_lst: string[],
    set_selectedRegions: Function,
    showSpain?: boolean, // Optional prop to include or exclude Spain
}

const SpainRegionFilter: React.FC<FilterProps> = ({ selectedRegions_lst, set_selectedRegions, showSpain = true }) => {
    // Define all available regions, including 'Spain'
    const regions_strLst = [
        'Andalucia', 'Aragon', 'Asturias', 'Baleares', 'Canarias', 'Cantabria',
        'Castilla-La Mancha', 'Castilla y Leon', 'Catalonia', 'Comunitat Valenciana',
        'Extremadura', 'Galicia', 'Madrid', 'Murcia', 'Navarra', 'Basque Country', 'Rioja'
    ];

    // Filter out 'Spain' from the region list if showSpain is false
    const filteredRegions = regions_strLst.filter(region => showSpain || region !== 'Spain');

    // Set default region if none is selected
    // useEffect(() => {
    //     if (selectedRegions_lst.length === 0)
    //         set_selectedRegions([filteredRegions[0]]);
    // }, [showSpain]); // Reset selection when showSpain changes

    const toggleRegion_cbk = (selection_str: string) => {
        // Toggle region in the selected list
        if (selectedRegions_lst.includes(selection_str)) {
            set_selectedRegions(selectedRegions_lst.filter(item => item !== selection_str));
        } else {
            set_selectedRegions([...selectedRegions_lst, selection_str]);
        }
    }

    return (
        <div className="col-lg">
            <label className="form-label" htmlFor="regionSelect_id">
                {/* <strong>Select Country</strong> */}
            </label>
            {/* Dropdown for selecting Spain */}
            {/* {showSpain && (
                <Form id="regionSelect_id">
                    <Form.Control
                        as="select"
                        value={selectedRegions_lst.includes('Spain') ? 'Spain' : ''}
                        onChange={(e) => {
                            const selectedValue = e.target.value;
                            if (selectedValue === 'Spain') {
                                set_selectedRegions([...selectedRegions_lst, 'Spain']);
                            } else {
                                set_selectedRegions(selectedRegions_lst.filter(region => region !== 'Spain'));
                            }
                        }}
                    >
                        <option value="">Select ...</option>
                        <option value="Spain">Spain</option>
                    </Form.Control>
                </Form>
            )} */}
            { (
                <Form id="regionSelect_id">
                    {/* <Form.Control
                        as="select"
                        value={selectedRegions_lst}
                        onChange={(e) => {
                            const selectedValue = e.target.value;
                          
                            set_selectedRegions(selectedRegions_lst.filter(region => region));
                            
                        }}
                    >
                
                    </Form.Control> */}
                </Form>
            )}

            <label className="form-label" htmlFor="regionsSelect_id">
                <strong>Select Regions</strong>
            </label>
            {/* Dropdown for selecting other regions */}
            <Form id="regionsSelect_id">
                <Form.Control
                    as="select"
                    multiple
                    value={selectedRegions_lst}
                    onChange={(e) => {
                        const selectedValue = e.target.value;
                        toggleRegion_cbk(selectedValue);
                    }}
                >
                    {filteredRegions.map((region_str, index) => (
                        <option key={index} value={region_str}>
                            {region_str}
                        </option>
                    ))}
                </Form.Control>
            </Form>
        </div>
    );
};

export default SpainRegionFilter;

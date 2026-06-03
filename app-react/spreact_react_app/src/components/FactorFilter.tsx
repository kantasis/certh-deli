import React from "react";

interface FilterProps {
    selectedFactor_str: string;
    set_selectedFactor: Function;
}

const factors = [
    { label: "Summary Exposure Value", value: "Rate_SEV_val" },
    { label: "DALYs", value: "Rate_DALYs_val" },
    { label: "Deaths", value: "Rate_Deaths_val" },
    { label: "YLDs", value: "Rate_YLDs_val" },
    { label: "YLLs", value: "Rate_YLLs_val" },
];

const FactorFilter: React.FC<FilterProps> = ({ selectedFactor_str, set_selectedFactor }) => {
    return (
        <div>
            <label className="filter-label" htmlFor="factorSelect_id">Measure</label>
            <select
                id="factorSelect_id"
                className="form-select"
                value={selectedFactor_str}
                onChange={(e) => set_selectedFactor(e.target.value)}
            >
                {factors.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                ))}
            </select>
        </div>
    );
};

export default FactorFilter;

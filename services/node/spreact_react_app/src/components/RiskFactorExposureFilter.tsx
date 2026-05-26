import React from "react";

interface FilterProps {
    selectedRiskFactorExposure_int: number;
    set_selectedRiskFactorExposure: Function;
    riskFactorExposure_dictLst: Array<{ value: number; label: string; var_filter?: string }>;
}

const RiskFactorExposureFilter: React.FC<FilterProps> = ({
    selectedRiskFactorExposure_int,
    set_selectedRiskFactorExposure,
    riskFactorExposure_dictLst,
}) => {
    return (
        <div>
            <label className="filter-label" htmlFor="riskFactorExposureSelect_id">Risk Factor</label>
            <select
                id="riskFactorExposureSelect_id"
                className="form-select"
                value={selectedRiskFactorExposure_int}
                onChange={(e) => set_selectedRiskFactorExposure(Number(e.target.value))}
            >
                {riskFactorExposure_dictLst.map((rf) => (
                    <option key={rf.value} value={rf.value} title={rf.label}>
                        {rf.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default RiskFactorExposureFilter;

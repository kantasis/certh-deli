import React from "react";

interface FilterProps {
   selectedCrcFactor_int: number;
   set_selectedCrcFactor: Function;
   crcFactor_dictLst: Array<{ value: number; label: string; var_filter?: string }>;
}

const CrcFactorsFilter: React.FC<FilterProps> = ({ selectedCrcFactor_int, set_selectedCrcFactor, crcFactor_dictLst }) => {
   return (
      <div>
         <label className="filter-label" htmlFor="crcFactorSelect_id">Measure</label>
         <select
            id="crcFactorSelect_id"
            className="form-select"
            value={selectedCrcFactor_int}
            onChange={(e) => set_selectedCrcFactor(e.target.value)}
         >
            {crcFactor_dictLst.map((factor, index) => (
               <option key={index} value={factor.value} title={factor.label}>
                  {factor.label}
               </option>
            ))}
         </select>
      </div>
   );
};

export default CrcFactorsFilter;

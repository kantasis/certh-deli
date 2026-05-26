import React from "react";

interface FilterProps {
   selectedSex_int: number | null;
   set_selectedSex: (value: number | null) => void;
   sex_dictLst: Array<{ value: number | null; label: string }>;
}

const SexFilter: React.FC<FilterProps> = ({ selectedSex_int, set_selectedSex, sex_dictLst }) => {
   return (
      <div>
         <label className="filter-label" htmlFor="sexSelect_id">Sex</label>
         <select
            id="sexSelect_id"
            className="form-select"
            value={selectedSex_int ?? ""}
            onChange={(e) => {
               const val = e.target.value === "" ? null : Number(e.target.value);
               set_selectedSex(val);
            }}
         >
            {sex_dictLst.map((sex_dict, index) => (
               <option key={index} value={sex_dict.value ?? ""}>
                  {sex_dict.label}
               </option>
            ))}
         </select>
      </div>
   );
};

export default SexFilter;

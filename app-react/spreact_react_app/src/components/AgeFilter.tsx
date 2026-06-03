import React from "react";

interface FilterProps {
   selectedAge_int: number;
   set_selectedAge: Function;
   age_dictLst: Array<{ value: number; label: string; var_filter?: string }>;
}

const AgeFilter: React.FC<FilterProps> = ({ selectedAge_int, set_selectedAge, age_dictLst }) => {
   return (
      <div>
         <label className="filter-label" htmlFor="ageSelect_id">Age group</label>
         <select
            id="ageSelect_id"
            className="form-select"
            value={selectedAge_int}
            onChange={(e) => set_selectedAge(e.target.value)}
         >
            {age_dictLst.map((age_dict, index) => (
               <option key={index} value={age_dict.value} title={age_dict.label}>
                  {age_dict.label}
               </option>
            ))}
         </select>
      </div>
   );
};

export default AgeFilter;

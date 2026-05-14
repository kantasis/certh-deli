import React, { useEffect } from "react";

interface FilterProps {
   minYear_int: number;
   set_minYear: Function;
   maxYear_int: number;
   set_maxYear: Function;
   floorYear_int?: number;
   ceilYear_int?: number;
}

const YearFilter: React.FC<FilterProps> = ({
   minYear_int,
   set_minYear,
   maxYear_int,
   set_maxYear,
   floorYear_int = 1990,
   ceilYear_int = 2021,
}) => {
   useEffect(() => {
      if (minYear_int === 0) set_minYear(floorYear_int);
      if (maxYear_int === 0) set_maxYear(ceilYear_int);
   }, [floorYear_int, ceilYear_int, set_minYear, set_maxYear]);

   return (
      <>
         <style>{`
            .yf-range { accent-color: var(--brand, #1f6580); width: 100%; cursor: pointer; }
            .yf-value { font-size: 14px; font-weight: 700; color: var(--brand-dark, #185569); }
            .yf-row { margin-bottom: 14px; }
            .yf-range-label { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
         `}</style>
         <div>
            <div className="yf-row">
               <div className="yf-range-label">
                  <label className="filter-label" htmlFor="yf-min" style={{ margin: 0 }}>From year</label>
                  <span className="yf-value">{minYear_int}</span>
               </div>
               <input
                  id="yf-min"
                  className="yf-range"
                  type="range"
                  min={floorYear_int}
                  max={ceilYear_int}
                  value={minYear_int}
                  onChange={(e) => set_minYear(Math.min(maxYear_int, +e.target.value))}
               />
            </div>
            <div className="yf-row">
               <div className="yf-range-label">
                  <label className="filter-label" htmlFor="yf-max" style={{ margin: 0 }}>To year</label>
                  <span className="yf-value">{maxYear_int}</span>
               </div>
               <input
                  id="yf-max"
                  className="yf-range"
                  type="range"
                  min={floorYear_int}
                  max={ceilYear_int}
                  value={maxYear_int}
                  onChange={(e) => set_maxYear(Math.max(minYear_int, +e.target.value))}
               />
            </div>
         </div>
      </>
   );
};

export default YearFilter;

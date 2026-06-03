import React, { useState, useEffect, useRef } from "react";
import CountryMapModal from "./CountryMapModal";

interface FilterProps {
   selectedCountries_lst: string[];
   set_selectedCountries: Function;
}

const COUNTRIES = [
   "Albania", "Andorra", "Austria", "Belarus", "Belgium",
   "Bosnia and Herzegovina", "Bulgaria", "Croatia", "Cyprus", "Czechia",
   "Denmark", "England", "Estonia", "Finland", "France", "Germany",
   "Greece", "Hungary", "Iceland", "Ireland", "Israel", "Italy",
   "Latvia", "Lithuania", "Luxembourg", "Malta", "Monaco", "Montenegro",
   "Netherlands", "North Macedonia", "Norway", "Poland", "Portugal",
   "Republic of Moldova", "Romania", "Russian Federation", "Serbia",
   "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Turkey",
   "Ukraine", "United Kingdom",
];

const DEFAULT_COUNTRIES = ["Belgium", "Greece", "Italy"];

const CountryFilter: React.FC<FilterProps> = ({
   selectedCountries_lst,
   set_selectedCountries,
}) => {
   const [search_str, setSearch_str] = useState("");
   const [isOpen_bool, setIsOpen_bool] = useState(false);
   const [isMapOpen_bool, setIsMapOpen_bool] = useState(false);
   const containerRef = useRef<HTMLDivElement>(null);
   const inputRef = useRef<HTMLInputElement>(null);

   useEffect(() => {
      const handleClick = (e: MouseEvent) => {
         if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
            setIsOpen_bool(false);
            setSearch_str("");
         }
      };
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
   }, []);

   const filtered_lst = COUNTRIES.filter(
      (c) =>
         c.toLowerCase().includes(search_str.toLowerCase()) &&
         !selectedCountries_lst.includes(c)
   );

   const addCountry_cbk = (country_str: string) => {
      set_selectedCountries([...selectedCountries_lst, country_str]);
      setSearch_str("");
      setTimeout(() => {
         inputRef.current?.focus();
         setIsOpen_bool(true);
      }, 0);
   };

   const removeCountry_cbk = (country_str: string) => {
      set_selectedCountries(selectedCountries_lst.filter((c) => c !== country_str));
   };

   const clearAll_cbk = () => {
      set_selectedCountries([...DEFAULT_COUNTRIES]);
   };

   return (
      <>
         <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .cf-wrapper { sans-serif; width: 100%; max-width: 480px; }
        .cf-label { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .cf-label-text { font-size: 14px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #374151; }
        .cf-label-actions { display: flex; align-items: center; gap: 10px; }
        .cf-map-btn {
          font-size: 12px; color: var(--brand-dark, #185569); background: #e8f2f6;
          border: none; border-radius: 6px; cursor: pointer;
          padding: 3px 9px; font-family: 'DM Sans', sans-serif; font-weight: 500;
          transition: background 0.15s, color 0.15s;
          display: flex; align-items: center; gap: 4px;
        }
        .cf-map-btn:hover { background: #d3e8f0; color: #124557; }
        .cf-clear-btn { font-size: 13px; color: #9ca3af; background: none; border: none; cursor: pointer; padding: 0; transition: color 0.15s; }
        .cf-clear-btn:hover { color: #ef4444; }
        .cf-box { border: 1.5px solid #e5e7eb; border-radius: 12px; background: #fff; transition: border-color 0.2s, box-shadow 0.2s; overflow: hidden; }
        .cf-box.focused { border-color: var(--brand, #1f6580); box-shadow: 0 0 0 3px rgba(31,101,128,0.12); }
        .cf-input-area { display: flex; flex-wrap: wrap; gap: 6px; padding: 10px 12px; min-height: 48px; cursor: text; align-items: center; }
        .cf-tag { display: inline-flex; align-items: center; gap: 5px; background: #e8f2f6; color: #185569; border-radius: 20px; padding: 3px 10px 3px 12px; font-size: 14px; font-weight: 500; animation: tagIn 0.18s ease; white-space: nowrap; }
        @keyframes tagIn { from { transform: scale(0.75); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .cf-tag-remove { display: flex; align-items: center; justify-content: center; width: 16px; height: 16px; border-radius: 50%; border: none; background: transparent; color: #1f6580; cursor: pointer; font-size: 15px; line-height: 1; padding: 0; transition: background 0.15s, color 0.15s; }
        .cf-tag-remove:hover { background: #d3e8f0; color: #124557; }
        .cf-search-input { border: none; outline: none; font-family: 'DM Sans', sans-serif; font-size: 15px; color: #111827; background: transparent; min-width: 120px; flex: 1; }
        .cf-search-input::placeholder { color: #d1d5db; }
        .cf-dropdown { border-top: 1.5px solid #f3f4f6; max-height: 210px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #e5e7eb transparent; }
        .cf-option { padding: 9px 14px; font-size: 15px; color: #374151; cursor: pointer; transition: background 0.1s; display: flex; align-items: center; gap: 8px; }
        .cf-option:hover { background: #f0f5f8; color: #185569; }
        .cf-option-dot { width: 6px; height: 6px; border-radius: 50%; background: #7ab5cc; flex-shrink: 0; }
        .cf-empty { padding: 14px; font-size: 14px; color: #9ca3af; text-align: center; }
        .cf-count { font-size: 13px; color: #6b7280; padding: 6px 14px 8px; border-top: 1px solid #f3f4f6; }
      `}</style>

         <div className="cf-wrapper" ref={containerRef}>
            <div className="cf-label">
               <label className="form-label" htmlFor="cf-input">
                  <strong>Select Countries</strong>
               </label>
               <div className="cf-label-actions">
                  <button className="cf-map-btn" onClick={() => setIsMapOpen_bool(true)}>
                     <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                        <line x1="9" y1="3" x2="9" y2="18"/>
                        <line x1="15" y1="6" x2="15" y2="21"/>
                     </svg>
                     Map
                  </button>
                  <button className="cf-clear-btn" onClick={clearAll_cbk}>
                     Reset
                  </button>
               </div>
            </div>

            <div className={`cf-box ${isOpen_bool ? "focused" : ""}`}>
               <div
                  className="cf-input-area"
                  onClick={() => {
                     setIsOpen_bool(true);
                     inputRef.current?.focus();
                  }}
               >
                  {selectedCountries_lst.map((country_str) => (
                     <span className="cf-tag" key={country_str}>
                        {country_str}
                        <button
                           className="cf-tag-remove"
                           onClick={(e) => {
                              e.stopPropagation();
                              removeCountry_cbk(country_str);
                           }}
                           title={`Remove ${country_str}`}
                        >
                           ×
                        </button>
                     </span>
                  ))}
                  <input
                     id="cf-input"
                     ref={inputRef}
                     className="cf-search-input"
                     placeholder={selectedCountries_lst.length === 0 ? "Search countries…" : "Add more…"}
                     value={search_str}
                     onChange={(e) => {
                        setSearch_str(e.target.value);
                        setIsOpen_bool(true);
                     }}
                     onFocus={() => setIsOpen_bool(true)}
                  />
               </div>

               {isOpen_bool && (
                  <div className="cf-dropdown">
                     {filtered_lst.length === 0 ? (
                        <div className="cf-empty">
                           {search_str ? `No results for "${search_str}"` : "All countries selected"}
                        </div>
                     ) : (
                        filtered_lst.map((country_str) => (
                           <div
                              key={country_str}
                              className="cf-option"
                              onMouseDown={(e) => {
                                 e.preventDefault();
                                 addCountry_cbk(country_str);
                              }}
                           >
                              <span className="cf-option-dot" />
                              {country_str}
                           </div>
                        ))
                     )}
                  </div>
               )}
            </div>

            {selectedCountries_lst.length > 0 && (
               <div className="cf-count">
                  {selectedCountries_lst.length} of {COUNTRIES.length} selected
               </div>
            )}
         </div>

         <CountryMapModal
            isOpen={isMapOpen_bool}
            onClose={() => setIsMapOpen_bool(false)}
            selectedCountries_lst={selectedCountries_lst}
            set_selectedCountries={set_selectedCountries}
            selectableCountries={COUNTRIES}
         />
      </>
   );
};

export default CountryFilter;

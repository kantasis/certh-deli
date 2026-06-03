import React, { useState, useRef, useEffect } from "react";
import SpainRegionMapModal from "./SpainRegionMapModal";

interface FilterProps {
    selectedRegions_lst: string[];
    set_selectedRegions: Function;
    showSpain?: boolean;
}

const REGIONS = [
    'Andalucia', 'Aragon', 'Asturias', 'Baleares', 'Canarias', 'Cantabria',
    'Castilla-La Mancha', 'Castilla y Leon', 'Catalonia', 'Comunitat Valenciana',
    'Extremadura', 'Galicia', 'Madrid', 'Murcia', 'Navarra', 'Basque Country', 'Rioja',
];

const SpainRegionFilter: React.FC<FilterProps> = ({
    selectedRegions_lst,
    set_selectedRegions,
    showSpain = true,
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

    const filtered_lst = REGIONS.filter(
        (r) =>
            r.toLowerCase().includes(search_str.toLowerCase()) &&
            !selectedRegions_lst.includes(r)
    );

    const addRegion_cbk = (region_str: string) => {
        set_selectedRegions([...selectedRegions_lst, region_str]);
        setSearch_str("");
        setTimeout(() => {
            inputRef.current?.focus();
            setIsOpen_bool(true);
        }, 0);
    };

    const removeRegion_cbk = (region_str: string) => {
        set_selectedRegions(selectedRegions_lst.filter((r) => r !== region_str));
    };

    const clearAll_cbk = () => set_selectedRegions([]);

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
                .rf-wrapper { width: 100%; max-width: 480px; }
                .rf-label { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
                .rf-label-text { font-size: 14px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #374151; }
                .rf-label-actions { display: flex; align-items: center; gap: 10px; }
                .rf-map-btn {
                    font-size: 12px; color: var(--brand-dark, #185569); background: #e8f2f6;
                    border: none; border-radius: 6px; cursor: pointer;
                    padding: 3px 9px; font-family: 'DM Sans', sans-serif; font-weight: 500;
                    transition: background 0.15s, color 0.15s;
                    display: flex; align-items: center; gap: 4px;
                }
                .rf-map-btn:hover { background: #d3e8f0; color: #124557; }
                .rf-clear-btn { font-size: 13px; color: #9ca3af; background: none; border: none; cursor: pointer; padding: 0; transition: color 0.15s; }
                .rf-clear-btn:hover { color: #ef4444; }
                .rf-box { border: 1.5px solid #e5e7eb; border-radius: 12px; background: #fff; transition: border-color 0.2s, box-shadow 0.2s; overflow: hidden; }
                .rf-box.focused { border-color: var(--brand, #1f6580); box-shadow: 0 0 0 3px rgba(31,101,128,0.12); }
                .rf-input-area { display: flex; flex-wrap: wrap; gap: 6px; padding: 10px 12px; min-height: 48px; cursor: text; align-items: center; }
                .rf-tag { display: inline-flex; align-items: center; gap: 5px; background: #e8f2f6; color: #185569; border-radius: 20px; padding: 3px 10px 3px 12px; font-size: 14px; font-weight: 500; animation: rfTagIn 0.18s ease; white-space: nowrap; }
                @keyframes rfTagIn { from { transform: scale(0.75); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .rf-tag-remove { display: flex; align-items: center; justify-content: center; width: 16px; height: 16px; border-radius: 50%; border: none; background: transparent; color: #1f6580; cursor: pointer; font-size: 15px; line-height: 1; padding: 0; transition: background 0.15s, color 0.15s; }
                .rf-tag-remove:hover { background: #d3e8f0; color: #124557; }
                .rf-search-input { border: none; outline: none; font-family: 'DM Sans', sans-serif; font-size: 15px; color: #111827; background: transparent; min-width: 120px; flex: 1; }
                .rf-search-input::placeholder { color: #d1d5db; }
                .rf-dropdown { border-top: 1.5px solid #f3f4f6; max-height: 210px; overflow-y: auto; scrollbar-width: thin; scrollbar-color: #e5e7eb transparent; }
                .rf-option { padding: 9px 14px; font-size: 15px; color: #374151; cursor: pointer; transition: background 0.1s; display: flex; align-items: center; gap: 8px; }
                .rf-option:hover { background: #f0f5f8; color: #185569; }
                .rf-option-dot { width: 6px; height: 6px; border-radius: 50%; background: #7ab5cc; flex-shrink: 0; }
                .rf-empty { padding: 14px; font-size: 14px; color: #9ca3af; text-align: center; }
                .rf-count { font-size: 13px; color: #6b7280; padding: 6px 14px 8px; border-top: 1px solid #f3f4f6; }
            `}</style>

            <div className="rf-wrapper" ref={containerRef}>
                <div className="rf-label">
                    <label className="rf-label-text" htmlFor="rf-input">Select Regions</label>
                    <div className="rf-label-actions">
                        <button className="rf-map-btn" onClick={() => setIsMapOpen_bool(true)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
                                <line x1="9" y1="3" x2="9" y2="18"/>
                                <line x1="15" y1="6" x2="15" y2="21"/>
                            </svg>
                            Map
                        </button>
                        <button className="rf-clear-btn" onClick={clearAll_cbk}>Reset</button>
                    </div>
                </div>

                <div className={`rf-box ${isOpen_bool ? "focused" : ""}`}>
                    <div
                        className="rf-input-area"
                        onClick={() => {
                            setIsOpen_bool(true);
                            inputRef.current?.focus();
                        }}
                    >
                        {selectedRegions_lst.map((region_str) => (
                            <span className="rf-tag" key={region_str}>
                                {region_str}
                                <button
                                    className="rf-tag-remove"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeRegion_cbk(region_str);
                                    }}
                                    title={`Remove ${region_str}`}
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                        <input
                            id="rf-input"
                            ref={inputRef}
                            className="rf-search-input"
                            placeholder={selectedRegions_lst.length === 0 ? "Search regions…" : "Add more…"}
                            value={search_str}
                            onChange={(e) => {
                                setSearch_str(e.target.value);
                                setIsOpen_bool(true);
                            }}
                            onFocus={() => setIsOpen_bool(true)}
                        />
                    </div>

                    {isOpen_bool && (
                        <div className="rf-dropdown">
                            {filtered_lst.length === 0 ? (
                                <div className="rf-empty">
                                    {search_str ? `No results for "${search_str}"` : "All regions selected"}
                                </div>
                            ) : (
                                filtered_lst.map((region_str) => (
                                    <div
                                        key={region_str}
                                        className="rf-option"
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            addRegion_cbk(region_str);
                                        }}
                                    >
                                        <span className="rf-option-dot" />
                                        {region_str}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {selectedRegions_lst.length > 0 && (
                    <div className="rf-count">
                        {selectedRegions_lst.length} of {REGIONS.length} selected
                    </div>
                )}
            </div>

            <SpainRegionMapModal
                isOpen={isMapOpen_bool}
                onClose={() => setIsMapOpen_bool(false)}
                selectedRegions_lst={selectedRegions_lst}
                set_selectedRegions={set_selectedRegions}
                selectableRegions={REGIONS}
            />
        </>
    );
};

export default SpainRegionFilter;

import React, { useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

// Europe-focused topojson from a reliable CDN
const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json";

// Map from topojson country name → our COUNTRIES list name
// ISO numeric codes from world-atlas match these names
const NAME_MAP: Record<string, string> = {
  Albania: "Albania",
  Andorra: "Andorra",
  Austria: "Austria",
  Belarus: "Belarus",
  Belgium: "Belgium",
  "Bosnia and Herz.": "Bosnia and Herzegovina",
  Bulgaria: "Bulgaria",
  Croatia: "Croatia",
  Cyprus: "Cyprus",
  Czechia: "Czechia",
  Denmark: "Denmark",
  Estonia: "Estonia",
  Finland: "Finland",
  France: "France",
  Germany: "Germany",
  Greece: "Greece",
  Hungary: "Hungary",
  Iceland: "Iceland",
  Ireland: "Ireland",
  Israel: "Israel",
  Italy: "Italy",
  Latvia: "Latvia",
  Lithuania: "Lithuania",
  Luxembourg: "Luxembourg",
  Malta: "Malta",
  Monaco: "Monaco",
  Montenegro: "Montenegro",
  Netherlands: "Netherlands",
  "North Macedonia": "North Macedonia",
  Norway: "Norway",
  Poland: "Poland",
  Portugal: "Portugal",
  Moldova: "Republic of Moldova",
  Romania: "Romania",
  Russia: "Russian Federation",
  Serbia: "Serbia",
  Slovakia: "Slovakia",
  Slovenia: "Slovenia",
  Spain: "Spain",
  Sweden: "Sweden",
  Switzerland: "Switzerland",
  Turkey: "Turkey",
  Ukraine: "Ukraine",
  "United Kingdom": "United Kingdom",
  England: "England",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedCountries_lst: string[];
  set_selectedCountries: Function;
  selectableCountries: string[];
}

const CountryMapModal: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedCountries_lst,
  set_selectedCountries,
  selectableCountries,
}) => {
  const [tooltip, setTooltip] = useState<{ name: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resolveCountryName = (geoName: string): string | null => {
    return NAME_MAP[geoName] ?? null;
  };

  const isSelectable = (geoName: string) => {
    const resolved = resolveCountryName(geoName);
    return resolved ? selectableCountries.includes(resolved) : false;
  };

  const isSelected = (geoName: string) => {
    const resolved = resolveCountryName(geoName);
    return resolved ? selectedCountries_lst.includes(resolved) : false;
  };

  const handleClick = (geoName: string) => {
    const resolved = resolveCountryName(geoName);
    if (!resolved || !selectableCountries.includes(resolved)) return;
    if (selectedCountries_lst.includes(resolved)) {
      set_selectedCountries(selectedCountries_lst.filter((c) => c !== resolved));
    } else {
      set_selectedCountries([...selectedCountries_lst, resolved]);
    }
  };

  const getFill = (geoName: string) => {
    if (isSelected(geoName)) return "#4338ca";
    if (isSelectable(geoName)) return "#c7d2fe";
    return "#e2e8f0";
  };

  const getHoverFill = (geoName: string) => {
    if (isSelected(geoName)) return "#3730a3";
    if (isSelectable(geoName)) return "#a5b4fc";
    return "#e2e8f0";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .cm-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(15,15,35,0.6);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          animation: cmFadeIn 0.2s ease;
        }
        @keyframes cmFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .cm-modal {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.22);
          width: 90vw; max-width: 820px;
          max-height: 90vh;
          display: flex; flex-direction: column;
          font-family: 'DM Sans', sans-serif;
          animation: cmSlideUp 0.22s ease;
          overflow: hidden;
        }
        @keyframes cmSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .cm-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px 16px;
          border-bottom: 1px solid #f1f5f9;
        }
        .cm-title { font-size: 16px; font-weight: 600; color: #111827; }
        .cm-subtitle { font-size: 13px; color: #9ca3af; margin-top: 2px; }
        .cm-close {
          width: 32px; height: 32px; border-radius: 50%;
          border: none; background: #f1f5f9;
          cursor: pointer; font-size: 18px; color: #6b7280;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }
        .cm-close:hover { background: #e5e7eb; color: #111827; }
        .cm-body { flex: 1; overflow: hidden; position: relative; }
        .cm-legend {
          display: flex; gap: 16px; padding: 10px 24px;
          border-top: 1px solid #f1f5f9;
          align-items: center;
        }
        .cm-legend-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #6b7280; }
        .cm-legend-dot { width: 12px; height: 12px; border-radius: 3px; }
        .cm-footer {
          padding: 14px 24px;
          border-top: 1px solid #f1f5f9;
          display: flex; align-items: center; justify-content: space-between;
        }
        .cm-count { font-size: 14px; color: #6b7280; }
        .cm-done-btn {
          background: #4338ca; color: #fff;
          border: none; border-radius: 10px;
          padding: 9px 24px; font-size: 15px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: background 0.15s;
        }
        .cm-done-btn:hover { background: #3730a3; }
        .cm-tooltip {
          position: fixed;
          background: #1e1b4b; color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500;
          padding: 5px 10px; border-radius: 6px;
          pointer-events: none;
          transform: translate(-50%, -130%);
          white-space: nowrap;
          z-index: 1100;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
      `}</style>

      <div className="cm-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="cm-modal">
          <div className="cm-header">
            <div>
              <div className="cm-title">Select Countries on Map</div>
              <div className="cm-subtitle">Click a highlighted country to select or deselect it</div>
            </div>
            <button className="cm-close" onClick={onClose}>×</button>
          </div>

          <div className="cm-body">
            <ComposableMap
              projection="geoAzimuthalEqualArea"
              projectionConfig={{ rotate: [-15, -53, 0], scale: 680 }}
              width={820}
              height={500}
              style={{ width: "100%", height: "100%" }}
            >
              <ZoomableGroup>
                <Geographies geography={GEO_URL}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const name: string = geo.properties.name;
                      const selectable = isSelectable(name);
                      const selected = isSelected(name);
                      return (
                        <Geography
                          key={`${geo.rsmKey}-${selected}`}
                          geography={geo}
                          onClick={() => handleClick(name)}
                          onMouseEnter={(e) => {
                            if (selectable) {
                              setTooltip({ name: NAME_MAP[name] ?? name, x: e.clientX, y: e.clientY });
                            }
                          }}
                          onMouseMove={(e) => {
                            if (tooltip) setTooltip(t => t ? { ...t, x: e.clientX, y: e.clientY } : null);
                          }}
                          onMouseLeave={() => setTooltip(null)}
                          style={{
                            default: {
                              fill: getFill(name),
                              stroke: "#fff",
                              strokeWidth: 0.5,
                              outline: "none",
                              cursor: selectable ? "pointer" : "default",
                              transition: "fill 0.12s",
                            },
                            hover: {
                              fill: getHoverFill(name),
                              stroke: "#fff",
                              strokeWidth: 0.5,
                              outline: "none",
                              cursor: selectable ? "pointer" : "default",
                            },
                            pressed: {
                              fill: selected ? "#312e81" : "#818cf8",
                              outline: "none",
                            },
                          }}
                        />
                      );
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
          </div>

          <div className="cm-legend">
            <div className="cm-legend-item">
              <div className="cm-legend-dot" style={{ background: "#4338ca" }} />
              Selected
            </div>
            <div className="cm-legend-item">
              <div className="cm-legend-dot" style={{ background: "#c7d2fe" }} />
              Available
            </div>
            <div className="cm-legend-item">
              <div className="cm-legend-dot" style={{ background: "#e2e8f0" }} />
              Not available
            </div>
          </div>

          <div className="cm-footer">
            <span className="cm-count">
              {selectedCountries_lst.length} countr{selectedCountries_lst.length === 1 ? "y" : "ies"} selected
            </span>
            <button className="cm-done-btn" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>

      {tooltip && (
        <div className="cm-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.name}
        </div>
      )}
    </>
  );
};

export default CountryMapModal;

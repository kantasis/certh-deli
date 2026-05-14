import React, { useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

// Spain autonomous communities GeoJSON
const GEO_URL =
  "https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/spain-communities.geojson";

// Map from GeoJSON feature name → internal region name used by filters
const NAME_MAP: Record<string, string> = {
  "Andalucía": "Andalucia",
  "Aragón": "Aragon",
  "Asturias": "Asturias",
  "Illes Balears": "Baleares",
  "Baleares": "Baleares",
  "Islas Canarias": "Canarias",
  "Canarias": "Canarias",
  "Cantabria": "Cantabria",
  "Castilla-La Mancha": "Castilla-La Mancha",
  "Castilla y León": "Castilla y Leon",
  "Cataluña": "Catalonia",
  "Catalunya": "Catalonia",
  "Comunitat Valenciana": "Comunitat Valenciana",
  "Comunidad Valenciana": "Comunitat Valenciana",
  "Extremadura": "Extremadura",
  "Galicia": "Galicia",
  "La Rioja": "Rioja",
  "Comunidad de Madrid": "Madrid",
  "Madrid": "Madrid",
  "Región de Murcia": "Murcia",
  "Murcia": "Murcia",
  "Comunidad Foral de Navarra": "Navarra",
  "Navarra": "Navarra",
  "País Vasco": "Basque Country",
  "Euskadi": "Basque Country",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedRegions_lst: string[];
  set_selectedRegions: Function;
  selectableRegions: string[];
}

const SpainRegionMapModal: React.FC<Props> = ({
  isOpen,
  onClose,
  selectedRegions_lst,
  set_selectedRegions,
  selectableRegions,
}) => {
  const [tooltip, setTooltip] = useState<{ name: string; x: number; y: number } | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resolveRegionName = (geoName: string): string | null =>
    NAME_MAP[geoName] ?? null;

  const isSelectable = (geoName: string) => {
    const resolved = resolveRegionName(geoName);
    return resolved ? selectableRegions.includes(resolved) : false;
  };

  const isSelected = (geoName: string) => {
    const resolved = resolveRegionName(geoName);
    return resolved ? selectedRegions_lst.includes(resolved) : false;
  };

  const handleClick = (geoName: string) => {
    const resolved = resolveRegionName(geoName);
    if (!resolved || !selectableRegions.includes(resolved)) return;
    if (selectedRegions_lst.includes(resolved)) {
      set_selectedRegions(selectedRegions_lst.filter((r) => r !== resolved));
    } else {
      set_selectedRegions([...selectedRegions_lst, resolved]);
    }
  };

  const getFill = (geoName: string) => {
    if (isSelected(geoName)) return "#1f6580";
    if (isSelectable(geoName)) return "#a8d4e3";
    return "#e2e8f0";
  };

  const getHoverFill = (geoName: string) => {
    if (isSelected(geoName)) return "#185569";
    if (isSelectable(geoName)) return "#7ab5cc";
    return "#e2e8f0";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        .srm-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(15,15,35,0.6);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          animation: srmFadeIn 0.2s ease;
        }
        @keyframes srmFadeIn { from { opacity: 0; } to { opacity: 1; } }
        .srm-modal {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.22);
          width: 90vw; max-width: 860px;
          max-height: 90vh;
          display: flex; flex-direction: column;
          font-family: 'DM Sans', sans-serif;
          animation: srmSlideUp 0.22s ease;
          overflow: hidden;
        }
        @keyframes srmSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        .srm-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px 16px;
          border-bottom: 1px solid #f1f5f9;
        }
        .srm-title { font-size: 16px; font-weight: 600; color: #111827; }
        .srm-subtitle { font-size: 13px; color: #9ca3af; margin-top: 2px; }
        .srm-close {
          width: 32px; height: 32px; border-radius: 50%;
          border: none; background: #f1f5f9;
          cursor: pointer; font-size: 18px; color: #6b7280;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s;
        }
        .srm-close:hover { background: #e5e7eb; color: #111827; }
        .srm-body { flex: 1; overflow: hidden; position: relative; }
        .srm-legend {
          display: flex; gap: 16px; padding: 10px 24px;
          border-top: 1px solid #f1f5f9; align-items: center;
        }
        .srm-legend-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #6b7280; }
        .srm-legend-dot { width: 12px; height: 12px; border-radius: 3px; }
        .srm-footer {
          padding: 14px 24px;
          border-top: 1px solid #f1f5f9;
          display: flex; align-items: center; justify-content: space-between;
        }
        .srm-count { font-size: 14px; color: #6b7280; }
        .srm-done-btn {
          background: var(--brand, #1f6580); color: #fff;
          border: none; border-radius: 10px;
          padding: 9px 24px; font-size: 15px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: background 0.15s;
        }
        .srm-done-btn:hover { background: var(--brand-dark, #185569); }
        .srm-tooltip {
          position: fixed;
          background: #0f172a; color: #fff;
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

      <div className="srm-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="srm-modal">
          <div className="srm-header">
            <div>
              <div className="srm-title">Select Regions on Map</div>
              <div className="srm-subtitle">Click a highlighted region to select or deselect · Scroll to zoom · Drag to pan</div>
            </div>
            <button className="srm-close" onClick={onClose}>×</button>
          </div>

          <div className="srm-body">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ center: [-5, 37.5], scale: 1350 }}
              width={860}
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
                              strokeWidth: 0.8,
                              outline: "none",
                              cursor: selectable ? "pointer" : "default",
                              transition: "fill 0.12s",
                            },
                            hover: {
                              fill: getHoverFill(name),
                              stroke: "#fff",
                              strokeWidth: 0.8,
                              outline: "none",
                              cursor: selectable ? "pointer" : "default",
                            },
                            pressed: {
                              fill: selected ? "#0b4d62" : "#7ab5cc",
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

          <div className="srm-legend">
            <div className="srm-legend-item">
              <div className="srm-legend-dot" style={{ background: "#1f6580" }} />
              Selected
            </div>
            <div className="srm-legend-item">
              <div className="srm-legend-dot" style={{ background: "#a8d4e3" }} />
              Available
            </div>
            <div className="srm-legend-item">
              <div className="srm-legend-dot" style={{ background: "#e2e8f0" }} />
              Not available
            </div>
          </div>

          <div className="srm-footer">
            <span className="srm-count">
              {selectedRegions_lst.length} region{selectedRegions_lst.length !== 1 ? "s" : ""} selected
            </span>
            <button className="srm-done-btn" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>

      {tooltip && (
        <div className="srm-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.name}
        </div>
      )}
    </>
  );
};

export default SpainRegionMapModal;

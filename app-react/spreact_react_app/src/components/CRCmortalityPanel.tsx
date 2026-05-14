import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service.tsx";
import { Accordion } from "react-bootstrap";
import SpainRegionFilter from "./SpainRegionsFilter.tsx";
import YearFilter from "./YearFilter.tsx";
import SexFilter from "./SexFilter.tsx";
import Comments from "./Comments.tsx";
import SaveGraphButton from "./SaveGraphButton.tsx";
import { useLocation } from "react-router-dom";

const grafana_host = import.meta.env.VITE_GRAFANA_HOST;
const grafana_port = import.meta.env.VITE_GRAFANA_PORT;
const grafana_path = import.meta.env.VITE_GRAFANA_PATH;
const dashboard_name = import.meta.env.VITE_GRAFANA_DASHBOARD;

const panel_id = 9;
const grafana_base_url = `http://${grafana_host}:${grafana_port}/${grafana_path}/${dashboard_name}?panelId=${panel_id}&orgId=1&theme=light`;

const sex_dictLst = [
    { value: null, label: "Select...", var_filter: "" },
    { value: 0, label: "Both Sexes", var_filter: "Both" },
    { value: 1, label: "Male", var_filter: "Male" },
    { value: 2, label: "Female", var_filter: "Female" },
];

const CRCmortalityPanel: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [iframeLoading, setIframeLoading] = useState(true);
    const [selectedRegions_lst, set_selectedRegions] = useState<string[]>([]);
    const [minYear_int, set_minYear] = useState(0);
    const [maxYear_int, set_maxYear] = useState(0);
    const [selectedSex_int, set_selectedSex] = useState<number | null>(null);

    const location = useLocation();
    const savedIframeUrl = location.state?.iframeUrl;

    useEffect(() => {
        if (!savedIframeUrl) return;
        try {
            const url = new URL(savedIframeUrl);
            const params = new URLSearchParams(url.search);
            const region_filter = params.get("var-region_filter");
            const minyear_filter = params.get("var-minyear_filter");
            const maxyear_filter = params.get("var-maxyear_filter");
            const sex_filter = params.get("var-sex_filter");
            set_selectedRegions(region_filter ? region_filter.split(",") : []);
            set_minYear(minyear_filter ? Number(minyear_filter) : 0);
            set_maxYear(maxyear_filter ? Number(maxyear_filter) : 0);
            const sexValueMap: Record<string, number> = { Both: 0, Male: 1, Female: 2 };
            set_selectedSex(sex_filter && sexValueMap[sex_filter] !== undefined ? sexValueMap[sex_filter] : null);
            const panelLabel = params.get("panelLabel") ?? location.state?.panelLabel;
            if (panelLabel) localStorage.setItem("lit03Panel", panelLabel);
        } catch (err) {
            console.warn("Invalid savedIframeUrl:", savedIframeUrl, err);
        }
    }, [savedIframeUrl, location.state]);

    useEffect(() => {
        setIsLoggedIn(AuthService.isLoggedIn());
    }, []);

    const panelLabel = localStorage.getItem("lit03Panel");

    const getUriParams = () => {
        const regionFilter_str = `var-region_filter=${selectedRegions_lst.join(",")}`;
        const yearFilter_str = `var-minyear_filter=${minYear_int}&var-maxyear_filter=${maxYear_int}`;
        const selectedSex_str = sex_dictLst.find(sex => sex.value === selectedSex_int)?.var_filter || "";
        return `${regionFilter_str}&${yearFilter_str}&var-sex_filter=${selectedSex_str}&panelLabel=${panelLabel}`;
    };

    const iFrame_url = `${grafana_base_url}&${getUriParams()}`;

    const isRegionSelected = selectedRegions_lst.length > 0 && selectedRegions_lst.some(r => r.trim() !== "");
    const isYearSelected = minYear_int > 0 && maxYear_int > 0;
    const isSexSelected = selectedSex_int !== null;
    const isAllFiltersSelected = isRegionSelected && isYearSelected && isSexSelected;

    if (!isLoggedIn) return <h2 className="text-center mt-5">Unauthorized</h2>;

    return (
        <>
            <style>{`
                .cm-page { padding: 24px 0 40px; }
                .cm-header {
                    margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border, #e5e7eb);
                    display: flex; flex-direction: column; align-items: center; width: 100%;
                }
                .cm-header h1 { font-size: 22px; font-weight: 800; color: var(--text, #0f172a); margin: 0 0 6px; text-align: center; }
                .cm-header p { font-size: 14px; color: var(--text-muted, #475569); margin: 0; text-align: center; }
                .cm-sidebar-card {
                    background: var(--bg, #fff);
                    border: 1px solid var(--border, #e5e7eb);
                    border-radius: 14px;
                    padding: 18px 16px;
                    margin-bottom: 12px;
                }
                .cm-iframe-wrapper {
                    position: relative;
                    border: 1px solid var(--border, #e5e7eb);
                    border-radius: 14px;
                    overflow: hidden;
                    background: #fff;
                    min-height: 600px;
                }
                .cm-iframe-loading {
                    position: absolute; inset: 0;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    background: #fff; z-index: 2; gap: 12px; transition: opacity 0.3s ease;
                }
                .cm-iframe-loading.hidden { opacity: 0; pointer-events: none; }
                .cm-iframe-loading span { font-size: 14px; color: var(--text-muted, #475569); font-weight: 500; }
                .cm-iframe { display: block; border: none; width: 100%; height: 600px; }
                .cm-empty-state {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    min-height: 600px; padding: 40px;
                    border: 1px solid var(--border, #e5e7eb);
                    border-radius: 14px; background: #fff;
                    text-align: center;
                }
                .cm-empty-state h5 { font-size: 15px; font-weight: 600; color: var(--text, #0f172a); margin: 0 0 8px; }
                .cm-empty-state p { font-size: 14px; color: var(--text-muted, #475569); margin: 0; }
@media (prefers-reduced-motion: reduce) { .cm-iframe-loading { transition: none; } }
            `}</style>

            <div className="container-fluid cm-page">

                <div className="cm-header">
                    <h1>CRC Mortality — Spain</h1>
                    <p>Subnational CRC mortality and risk factor patterns.</p>
                </div>

                <div className="row g-3">

                    {/* Left filter sidebar */}
                    <div className="col-xl-2 col-lg-3">
                        <div className="cm-sidebar-card">
                            <span className="filter-label">Regions</span>
                            <SpainRegionFilter
                                selectedRegions_lst={selectedRegions_lst}
                                set_selectedRegions={set_selectedRegions}
                            />
                        </div>
                        {isRegionSelected && (
                            <div className="cm-sidebar-card">
                                <span className="filter-label">Year range</span>
                                <YearFilter
                                    minYear_int={minYear_int}
                                    set_minYear={set_minYear}
                                    maxYear_int={maxYear_int}
                                    set_maxYear={set_maxYear}
                                />
                            </div>
                        )}
                        {isYearSelected && (
                            <div className="cm-sidebar-card">
                                <SexFilter
                                    selectedSex_int={selectedSex_int}
                                    set_selectedSex={set_selectedSex}
                                    sex_dictLst={sex_dictLst}
                                />
                            </div>
                        )}
                    </div>

                    {/* Center: chart iframe */}
                    <div className="col-xl-8 col-lg-6">
                        {!isAllFiltersSelected ? (
                            <div className="cm-empty-state">
                                <h5>CRC Mortality Rates by Region</h5>
                                <p>
                                    Select a <strong>region</strong>, <strong>year range</strong>, and <strong>sex</strong> to view the chart.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="cm-iframe-wrapper">
                                    {iframeLoading && (
                                        <div className="cm-iframe-loading">
                                            <div className="spinner" aria-label="Loading chart" />
                                            <span>Loading chart…</span>
                                        </div>
                                    )}
                                    <iframe
                                        id="embeddedPanel_id"
                                        className="cm-iframe"
                                        src={iFrame_url}
                                        title="CRC Mortality chart"
                                        onLoad={() => setIframeLoading(false)}
                                    />
                                </div>
                                <div className="mt-3">
                                    <SaveGraphButton iframeUrl={{ url: iFrame_url }} />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right: source + comments */}
                    <div className="col-xl-2 col-lg-3">
                        <Accordion defaultActiveKey="-1" className="app-accordion" style={{ marginBottom: "16px" }}>
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>Source</Accordion.Header>
                                <Accordion.Body className="text-start">
                                    <p>Spanish Ministry of Health — CRC mortality data by autonomous community (1999–2022).</p>
                                    <p style={{ marginTop: "6px" }}>
                                        <a
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            href="https://pestadistico.inteligenciadegestion.sanidad.gob.es/publicoSNS/I/mortalidad-por-causa-de-muerte/listado-de-causas-del-ministerio-de-sanidad-a-partir-de-1999/tasas-de-mortalidad-ajustadas-por-edad"
                                            style={{ color: "var(--brand, #1f6580)", fontSize: "13px" }}
                                        >
                                            View source ↗
                                        </a>
                                    </p>
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                        <Comments />
                    </div>

                </div>
            </div>
        </>
    );
};

export default CRCmortalityPanel;

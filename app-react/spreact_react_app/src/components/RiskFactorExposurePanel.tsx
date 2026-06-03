import React, { useState, useEffect } from "react";
import Unauthorized from './Unauthorized';
import * as AuthService from "../services/auth.service.tsx";
import { useLocation } from "react-router-dom";
import CountryFilter from "./CountryFilter.tsx";
import YearFilter from "./YearFilter.tsx";
import FactorFilter from "./FactorFilter.tsx";
import Glossary from "./Glossary.tsx";
import SexFilter from "./SexFilter.tsx";
import AgeFilter from "./AgeFilter.tsx";
import RiskFactorExposureFilter from "./RiskFactorExposureFilter.tsx";
import Comments from "./Comments.tsx";
import SaveGraphButton from "./SaveGraphButton.tsx";

const grafana_host = import.meta.env.VITE_GRAFANA_HOST;
const grafana_port = import.meta.env.VITE_GRAFANA_PORT;
const grafana_path = import.meta.env.VITE_GRAFANA_PATH;
const dashboard_name = import.meta.env.VITE_GRAFANA_DASHBOARD;
const grafana_url = `${window.location.protocol}//${grafana_host}:${grafana_port}/${grafana_path}/${dashboard_name}?orgId=1&theme=light`;

const sex_dictLst = [
    { value: 0, label: "Both Sexes", var_filter: "Both" },
    { value: 1, label: "Male", var_filter: "Male" },
    { value: 2, label: "Female", var_filter: "Female" },
];

const age_dictLst = [
    { value: 0, label: "Age Standardized Rate (ASR)", var_filter: "Age-standardized" },
    { value: 1, label: "Under 25", var_filter: "Under 25" },
    { value: 2, label: "25 to 50", var_filter: "25 to 50" },
    { value: 3, label: "Above 50", var_filter: "Above 50" },
];

const riskFactorExposure_dictLst = [
    { value: 0, label: "Diet low in whole grains" },
    { value: 1, label: "Diet low in milk" },
    { value: 2, label: "Diet high in red meat" },
    { value: 3, label: "Diet low in calcium" },
    { value: 4, label: "Diet low in fiber" },
    { value: 5, label: "Diet high in processed meat" },
    { value: 6, label: "Alcohol use", var_filter: "Alcohol use" },
    { value: 7, label: "Smoking", var_filter: "Smoking" },
    { value: 8, label: "Low Physical Activity", var_filter: "Low Physical Activity" },
    { value: 9, label: "High Body-Mass Index", var_filter: "High Body-Mass Index" },
];

const crcFactors_dictLst = [
    { value: 0, label: "CRC Incidence", var_filter: "CRC_incidence_val_Rate" },
    { value: 1, label: "DALYs", var_filter: "Colon and rectum cancer_Rate_DALYs_val" },
    { value: 2, label: "YLDs", var_filter: "Colon and rectum cancer_Rate_YLDs_val" },
    { value: 3, label: "YLLs", var_filter: "Colon and rectum cancer_Rate_YLLs_val" },
];

const RiskFactorExposurePanel: React.FC = () => {
    const location = useLocation();
    const savedIframeUrl = location.state?.iframeUrl;

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [iframeLoading, setIframeLoading] = useState(true);

    const [selectedCountries_lst, set_selectedCountries] = useState(["Belgium", "Greece", "Italy"]);
    const [selectedFactor_str, set_selectedFactor] = useState('');
    const [selectedRiskFactorExposure_int, set_selectedRiskFactorExposure] = useState(0);
    const [minYear_int, set_minYear] = useState(1990);
    const [maxYear_int, set_maxYear] = useState(2021);
    const [selectedSex_int, set_selectedSex] = useState<number | null>(0);
    const [selectedAge_int, set_selectedAge] = useState(0);
    const [selectedAnalysis_int, set_selectedAnalysis] = useState(0);
    const [selectedCrcFactors_int, set_selectedCrcFactors] = useState(0);

    useEffect(() => {
        setIsLoggedIn(AuthService.isLoggedIn());
    }, []);

    useEffect(() => {
        if (!savedIframeUrl) return;

        const url = new URL(savedIframeUrl);
        const params = new URLSearchParams(url.search);

        set_selectedCountries(params.getAll("var-country_filter"));
        set_minYear(parseInt(params.get("var-minyear_filter") || "1990"));
        set_maxYear(parseInt(params.get("var-maxyear_filter") || "2021"));

        const sexIndex = sex_dictLst.findIndex(s => s.var_filter === params.get("var-sex_filter"));
        if (sexIndex !== -1) set_selectedSex(sexIndex);

        const ageIndex = age_dictLst.findIndex(a => a.var_filter === params.get("var-age_filter"));
        if (ageIndex !== -1) set_selectedAge(ageIndex);

        const crcIndex = crcFactors_dictLst.findIndex(f => f.var_filter === params.get("var-crcFactor_filter"));
        if (crcIndex !== -1) set_selectedCrcFactors(crcIndex);

        const rfParam = params.get("var-riskFactor_filter");
        const dietParam = params.get("var-diet_type_filter");
        if (rfParam) {
            const rfIndex = riskFactorExposure_dictLst.findIndex(rf => rf.var_filter === rfParam);
            if (rfIndex !== -1) set_selectedRiskFactorExposure(rfIndex);
        } else if (dietParam) {
            const dietIndex = riskFactorExposure_dictLst.findIndex(d => d.label === dietParam);
            if (dietIndex !== -1) set_selectedRiskFactorExposure(dietIndex);
        }

        const factorFilter = params.get("var-factor_filter");
        if (factorFilter) set_selectedFactor(factorFilter);
    }, [savedIframeUrl]);

    useEffect(() => {
        const rfVal = riskFactorExposure_dictLst[selectedRiskFactorExposure_int]?.value;
        set_selectedAnalysis([0, 1, 2, 3, 4, 5].includes(rfVal) ? 1 : 2);
    }, [selectedRiskFactorExposure_int]);

    if (!isLoggedIn) return <Unauthorized />;

    const buildIframeUrl = (panelId: number, isDiet: boolean = false) => {
        const countryParams = selectedCountries_lst.map(c => `var-country_filter=${encodeURIComponent(c)}`).join("&");
        const yearParams = `var-minyear_filter=${minYear_int}&var-maxyear_filter=${maxYear_int}`;
        const sex = sex_dictLst[selectedSex_int ?? 0]?.var_filter ?? "Both";
        const age = age_dictLst[selectedAge_int]?.var_filter ?? "Age-standardized";
        const crc = crcFactors_dictLst[selectedCrcFactors_int]?.var_filter ?? crcFactors_dictLst[0].var_filter;
        const parts = [
            countryParams,
            yearParams,
            selectedFactor_str ? `var-factor_filter=${encodeURIComponent(selectedFactor_str)}` : "",
            `var-sex_filter=${encodeURIComponent(sex)}`,
            `var-crcFactor_filter=${encodeURIComponent(crc)}`,
            `var-age_filter=${encodeURIComponent(age)}`,
        ];

        if (isDiet) {
            const dietType = riskFactorExposure_dictLst[selectedRiskFactorExposure_int].label;
            parts.push(`var-diet_type_filter=${encodeURIComponent(dietType)}`);
        } else {
            const rf = riskFactorExposure_dictLst[selectedRiskFactorExposure_int].var_filter;
            parts.push(`var-riskFactor_filter=${encodeURIComponent(rf ?? "")}`);
        }

        return `${grafana_url}&panelId=${panelId}&${parts.filter(Boolean).join("&")}`;
    };

    const isDiet = selectedAnalysis_int === 1;
    const currentIframeUrl = isDiet ? buildIframeUrl(5, true) : buildIframeUrl(8, false);

    return (
        <>
            <style>{`
                .rf-page { padding: 24px 0 40px; }

                .rf-header { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border, #e5e7eb); }
                .rf-header h1 { font-size: 22px; font-weight: 800; color: var(--text, #0f172a); margin: 0 0 3px; }
                .rf-header p { font-size: 14px; color: var(--text-muted, #475569); margin: 0; }

                .rf-sidebar-card {
                    background: var(--bg, #fff);
                    border: 1px solid var(--border, #e5e7eb);
                    border-radius: 14px;
                    padding: 18px 16px;
                    margin-bottom: 12px;
                }
                .rf-sidebar-card .filter-label {
                    display: block;
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--text-muted, #475569);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    margin-bottom: 8px;
                }

                .rf-iframe-wrapper {
                    position: relative;
                    border: 1px solid var(--border, #e5e7eb);
                    border-radius: 14px;
                    overflow: hidden;
                    background: #fff;
                    min-height: 600px;
                }
                .rf-iframe-loading {
                    position: absolute; inset: 0;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    background: #fff;
                    z-index: 2;
                    gap: 12px;
                    transition: opacity 0.3s ease;
                }
                .rf-iframe-loading.hidden { opacity: 0; pointer-events: none; }
                .rf-iframe-loading span { font-size: 14px; color: var(--text-muted, #475569); font-weight: 500; }
                .rf-iframe { display: block; border: none; width: 100%; height: 600px; }

                @media (prefers-reduced-motion: reduce) {
                    .rf-iframe-loading { transition: none; }
                }
            `}</style>

            <div className="container-fluid rf-page">

                <div className="rf-header">
                    <h1>CRC Risk Factor Exposure</h1>
                    <p>Descriptive SEV levels across subgroups and years.</p>
                </div>

                <div className="row g-3">

                    {/* Left filter sidebar */}
                    <div className="col-xl-2 col-lg-3">
                        <div className="rf-sidebar-card">
                            <RiskFactorExposureFilter
                                selectedRiskFactorExposure_int={selectedRiskFactorExposure_int}
                                set_selectedRiskFactorExposure={set_selectedRiskFactorExposure}
                                riskFactorExposure_dictLst={riskFactorExposure_dictLst}
                            />
                        </div>
                        <div className="rf-sidebar-card">
                            <span className="filter-label">Countries</span>
                            <CountryFilter
                                selectedCountries_lst={selectedCountries_lst}
                                set_selectedCountries={set_selectedCountries}
                            />
                        </div>
                        <div className="rf-sidebar-card">
                            <span className="filter-label">Year range</span>
                            <YearFilter
                                minYear_int={minYear_int}
                                set_minYear={set_minYear}
                                maxYear_int={maxYear_int}
                                set_maxYear={set_maxYear}
                            />
                        </div>
                        <div className="rf-sidebar-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            <FactorFilter selectedFactor_str={selectedFactor_str} set_selectedFactor={set_selectedFactor} />
                            <SexFilter selectedSex_int={selectedSex_int} set_selectedSex={set_selectedSex} sex_dictLst={sex_dictLst} />
                            <AgeFilter selectedAge_int={selectedAge_int} set_selectedAge={set_selectedAge} age_dictLst={age_dictLst} />
                        </div>
                    </div>

                    {/* Center: chart iframe */}
                    <div className="col-xl-8 col-lg-6">
                        <div className="rf-iframe-wrapper">
                            {iframeLoading && (
                                <div className="rf-iframe-loading">
                                    <div className="spinner" aria-label="Loading chart" />
                                    <span>Loading chart…</span>
                                </div>
                            )}
                            <iframe
                                className="rf-iframe"
                                src={currentIframeUrl}
                                title="CRC Risk Factor Exposure"
                                onLoad={() => setIframeLoading(false)}
                            />
                        </div>
                        <div className="mt-3">
                            <SaveGraphButton iframeUrl={{ url: currentIframeUrl }} />
                        </div>
                    </div>

                    {/* Right: glossary + comments */}
                    <div className="col-xl-2 col-lg-3">
                        <div style={{ marginBottom: "16px" }}>
                            <Glossary />
                        </div>
                        <Comments />
                    </div>

                </div>
            </div>
        </>
    );
};

export default RiskFactorExposurePanel;

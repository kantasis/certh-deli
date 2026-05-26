import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service.tsx";
import Comments from "./Comments.tsx";
import { useLocation } from "react-router-dom";
import SaveGraphButton from "./SaveGraphButton.tsx";

const riskFactorSpainRegion_dictLst = [
    { value: "OW2017", label: "2017 - BMI (25-30), >18 years old" },
    { value: "OBE2017", label: "2017 - BMI (>30), >18 years old" },
    { value: "SMO2017", label: "2017 - > 15 years old daily smoking" },
    { value: "ALC2017", label: "2017 - > 15 years old daily drinking" },
    { value: "SED2017", label: "2017 - Sedentarism" },
    { value: "PR2023", label: "2023 - Poverty Risk % persons living below poverty line" },
    { value: "PCI2023", label: "2023 - Per capita income (Euros)" },
];

const SpanishRiskFactorsDataPanel: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [iframeLoading, setIframeLoading] = useState(true);
    const [selectedRiskFactor, setSelectedRiskFactor] = useState("");

    const location = useLocation();
    const savedIframeUrl = location.state?.iframeUrl;

    useEffect(() => {
        setIsLoggedIn(AuthService.isLoggedIn());
    }, []);

    useEffect(() => {
        if (!savedIframeUrl) return;
        const url = new URL(savedIframeUrl);
        const params = new URLSearchParams(url.search);
        const riskFactor = params.get("var-riskFactorRegion_filter");
        if (riskFactor) setSelectedRiskFactor(riskFactor);
    }, [savedIframeUrl]);

    const grafana_host = import.meta.env.VITE_GRAFANA_HOST;
    const grafana_port = import.meta.env.VITE_GRAFANA_PORT;
    const grafana_path = import.meta.env.VITE_GRAFANA_PATH;
    const dashboard_name = import.meta.env.VITE_GRAFANA_DASHBOARD;

    const grafana_url = `${window.location.protocol}//${grafana_host}:${grafana_port}/${grafana_path}/${dashboard_name}?orgId=1&theme=light`;
    const panelLabel = localStorage.getItem("lit03Panel");
    const getUriParams = () => `panelId=10&var-riskFactorRegion_filter=${selectedRiskFactor}&panelLabel=${panelLabel}`;
    const iFrame_url = `${grafana_url}&${getUriParams()}`;

    if (!isLoggedIn) return <h2 className="text-center mt-5">Unauthorized</h2>;

    return (
        <>
            <style>{`
                .srf-page { padding: 8px 0 40px; }

                .srf-sidebar-card {
                    background: var(--bg, #fff);
                    border: 1px solid var(--border, #e5e7eb);
                    border-radius: 14px;
                    padding: 18px 16px;
                    margin-bottom: 12px;
                }

                .srf-iframe-wrapper {
                    position: relative;
                    border: 1px solid var(--border, #e5e7eb);
                    border-radius: 14px;
                    overflow: hidden;
                    background: #fff;
                    min-height: 500px;
                }
                .srf-iframe-loading {
                    position: absolute; inset: 0;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    background: #fff;
                    z-index: 2;
                    gap: 12px;
                    transition: opacity 0.3s ease;
                }
                .srf-iframe-loading.hidden { opacity: 0; pointer-events: none; }
                .srf-iframe-loading span { font-size: 14px; color: var(--text-muted, #475569); font-weight: 500; }
                .srf-iframe { display: block; border: none; width: 100%; height: 500px; }

                .srf-placeholder { text-align: center; padding: 60px 24px; }
                .srf-placeholder h5 { font-size: 15px; font-weight: 500; color: var(--text-muted, #475569); line-height: 1.65; margin: 0 auto 12px; max-width: 480px; }

                .srf-src-card { border: 1px solid var(--border, #e5e7eb); border-radius: 10px; overflow: hidden; margin-bottom: 6px; }
                .srf-src-title { font-size: 14px; font-weight: 600; color: var(--text, #0f172a); padding: 10px 14px; background: var(--bg, #fff); border-bottom: 1px solid var(--border, #e5e7eb); }
                .srf-src-body { font-size: 14px; line-height: 1.6; padding: 12px 14px; color: var(--text, #0f172a); }
                .srf-src-body a { color: var(--brand, #1f6580); text-decoration: none; }
                .srf-src-body a:hover { color: var(--brand-dark, #185569); text-decoration: underline; }

                @media (prefers-reduced-motion: reduce) {
                    .srf-iframe-loading { transition: none; }
                }
            `}</style>

            <div className="container-fluid srf-page">
                <div className="row g-3">

                    {/* ── Left sidebar ── */}
                    <div className="col-xl-2 col-lg-3">
                        <div className="srf-sidebar-card">
                            <span className="filter-label">Risk Factor</span>
                            <select
                                className="form-select"
                                value={selectedRiskFactor}
                                onChange={(e) => { setSelectedRiskFactor(e.target.value); setIframeLoading(true); }}
                            >
                                <option value="" disabled>Select Risk Factor</option>
                                {riskFactorSpainRegion_dictLst.map((item) => (
                                    <option key={item.value} value={item.value}>{item.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* ── Center: chart ── */}
                    <div className="col-xl-8 col-lg-6">
                        {selectedRiskFactor ? (
                            <>
                                <div className="srf-iframe-wrapper">
                                    {iframeLoading && (
                                        <div className="srf-iframe-loading">
                                            <div className="spinner" aria-label="Loading chart" />
                                            <span>Loading chart…</span>
                                        </div>
                                    )}
                                    <iframe
                                        className="srf-iframe"
                                        src={iFrame_url}
                                        title="Spanish Risk Factors"
                                        onLoad={() => setIframeLoading(false)}
                                    />
                                </div>
                                <div className="mt-3">
                                    <SaveGraphButton iframeUrl={{ url: iFrame_url }} />
                                </div>
                            </>
                        ) : (
                            <div className="srf-placeholder">
                                <h5>Data on risk factors for CRC are presented by autonomous communities. Comparison of these frequencies makes it possible to identify the differences between autonomous communities.</h5>
                                <h5>Please select a risk factor from the dropdown menu on the left to display the data.</h5>
                            </div>
                        )}
                    </div>

                    {/* ── Right: source + comments ── */}
                    <div className="col-xl-2 col-lg-3">
                        <div className="srf-src-card">
                            <div className="srf-src-title">Source</div>
                            <div className="srf-src-body">
                                Spanish National Health Survey
                                <br />
                                <a target="_blank" rel="noopener noreferrer" href="https://www.sanidad.gob.es/estadEstudios/estadisticas/encuestaNacional/home.htm">
                                    sanidad.gob.es ↗
                                </a>
                            </div>
                        </div>
                        <Comments />
                    </div>

                </div>
            </div>
        </>
    );
};

export default SpanishRiskFactorsDataPanel;

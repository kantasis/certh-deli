import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service.tsx";
import Comments from "./Comments.tsx";
import SaveGraphButton from "./SaveGraphButton.tsx";
import { useLocation } from "react-router-dom";

const screeningMetrics = [
    { value: "COVERAGE", label: "Coverage of CRC screening (%)" },
    { value: "POSITIVE", label: "Positive cases (% over total tests)" },
];

const ScreeningDataPanel: React.FC = () => {
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
        const metric = params.get("selectedMetric");
        if (metric) setSelectedRiskFactor(metric);
    }, [savedIframeUrl]);

    const grafana_host = import.meta.env.VITE_GRAFANA_HOST;
    const grafana_port = import.meta.env.VITE_GRAFANA_PORT;
    const grafana_path = import.meta.env.VITE_GRAFANA_PATH;
    const dashboard_name = import.meta.env.VITE_GRAFANA_DASHBOARD;

    const grafana_url = `${window.location.protocol}//${grafana_host}:${grafana_port}/${grafana_path}/${dashboard_name}?orgId=1&theme=light`;
    const panelLabel = localStorage.getItem("lit03Panel");

    const getUriParams = () => {
        let selectedMetrics: string[] = [];
        switch (selectedRiskFactor) {
            case "COVERAGE": selectedMetrics = ["CS2017", "CS2019"]; break;
            case "POSITIVE": selectedMetrics = ["POS2017", "POS2019"]; break;
            default: selectedMetrics = [];
        }
        return selectedMetrics.map(m => `panelId=13&var-screening_data_metric=${m}&panelLabel=${panelLabel}&selectedMetric=${selectedRiskFactor}`).join("&");
    };

    const iFrame_url = `${grafana_url}&${getUriParams()}`;
    // console.log("iFrame URL:", iFrame_url);

    if (!isLoggedIn) return <h2 className="text-center mt-5">Unauthorized</h2>;

    return (
        <>
            <style>{`
                .sd-page { padding: 8px 0 40px; }

                .sd-sidebar-card {
                    background: var(--bg, #fff);
                    border: 1px solid var(--border, #e5e7eb);
                    border-radius: 14px;
                    padding: 18px 16px;
                    margin-bottom: 12px;
                }

                .sd-iframe-wrapper {
                    position: relative;
                    border: 1px solid var(--border, #e5e7eb);
                    border-radius: 14px;
                    overflow: hidden;
                    background: #fff;
                    min-height: 500px;
                }
                .sd-iframe-loading {
                    position: absolute; inset: 0;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    background: #fff;
                    z-index: 2;
                    gap: 12px;
                    transition: opacity 0.3s ease;
                }
                .sd-iframe-loading.hidden { opacity: 0; pointer-events: none; }
                .sd-iframe-loading span { font-size: 14px; color: var(--text-muted, #475569); font-weight: 500; }
                .sd-iframe { display: block; border: none; width: 100%; height: 500px; }

                .sd-placeholder { text-align: center; padding: 60px 24px; }
                .sd-placeholder h5 { font-size: 15px; font-weight: 500; color: var(--text-muted, #475569); line-height: 1.65; margin: 0 auto 12px; max-width: 480px; }

                .sd-src-card { border: 1px solid var(--border, #e5e7eb); border-radius: 10px; overflow: hidden; margin-bottom: 6px; }
                .sd-src-title { font-size: 14px; font-weight: 600; color: var(--text, #0f172a); padding: 10px 14px; background: var(--bg, #fff); border-bottom: 1px solid var(--border, #e5e7eb); }
                .sd-src-body { font-size: 14px; line-height: 1.6; padding: 12px 14px; color: var(--text, #0f172a); }
                .sd-src-body a { color: var(--brand, #1f6580); text-decoration: none; }
                .sd-src-body a:hover { color: var(--brand-dark, #185569); text-decoration: underline; }

                @media (prefers-reduced-motion: reduce) {
                    .sd-iframe-loading { transition: none; }
                }
            `}</style>

            <div className="container-fluid sd-page">
                <div className="row g-3">

                    {/* ── Left sidebar ── */}
                    <div className="col-xl-2 col-lg-3">
                        <div className="sd-sidebar-card">
                            <span className="filter-label">Screening Metric</span>
                            <select
                                className="form-select"
                                value={selectedRiskFactor}
                                onChange={(e) => { setSelectedRiskFactor(e.target.value); setIframeLoading(true); }}
                            >
                                <option value="" disabled>Select Screening Metric</option>
                                {screeningMetrics.map((item) => (
                                    <option key={item.value} value={item.value}>{item.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* ── Center: chart ── */}
                    <div className="col-xl-8 col-lg-6">
                        {selectedRiskFactor ? (
                            <>
                                <div className="sd-iframe-wrapper">
                                    {iframeLoading && (
                                        <div className="sd-iframe-loading">
                                            <div className="spinner" aria-label="Loading chart" />
                                            <span>Loading chart…</span>
                                        </div>
                                    )}
                                    <iframe
                                        className="sd-iframe"
                                        src={iFrame_url}
                                        title="Screening Data"
                                        onLoad={() => setIframeLoading(false)}
                                    />
                                </div>
                                <div className="mt-3">
                                    <SaveGraphButton iframeUrl={{ url: iFrame_url }} />
                                </div>
                            </>
                        ) : (
                            <div className="sd-placeholder">
                                <h5>Data on the coverage of CRC screening programmes by autonomous communities are presented, as well as the percentages of positivity.</h5>
                                <h5>Please select a screening data metric from the dropdown menu on the left to display the data.</h5>
                            </div>
                        )}
                    </div>

                    {/* ── Right: source + comments ── */}
                    <div className="col-xl-2 col-lg-3">
                        <div className="sd-src-card">
                            <div className="sd-src-title">Source</div>
                            <div className="sd-src-body">
                                Spanish network of cancer screening programs
                                <br />
                                <a target="_blank" rel="noopener noreferrer" href="https://cribadocancer.es/indicadores-cancer-colorrectal/">
                                    cribadocancer.es ↗
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

export default ScreeningDataPanel;

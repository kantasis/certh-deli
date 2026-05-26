import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service.tsx";
import PolicyFilter from "./PolicyFilter.tsx";
import { Accordion } from 'react-bootstrap';
import Comments from "./Comments.tsx";
import SaveGraphButton from "./SaveGraphButton.tsx";
import { useLocation } from "react-router-dom";


const grafana_host = import.meta.env.VITE_GRAFANA_HOST;
const grafana_port = import.meta.env.VITE_GRAFANA_PORT;
const grafana_path = import.meta.env.VITE_GRAFANA_PATH;
const dashboard_name = import.meta.env.VITE_GRAFANA_DASHBOARD;

const panel_id = 4;
const grafanaHost_url = `${window.location.protocol}//${grafana_host}:${grafana_port}`;
const grafana_url = `${grafanaHost_url}/${grafana_path}/${dashboard_name}?panelId=${panel_id}&orgId=1&theme=light`;

const PolicyPanel: React.FC = () => {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [iframeLoading, setIframeLoading] = useState(true);
    const [selectedPolicy_str, set_selectedPolicy] = useState('Alcohol Consumption');
    const [country_name, setCountryName] = useState('');
    const [policies_strLst, setPolicies] = useState<string[]>([]);
    const [bestPractices_str, setBestPractices] = useState('');

    const location = useLocation();
    const savedIframeUrl = location.state?.iframeUrl;

    useEffect(() => {
        if (!savedIframeUrl) return;
        const url = new URL(savedIframeUrl);
        const params = new URLSearchParams(url.search);
        const policyFilter = params.get("var-policy_filter");
        set_selectedPolicy(policyFilter ?? '');
    }, [savedIframeUrl]);

    useEffect(() => {
        setIsLoggedIn(AuthService.isLoggedIn());
    }, []);

    useEffect(() => {
        const handler = (event: MessageEvent) => {
            //  if (event.origin !== grafanaHost_url) return;
            if (event.data.type !== 'click-message') return;
            setCountryName(event.data['Country']);
            setPolicies(event.data['Policies']);
            setBestPractices(event.data['Best Practices']);
        };
        window.addEventListener("message", handler);
        return () => window.removeEventListener("message", handler);
    }, []);


    const getUriParams = () => `var-policy_filter=${encodeURIComponent(selectedPolicy_str)}`;
    const iFrame_url = `${grafana_url}&${getUriParams()}`;

    if (!isLoggedIn) return <h2 className="text-center mt-5">Unauthorized</h2>;

    const sources_dict: { [key: string]: string } = {
        'Austria': "Krebsrahmenprogramm Österreich 2014",
        'Belgium': "Joint Plan for the Chronically Ill-Integrated Care for Better Health",
        'Bulgaria': "NATIONAL PROGRAM FOR THE PREVENTION OF CHRONIC NON-COMMUNICABLE DISEASES -2014-2020 WORK PROGRAMME",
        'Croatia': "National Cancer Control Plan 2020-2030",
        'Cyprus': "National Cancer Plan 2019",
        'Chezh Republic': "National Cancer Control Plan  2030",
        'Denmark': "PATIENTS' CANCER PLAN CANCER PLAN IV",
        'Estonia': "Estonian Cancer Control Plan 2021-2030",
        'Finland': "National Cancer Plan II 2014-2025",
        'France': "FRANCE TEN-YEAR CANCER-CONTROL STRATEGY",
        'Germany': "Nationaler Krebsplan Handlungsfelder, Ziele und Umsetzungsempfehlungen & IN FORM Deutschlands Initiative für gesunde\tErnährung und\tmehr Bewegung Nationaler Aktionsplan zur Prävention von Fehlernährung, Bewegungsmangel, Übergewicht und damit zusammenhängenden Krankheiten",
        'Greece': "National Public Health Plan 2021-2025 (Provisions for cancer are incorporated)",
        'Hungary': "National Cancer Program (2006)No Update",
        'Ireland': "National Cancer Strategy 2017-2026 ",
        'Italy': "National Cancer Plan  2023-2027",
        'Latvia': "Public Health Guidelines 2014-2020",
        'Lithuania': "THE NATIONAL PROGRAM FOR THE PREVENTION AND CONTROL OF CANCER FOR THE PERIOD 2014-2025",
        'Luxemburg': "National Cancer Plan 2020-2024",
        'Malta': "National Cancer Plan 2017-2021 (No update available)",
        'Netherlands': "The Dutch Cancer Agenda (2023)",
        'Poland': "Program wieloletni pn. NARODOWA STRATEGIA ONKOLOGICZNA na lata 2020-2030 & National Cancer Strategy 2017-2024",
        'Portugal': "<a href='https://www.sns.gov.pt/sns/' target='_blank' >Saúde + – SNS</a>",
        'Romania': "Planul National de Combatere a Cancerului 2022",
        'Slovakia': "National Oncology Program  2021-2025 ",
        'Slovenia': "National Cancer Control Program 2022-2026",
        'Spain': "Estrategia en Cáncer del Sistema Nacional de Salud (2010) + Estrategia para el Abordaje de la Cronicidad  en el Sistema Nacional de Salud (2012)",
        'Sweden': "National Cancer Strategy 2009 (No update available)",
    };

    function capitalizeFirstLetter(str: string) {
        if (str && str.length > 0) return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        return str;
    }

    const filteredPolicies = policies_strLst.filter(p => p.trim() !== "Best Practices");
    const hasBestPractices = policies_strLst.some(p => p.trim().toLowerCase() === 'best practices');

    return (
        <>
            <style>{`
                .pp-page { padding: 24px 0 40px; }

                .pp-header { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border, #e5e7eb); }
                .pp-header h1 { font-size: 22px; font-weight: 800; color: var(--text, #0f172a); margin: 0 0 3px; }
                .pp-header p { font-size: 14px; color: var(--text-muted, #475569); margin: 0; }

                .pp-sidebar-card {
                    background: var(--bg, #fff);
                    border: 1px solid var(--border, #e5e7eb);
                    border-radius: 14px;
                    padding: 18px 16px;
                    margin-bottom: 12px;
                }
                .pp-sidebar-card .filter-label {
                    display: block;
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--text-muted, #475569);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    margin-bottom: 8px;
                }
                .pp-sidebar-desc {
                    font-size: 13.5px;
                    color: var(--text-muted, #475569);
                    line-height: 1.6;
                }

                .pp-iframe-wrapper {
                    position: relative;
                    border: 1px solid var(--border, #e5e7eb);
                    border-radius: 14px;
                    overflow: hidden;
                    background: #fff;
                    min-height: 600px;
                }
                .pp-iframe-loading {
                    position: absolute; inset: 0;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    background: #fff;
                    z-index: 2;
                    gap: 12px;
                    transition: opacity 0.3s ease;
                }
                .pp-iframe-loading.hidden { opacity: 0; pointer-events: none; }
                .pp-iframe-loading span { font-size: 14px; color: var(--text-muted, #475569); font-weight: 500; }
                .pp-iframe { display: block; border: none; width: 100%; height: 600px; }

                .pp-info-card {
                    margin-top: 16px;
                    background: var(--bg, #fff);
                    border: 1px solid var(--border, #e5e7eb);
                    border-radius: 14px;
                    padding: 20px;
                }
                .pp-info-card h6 {
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--text-muted, #475569);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    margin: 0 0 12px;
                }
                .pp-info-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .pp-info-field { font-size: 15px; color: var(--text, #0f172a); margin-bottom: 8px; line-height: 1.5; }
                .pp-info-field strong { color: var(--brand-dark, #185569); }
                .pp-policy-list { list-style: none; padding: 0; margin: 8px 0 0; }
                .pp-policy-list li {
                    padding: 6px 10px;
                    margin-bottom: 4px;
                    background: var(--muted, #f5f7fb);
                    border-radius: 8px;
                    font-size: 14px;
                    color: var(--text, #0f172a);
                }
                .pp-empty-info { font-size: 14px; color: var(--text-muted, #475569); font-style: italic; margin-top: 8px; }

                @media (prefers-reduced-motion: reduce) {
                    .pp-iframe-loading { transition: none; }
                }
            `}</style>

            <div className="container-fluid pp-page">

                <div className="pp-header">
                    <h1>CRC Policy Data</h1>
                    <p>EU policy and intervention mappings across domains.</p>
                </div>

                <div className="row g-3">

                    {/* ── Left sidebar ── */}
                    <div className="col-xl-2 col-lg-3">
                        <div className="pp-sidebar-card">
                            <PolicyFilter
                                selectedPolicy_str={selectedPolicy_str}
                                set_selectedPolicy={set_selectedPolicy}
                            />
                        </div>
                        <div className="pp-sidebar-card">
                            <p className="pp-sidebar-desc">
                                On this page you can see types and examples of current policies and interventions related to various domains of CRC prevention that are implemented across EU countries.
                            </p>
                        </div>
                    </div>

                    {/* ── Center chart + info ── */}
                    <div className="col-xl-8 col-lg-6">
                        <div className="pp-iframe-wrapper">
                            {iframeLoading && (
                                <div className="pp-iframe-loading">
                                    <div className="spinner" aria-label="Loading chart" />
                                    <span>Loading chart…</span>
                                </div>
                            )}
                            <iframe
                                className="pp-iframe"
                                src={iFrame_url}
                                title="CRC Policy Data"
                                onLoad={() => setIframeLoading(false)}
                            />
                        </div>
                        <div className="mt-3">
                            <SaveGraphButton iframeUrl={{ url: iFrame_url }} />
                        </div>

                        {country_name && (
                            <div className="pp-info-card">
                                <h6>Country details — {country_name}</h6>
                                <div className="pp-info-row">
                                    <div>
                                        <div className="pp-info-field">
                                            <strong>Best Practices:</strong>{" "}
                                            {hasBestPractices ? bestPractices_str : <span style={{ color: 'var(--text-muted, #475569)', fontStyle: 'italic' }}>No data available</span>}
                                        </div>
                                        <div className="pp-info-field">
                                            <strong>Sources</strong>:{" "}
                                            <span className="simpleList">
                                                {sources_dict[country_name] && country_name === 'Portugal' ? (
                                                    <span dangerouslySetInnerHTML={{ __html: sources_dict[country_name] }} />
                                                ) : (
                                                    capitalizeFirstLetter(sources_dict[country_name])
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <strong style={{ fontSize: '13px', color: 'var(--brand-dark, #185569)' }}>Policies:</strong>
                                        {filteredPolicies.length > 0 ? (
                                            <ul className="pp-policy-list">
                                                {filteredPolicies.map(p => <li key={p}>{p}</li>)}
                                            </ul>
                                        ) : (
                                            <p className="pp-empty-info">No policies identified for this domain.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Right: accordion + comments ── */}
                    <div className="col-xl-2 col-lg-3">
                        <Accordion defaultActiveKey="-1" className="app-accordion">
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>Methodology</Accordion.Header>
                                <Accordion.Body className="text-start">
                                    <ul className="simpleList">
                                        <li>
                                            CRC prevention policies and interventions as depicted in the standing national cancer plans, public health action plans, or equivalent documents from the 27 EU member states.
                                            Policy domains can be selected from a drop-down menu on the page
                                        </li>
                                    </ul>
                                </Accordion.Body>
                            </Accordion.Item>
                            <Accordion.Item eventKey="1">
                                <Accordion.Header>Definitions</Accordion.Header>
                                <Accordion.Body className="text-start">
                                    <ul className="simpleList">
                                        <li><strong>0 Policies:</strong> Country included in the mapping (27 EU MS) but no policies were identified in that particular policy domain in the standing national cancer plan / public health action plan or equivalent document.</li>
                                        <br />
                                        <li><strong>Unknown:</strong> Country was not included in the mapping (non EU MS)</li>
                                    </ul>
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

export default PolicyPanel;

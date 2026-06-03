import React, { useState, useEffect } from "react";
import Unauthorized from './Unauthorized';
import * as AuthService from "../services/auth.service.tsx";
import { Accordion } from 'react-bootstrap';
import Comments from "./Comments.tsx";

const grafana_host = import.meta.env.VITE_GRAFANA_HOST;
const grafana_port = import.meta.env.VITE_GRAFANA_PORT;
const grafana_path = import.meta.env.VITE_GRAFANA_PATH;
const dashboard_name = import.meta.env.VITE_GRAFANA_DASHBOARD;

const panel_id = 12;
const grafana_url = `${window.location.protocol}//${grafana_host}:${grafana_port}/${grafana_path}/${dashboard_name}?panelId=${panel_id}&orgId=1&theme=light`;

const accordionItems = [
    {
        title: 'Source',
        content: (
            <p>
                This data are very useful for the exchange of experts included in LIT-03, in order to
                illustrate the limited quality of the information available for decision making.
            </p>
        ),
    },
];

const CrcIncidenceDataPanel: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => AuthService.isLoggedIn());
    const [iframeLoading, setIframeLoading] = useState(true);

    useEffect(() => {
        setIsLoggedIn(AuthService.isLoggedIn());
    }, []);

    if (!isLoggedIn) return <Unauthorized />;

    return (
        <>
            <style>{`
                .ci-page { padding: 24px 0 40px; }

                .ci-header { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border, #e5e7eb); }
                .ci-header h1 { font-size: 20px; font-weight: 800; color: var(--text, #0f172a); margin: 0 0 3px; }
                .ci-header p { font-size: 14px; color: var(--text-muted, #475569); margin: 0; }

                .ci-iframe-wrapper {
                    position: relative;
                    border: 1px solid var(--border, #e5e7eb);
                    border-radius: 14px;
                    overflow: hidden;
                    background: #fff;
                    min-height: 600px;
                }
                .ci-iframe-loading {
                    position: absolute; inset: 0;
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    background: #fff;
                    z-index: 2;
                    gap: 12px;
                    transition: opacity 0.3s ease;
                }
                .ci-iframe-loading.hidden { opacity: 0; pointer-events: none; }
                .ci-iframe-loading span { font-size: 14px; color: var(--text-muted, #475569); font-weight: 500; }
                .ci-iframe { display: block; border: none; width: 100%; height: 600px; }

                /* Accordion — bigger fonts as requested */
                .ci-accordion .accordion-button {
                    font-size: 17px;
                    font-weight: 700;
                    color: var(--text, #0f172a);
                    padding: 14px 16px;
                    background: transparent;
                }
                .ci-accordion .accordion-button:not(.collapsed) {
                    color: var(--brand-dark, #185569);
                    background: #e8f2f6;
                    box-shadow: none;
                }
                .ci-accordion .accordion-button:focus { box-shadow: 0 0 0 3px rgba(31,101,128,0.15); }
                .ci-accordion .accordion-button::after { filter: none; }
                .ci-accordion .accordion-item {
                    border-color: var(--border, #e5e7eb);
                    border-radius: 12px;
                    overflow: hidden;
                }
                .ci-accordion .accordion-body {
                    font-size: 16px;
                    line-height: 1.65;
                    padding: 14px 16px;
                    color: var(--text-muted, #475569);
                }
                .ci-accordion .accordion-body p { margin: 0; font-size: 16px; line-height: 1.65; }

                @media (prefers-reduced-motion: reduce) {
                    .ci-iframe-loading { transition: none; }
                }
            `}</style>

            <div className="container-fluid ci-page">

                <div className="ci-header">
                    <h1>CRC Incidence Data</h1>
                    <p>Source data for CRC incidence used in the LIT-03 expert exchange</p>
                </div>

                <div className="row g-3">

                    {/* Chart iframe — wider since no filter sidebar */}
                    <div className="col-xl-9 col-lg-8">
                        <div className="ci-iframe-wrapper">
                            {iframeLoading && (
                                <div className="ci-iframe-loading">
                                    <div className="spinner" aria-label="Loading chart" />
                                    <span>Loading chart…</span>
                                </div>
                            )}
                            <iframe
                                id="embeddedPanel_id"
                                className="ci-iframe"
                                src={grafana_url}
                                title="CRC Incidence Data"
                                onLoad={() => setIframeLoading(false)}
                            />
                        </div>
                    </div>

                    {/* Right sidebar: accordion + comments */}
                    <div className="col-xl-3 col-lg-4">
                        <Accordion defaultActiveKey="0" className="ci-accordion" style={{ marginBottom: "16px" }}>
                            {accordionItems.map((item, idx) => (
                                <Accordion.Item eventKey={idx.toString()} key={idx}>
                                    <Accordion.Header>{item.title}</Accordion.Header>
                                    <Accordion.Body className="text-start">{item.content}</Accordion.Body>
                                </Accordion.Item>
                            ))}
                        </Accordion>
                        <Comments />
                    </div>

                </div>
            </div>
        </>
    );
};

export default CrcIncidenceDataPanel;

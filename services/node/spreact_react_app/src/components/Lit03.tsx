import React, { useState, useEffect } from "react";
import NewDash from "./CRCmortalityPanel";
import ScreeningDataPanel from "./ScreeningRiskFactorDataPanel";
import SpanishRiskFactors from "./SpanishRiskFactors";
import * as AuthService from "../services/auth.service.tsx";

const panelLabels: Record<string, string> = {
    NewDash: "CRC Mortality",
    ScreeningDataPanel: "Screening Data",
    SpanishRiskFactors: "Risk Factors",
};

const LIT03: React.FC = () => {
    const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(AuthService.isLoggedIn());
    }, []);

    useEffect(() => {
        if (selectedPanel) {
            localStorage.setItem("lit03Panel", selectedPanel);
        } else {
            const saved = localStorage.getItem("lit03Panel");
            if (saved) setSelectedPanel(saved);
        }
    }, [selectedPanel]);

    if (!isLoggedIn) return <h2 className="text-center mt-5">Unauthorized</h2>;

    const renderPanel = () => {
        switch (selectedPanel) {
            case "NewDash": return <NewDash />;
            case "ScreeningDataPanel": return <ScreeningDataPanel />;
            case "SpanishRiskFactors": return <SpanishRiskFactors />;
            default: return (
                <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                    <div style={{ maxWidth: '560px', margin: '0 auto 24px' }}>
                        <h5 style={{ fontWeight: 600, color: 'var(--text, #0f172a)', lineHeight: 1.6 }}>
                            This section presents data from the Autonomous Communities of Spain related to
                            mortality, risk factors, and CRC screening. Decision-making for CRC prevention
                            is performed at the subnational level — Spain has been selected for this analysis.
                        </h5>
                    </div>
                    <p style={{ color: 'var(--text-muted, #475569)', fontSize: '14px' }}>
                        Use the dropdown above to select and view the data.
                    </p>
                </div>
            );
        }
    };

    return (
        <>
            <style>{`
                .lit-page { padding: 24px 0 40px; }
                .lit-toolbar {
                    position: relative;
                    display: flex;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid var(--border, #e5e7eb);
                }
                .lit-select-wrap { display: flex; align-items: center; gap: 8px; }
                .lit-select-label {
                    font-size: 12px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase;
                    color: var(--brand, #1f6580); white-space: nowrap;
                }
                .lit-select {
                    font-size: 14px;
                    font-weight: 600;
                    padding: 7px 32px 7px 12px;
                    border: 1.5px solid var(--brand, #1f6580);
                    border-radius: 8px;
                    background: var(--bg, #fff);
                    color: var(--brand, #1f6580);
                    appearance: none;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%231f6580' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: right 10px center;
                    cursor: pointer;
                    min-width: 180px;
                }
                .lit-select:focus { outline: none; border-color: var(--brand-dark, #185569); box-shadow: 0 0 0 3px rgba(31,101,128,0.15); }
                .lit-viewing {
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 17px;
                    font-weight: 500;
                    color: var(--text-muted, #475569);
                    white-space: nowrap;
                }
                .lit-viewing strong { color: var(--text, #0f172a); font-weight: 700; }
            `}</style>

            <div className="container-fluid lit-page">
                <div className="lit-toolbar">
                    <div className="lit-select-wrap">
                        <span className="lit-select-label">View</span>
                        <select
                            className="lit-select"
                            value={selectedPanel || ""}
                            onChange={e => {
                                const value = e.target.value;
                                if (value === "") localStorage.setItem("lit03Panel", "");
                                setSelectedPanel(value || null);
                            }}
                        >
                            <option value="">Select a Panel</option>
                            {Object.entries(panelLabels).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    {selectedPanel && (
                        <span className="lit-viewing">
                            Viewing: <strong>{panelLabels[selectedPanel]}</strong>
                        </span>
                    )}
                </div>

                {renderPanel()}
            </div>
        </>
    );
};

export default LIT03;

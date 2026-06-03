import { useEffect, useState } from "react";
import Unauthorized from './Unauthorized';
import { Accordion } from 'react-bootstrap';
import Comments from "./Comments.tsx";
import * as AuthService from "../services/auth.service.tsx";

const accordionContent_dictLst = [
    {
        title: 'Pilot',
        content: (
            <div>
                <ul className="ps-3" style={{ margin: 0 }}>
                    <li style={{ marginBottom: 8 }}>
                        <strong>Pilot Objectives:</strong> To raise awareness of CRC risk factors and promote primary prevention strategies across diverse population groups. To investigate scalability and sustainability potential of effective piloted interventions.
                    </li>
                    <li style={{ marginBottom: 8 }}>
                        <strong>Pilot Location:</strong> Prefecture of Central Macedonia, Greece.
                    </li>
                    <li>
                        <strong>How the Pilot Works:</strong> We follow a data-driven lifecycle to identify and implement the most effective CRC primary prevention interventions:
                        <ol className="mt-2" style={{ paddingLeft: 16 }}>
                            <li style={{ marginBottom: 4 }}><strong>Analyze:</strong> Used DELI predictive analytics to project CRC incidence.</li>
                            <li style={{ marginBottom: 4 }}><strong>Prioritize:</strong> Identified modifiable risk factors with the highest potential for reduction.</li>
                            <li style={{ marginBottom: 4 }}><strong>Implement:</strong> Launched targeted interventions based on data insights.</li>
                            <li style={{ marginBottom: 4 }}><strong>Evaluate:</strong> Analyzed data via evaluation tools to measure real-world impact.</li>
                            <li><strong>Scale:</strong> Shape regulatory changes and support widespread adoption.</li>
                        </ol>
                    </li>
                </ul>
            </div>
        ),
    },
    {
        title: 'Definitions',
        content: (
            <ul className="ps-3" style={{ margin: 0 }}>
                <li style={{ marginBottom: 8 }}>
                    <strong>Domains:</strong> Policy fields identified by MoHGR during the policy mapping exercise.
                </li>
                <li style={{ marginBottom: 8 }}>
                    <strong>Interventions:</strong> Activities and programs addressing commonly acknowledged CRC risk factors implemented during the pilot.
                </li>
                <li>
                    <strong>Risk Factors:</strong> Factors sourced from the Global Burden of Disease (GBD) and linked to specific interventions via DELI analytics.
                </li>
            </ul>
        ),
    },
];

const interventionsData = [
    { name: "Support Smoking Cessation", category: "Smoking", riskFactors: ["Smoking"] },
    { name: "School policies to limit use tobacco products within school settings", category: "Smoking", riskFactors: ["Smoking"] },
    { name: "Smoking ban on all facilities admitting children & adolescents under 18 years old", category: "Smoking", riskFactors: ["Smoking"] },
    { name: "Awareness Campaigns", category: "Alcohol Consumption", riskFactors: ["Alcohol use"] },
    { name: "Actions for alcohol abuse prevention", category: "Alcohol Consumption", riskFactors: ["Alcohol use"] },
    {
        name: "Awareness Campaigns", category: "Diet & Eating Habits",
        riskFactors: ["Diet high in processed meat", "Diet high in red meat", "Diet high in trans fatty acids", "Diet low in calcium", "Diet low in fruits", "Diet low in vegetables", "Diet low in polyunsaturated fatty acids", "Diet low in seafood omega-3 fatty acids", "Diet low in whole grains"],
    },
    {
        name: "Custom nutritional guidelines to specific targeted groups", category: "Diet & Eating Habits",
        riskFactors: ["Diet high in processed meat", "Diet high in red meat", "Diet high in trans fatty acids", "Diet low in calcium", "Diet low in fruits", "Diet low in vegetables", "Diet low in polyunsaturated fatty acids", "Diet low in seafood omega-3 fatty acids", "Diet low in whole grains"],
    },
    { name: "Awareness Campaigns", category: "Physical Activity", riskFactors: ["High body-mass index", "Low physical activity", "High LDL cholesterol", "High systolic blood pressure"] },
    { name: "Development of Physical Activity Infrastructure", category: "Physical Activity", riskFactors: ["High body-mass index", "Low physical activity"] },
    {
        name: "Utilize Technology for Health Literacy Enhancement", category: "Health Literacy",
        riskFactors: ["Smoking/Tobacco", "Alcohol use", "Diet high in processed meat", "Diet high in red meat", "Diet high in trans fatty acids", "Diet low in calcium", "Diet low in fruits", "Diet low in vegetables", "Diet low in polyunsaturated fatty acids", "Diet low in seafood omega-3 fatty acids", "Diet low in whole grains", "High body-mass index", "Low physical activity", "High LDL cholesterol", "High systolic blood pressure"],
    },
    {
        name: "Dissemination of the European Code Against Cancer in schools, workplaces, healthcare settings", category: "Health Literacy",
        riskFactors: ["Smoking/Tobacco", "Alcohol use", "Diet high in processed meat", "Diet high in red meat", "Diet high in trans fatty acids", "Diet low in calcium", "Diet low in fruits", "Diet low in vegetables", "Diet low in polyunsaturated fatty acids", "Diet low in seafood omega-3 fatty acids", "Diet low in whole grains", "High body-mass index", "Low physical activity", "High LDL cholesterol", "High systolic blood pressure"],
    },
    {
        name: "Promotion of uptaking a healthy lifestyle & encouraging healthy aging", category: "Health Promotion",
        riskFactors: ["Smoking/Tobacco", "Alcohol use", "Diet high in processed meat", "Diet high in red meat", "Diet high in trans fatty acids", "Diet low in calcium", "Diet low in fruits", "Diet low in vegetables", "Diet low in polyunsaturated fatty acids", "Diet low in seafood omega-3 fatty acids", "Diet low in whole grains", "High body-mass index", "Low physical activity", "High LDL cholesterol", "High systolic blood pressure"],
    },
    {
        name: "Health promotion app/personalized cancer risk assessment", category: "Health Promotion",
        riskFactors: ["Smoking/Tobacco", "Alcohol use", "Diet high in processed meat", "Diet high in red meat", "Diet high in trans fatty acids", "Diet low in calcium", "Diet low in fruits", "Diet low in vegetables", "Diet low in polyunsaturated fatty acids", "Diet low in seafood omega-3 fatty acids", "Diet low in whole grains", "High body-mass index", "Low physical activity", "High LDL cholesterol", "High systolic blood pressure"],
    },
    {
        name: "Address inequalities through research", category: "R&D",
        riskFactors: ["Smoking/Tobacco", "Alcohol use", "Diet high in processed meat", "Diet high in red meat", "Diet high in trans fatty acids", "Diet low in calcium", "Diet low in fruits", "Diet low in vegetables", "Diet low in polyunsaturated fatty acids", "Diet low in seafood omega-3 fatty acids", "Diet low in whole grains", "High body-mass index", "Low physical activity", "High LDL cholesterol", "High systolic blood pressure"],
    },
];

const riskFactors = [
    "Smoking", "Alcohol use", "Diet high in processed meat", "Diet high in red meat",
    "Diet high in trans fatty acids", "Diet low in calcium", "Diet low in fruits",
    "Diet low in vegetables", "Diet low in polyunsaturated fatty acids",
    "Diet low in seafood omega-3 fatty acids", "Diet low in whole grains",
    "High body-mass index", "Low physical activity", "High LDL cholesterol",
    "High systolic blood pressure",
];

const domainMeta: Record<string, { bg: string; color: string }> = {
    "Smoking":           { bg: "#fee2e2", color: "#991b1b" },
    "Alcohol Consumption": { bg: "#fef3c7", color: "#92400e" },
    "Diet & Eating Habits": { bg: "#d1fae5", color: "#065f46" },
    "Physical Activity": { bg: "#dbeafe", color: "#1e40af" },
    "Health Literacy":   { bg: "#ede9fe", color: "#5b21b6" },
    "Health Promotion":  { bg: "#fce7f3", color: "#9d174d" },
    "R&D":               { bg: "#e0f2fe", color: "#0c4a6e" },
};

const LargeScaleIntervention = () => {
    const [selectedIntervention, setSelectedIntervention] = useState("");
    const [selectedRiskFactor, setSelectedRiskFactor] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(() => AuthService.isLoggedIn());

    useEffect(() => {
        setIsLoggedIn(AuthService.isLoggedIn());
    }, []);

    if (!isLoggedIn) return <Unauthorized />;

    const availableRiskFactors: string[] = selectedIntervention
        ? [...new Set(
            interventionsData
                .filter(item => item.name === selectedIntervention)
                .flatMap(item => item.riskFactors)
          )]
        : riskFactors;

    const handleInterventionChange = (value: string) => {
        setSelectedIntervention(value);
        if (value && selectedRiskFactor) {
            const newAvailable = [...new Set(
                interventionsData
                    .filter(item => item.name === value)
                    .flatMap(item => item.riskFactors)
            )];
            if (!newAvailable.includes(selectedRiskFactor)) setSelectedRiskFactor("");
        }
    };

    const filteredData = interventionsData.filter((item) => {
        const interventionMatch = selectedIntervention ? item.name === selectedIntervention : true;
        const riskMatch = selectedRiskFactor ? item.riskFactors.includes(selectedRiskFactor) : true;
        return interventionMatch && riskMatch;
    });

    return (
        <>
            <style>{`
                .li-page { padding: 24px 0 40px; }

                .li-header { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border, #e5e7eb); }
                .li-header h1 { font-size: 22px; font-weight: 800; color: var(--text, #0f172a); margin: 0 0 3px; }
                .li-header p { font-size: 14px; color: var(--text-muted, #475569); margin: 0; }

                .li-sidebar-card {
                    background: var(--bg, #fff);
                    border: 1px solid var(--border, #e5e7eb);
                    border-radius: 14px;
                    padding: 18px 16px;
                    margin-bottom: 12px;
                }
                .li-sidebar-card .filter-label {
                    display: block;
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--text-muted, #475569);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    margin-bottom: 8px;
                }

                .li-table-wrapper {
                    border: 1px solid var(--border, #e5e7eb);
                    border-radius: 14px;
                    overflow: hidden;
                    background: var(--bg, #fff);
                }
                .li-table { width: 100%; border-collapse: collapse; font-size: 15px; }
                .li-table thead th {
                    background: var(--muted, #f5f7fb);
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: var(--text-muted, #475569);
                    padding: 10px 14px;
                    border-bottom: 1px solid var(--border, #e5e7eb);
                    white-space: nowrap;
                    position: sticky;
                    top: 0;
                    z-index: 1;
                }
                .li-table tbody td {
                    padding: 10px 14px;
                    border-bottom: 1px solid var(--border, #e5e7eb);
                    color: var(--text, #0f172a);
                    vertical-align: top;
                    line-height: 1.5;
                }
                .li-table tbody tr:last-child td { border-bottom: none; }
                .li-table tbody tr:hover { background: var(--muted, #f5f7fb); transition: background 0.15s; }
                .li-intervention-name { font-weight: 600; font-size: 15px; }

                .li-domain-chip {
                    display: inline-flex;
                    align-items: center;
                    padding: 3px 10px;
                    border-radius: 20px;
                    font-size: 12.5px;
                    font-weight: 600;
                    white-space: nowrap;
                }

                .li-rf-tag {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 500;
                    margin: 2px 2px 2px 0;
                    background: var(--muted, #f5f7fb);
                    border: 1px solid var(--border, #e5e7eb);
                    color: var(--text-muted, #475569);
                }

                .li-legend { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
                .li-legend-item { display: flex; align-items: center; gap: 5px; font-size: 13px; color: var(--text-muted, #475569); }
                .li-legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

                .li-empty {
                    padding: 48px 16px;
                    text-align: center;
                    color: var(--text-muted, #475569);
                    font-size: 14px;
                }

                .li-count-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 20px;
                    height: 20px;
                    border-radius: 10px;
                    background: var(--brand, #0ea5a8);
                    color: #fff;
                    font-size: 12px;
                    font-weight: 700;
                    padding: 0 5px;
                    margin-left: 6px;
                }


                @media (prefers-reduced-motion: reduce) {
                    .li-table tbody tr { transition: none; }
                }
            `}</style>

            <div className="container-fluid li-page">

                <div className="li-header">
                    <h1>LIP2</h1>
                    <p>Pilot-specific analyses and integrated summaries.</p>
                </div>

                <div className="row g-3">

                    {/* ── Left sidebar ── */}
                    <div className="col-xl-2 col-lg-3">
                        <div className="li-sidebar-card">
                            <label className="filter-label" htmlFor="li-intervention-select">Intervention</label>
                            <select
                                id="li-intervention-select"
                                className="form-select"
                                value={selectedIntervention}
                                onChange={(e) => handleInterventionChange(e.target.value)}
                            >
                                <option value="">All Interventions</option>
                                {interventionsData.map((item, idx) => (
                                    <option key={idx} value={item.name}>
                                        {item.name} ({item.category})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="li-sidebar-card">
                            <label className="filter-label" htmlFor="li-rf-select">Risk Factor</label>
                            <select
                                id="li-rf-select"
                                className="form-select"
                                value={selectedRiskFactor}
                                onChange={(e) => setSelectedRiskFactor(e.target.value)}
                            >
                                <option value="">All Risk Factors</option>
                                {riskFactors.map((rf, idx) => {
                                    const available = availableRiskFactors.includes(rf);
                                    return (
                                        <option key={idx} value={rf} disabled={!available}
                                            style={{ color: available ? undefined : "#9ca3af" }}>
                                            {rf}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                    </div>

                    {/* ── Center: table ── */}
                    <div className="col-xl-8 col-lg-6">
                        <div className="li-table-wrapper">
                            {filteredData.length === 0 ? (
                                <div className="li-empty">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ marginBottom: 10, opacity: 0.4 }} aria-hidden="true">
                                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                    </svg>
                                    <div>No interventions match the selected filters.</div>
                                </div>
                            ) : (
                                <table className="li-table">
                                    <thead>
                                        <tr>
                                            <th>
                                                Intervention
                                                <span className="li-count-badge">{filteredData.length}</span>
                                            </th>
                                            <th>Domain</th>
                                            <th>Related Risk Factors</th>
                                            <th>Effectiveness</th>
                                            <th>Relevant Recommendations</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.map((row, idx) => {
                                            const meta = domainMeta[row.category] ?? { bg: "#f3f4f6", color: "#374151" };
                                            return (
                                                <tr key={idx}>
                                                    <td style={{ minWidth: 200 }}>
                                                        <span className="li-intervention-name">{row.name}</span>
                                                    </td>
                                                    <td style={{ whiteSpace: "nowrap" }}>
                                                        <span
                                                            className="li-domain-chip"
                                                            style={{ background: meta.bg, color: meta.color }}
                                                        >
                                                            {row.category}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {row.riskFactors.map((rf, i) => (
                                                            <span key={i} className="li-rf-tag">{rf}</span>
                                                        ))}
                                                    </td>
                                                    <td></td>
                                                    <td></td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* ── Right: accordion + comments ── */}
                    <div className="col-xl-2 col-lg-3">
                        <div style={{ marginBottom: "16px" }}>
                            <Accordion defaultActiveKey="-1" className="app-accordion">
                                {accordionContent_dictLst.map((item, idx) => (
                                    <Accordion.Item eventKey={idx.toString()} key={idx}>
                                        <Accordion.Header>{item.title}</Accordion.Header>
                                        <Accordion.Body className="text-start">{item.content}</Accordion.Body>
                                    </Accordion.Item>
                                ))}
                            </Accordion>
                        </div>
                        <Comments />
                    </div>

                </div>
            </div>
        </>
    );
};

export default LargeScaleIntervention;

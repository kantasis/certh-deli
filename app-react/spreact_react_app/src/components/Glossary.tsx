import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service.tsx";
import { Accordion } from 'react-bootstrap';

const accordionItems = [
    {
        title: 'Data Sources',
        content: (
            <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                <ul className="ps-3" style={{ margin: 0 }}>
                    <li><strong>Source:</strong> Global Burden of Disease Study 2021</li>
                    <li><strong>Years:</strong> 1990–2021</li>
                    <li><strong>Geographic Coverage:</strong> 46 countries in Europe</li>
                    <li><strong>Age Groups:</strong> Under 25, 25–50, Above 50, Age-Standardized</li>
                    <li><strong>Sex Groups:</strong> Both Sexes, Males, Females</li>
                    <li><strong>CRC Incidence Rate:</strong> New CRC cases per 100,000 population per year</li>
                    <li><strong>Risk factors:</strong> 22 factors — lifestyle, nutrition, comorbidities, socioeconomic</li>
                    <li><strong>SEV rates:</strong> Relative risk-weighted prevalence of exposure (21 risk factors)</li>
                </ul>
            </div>
        ),
    },
    {
        title: 'Summary Exposure Value (SEV)',
        content: (
            <p>Measure of a population's exposure to a risk factor that takes into account the extent of exposure by risk level and the severity of that risk's contribution to disease burden.</p>
        ),
    },
    {
        title: 'Deaths',
        content: <p>Number of deaths in the population per 100,000.</p>,
    },
    {
        title: 'Disability Adjusted Life Years (DALYs)',
        content: <p>Number of DALYs in the population per 100,000.</p>,
    },
    {
        title: 'Years of Life Lost (YLLs)',
        content: <p>Number of YLLs in the population per 100,000.</p>,
    },
    {
        title: 'Years Lived with Disability (YLDs)',
        content: <p>Number of YLDs in the population per 100,000.</p>,
    },
];

const Glossary: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(AuthService.isLoggedIn());
    }, []);

    if (!isLoggedIn) return null;

    return (
        <>
            <style>{`
                .gl-accordion .accordion-button {
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--text, #0f172a);
                    padding: 10px 14px;
                    background: transparent;
                }
                .gl-accordion .accordion-button:not(.collapsed) {
                    color: var(--brand-dark, #185569);
                    background: #e8f2f6;
                    box-shadow: none;
                }
                .gl-accordion .accordion-button:focus { box-shadow: 0 0 0 3px rgba(31,101,128,0.15); }
                .gl-accordion .accordion-item { border-color: var(--border, #e5e7eb); }
                .gl-accordion .accordion-body {
                    font-size: 13px;
                    line-height: 1.6;
                    padding: 12px 14px;
                    color: var(--text-muted, #475569);
                }
                .gl-accordion .accordion-body p { margin: 0; font-size: 13px; line-height: 1.6; }
                .gl-accordion .accordion-body ul { font-size: 13px; line-height: 1.6; }
                .gl-accordion .accordion-body li + li { margin-top: 6px; }
            `}</style>
            <Accordion defaultActiveKey="-1" className="gl-accordion">
                {accordionItems.map((item, idx) => (
                    <Accordion.Item eventKey={idx.toString()} key={idx}>
                        <Accordion.Header>{item.title}</Accordion.Header>
                        <Accordion.Body className="text-start">{item.content}</Accordion.Body>
                    </Accordion.Item>
                ))}
            </Accordion>
        </>
    );
};

export default Glossary;

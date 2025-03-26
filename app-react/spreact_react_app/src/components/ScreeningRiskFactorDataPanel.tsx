import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import { Accordion } from "react-bootstrap";
import * as AuthService from "../services/auth.service.tsx";

// Interface for the properties of this component
interface FilterProps {
    selectedRiskFactor: string;
    setSelectedRiskFactor: (value: string) => void;
    riskFactorSpainRegion_dictLst: Array<{ value: string; label: string }>;
}

const RiskFactorSpainRegionFilter: React.FC<FilterProps> = ({
    selectedRiskFactor,
    setSelectedRiskFactor,
    riskFactorSpainRegion_dictLst
}) => {
    // Categorize data into Screening and Risk Factors
    const screeningData = riskFactorSpainRegion_dictLst.filter(item =>
        ["CS2017", "POS2017","CS2019" ,"POS2019","PR2023"].includes(item.value)
    );
//"OW2017", "OBE2017", "SMO2017", "ALC2017", "SED2017"
    const riskFactors = riskFactorSpainRegion_dictLst.filter(item =>
        !["CS2017", "POS2017","CS2019" ,"POS2019","PR2023"].includes(item.value)
    );


    return (
        <>
            {/* Dropdown for Screening Data */}
            <label className="form-label"><h6><strong>Select Screening Data</strong></h6></label>
            <Form.Control
                as="select"
                value={screeningData.some(item => item.value === selectedRiskFactor) ? selectedRiskFactor : ""}
                onChange={(e) => setSelectedRiskFactor(e.target.value)}
            >
                <option value="" disabled>Select Screening Data</option>
                {screeningData.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                ))}
            </Form.Control>

            {/* Dropdown for Risk Factors */}
            <label className="form-label mt-3"><h6><strong>Select Risk Factor</strong></h6></label>
            <Form.Control
                as="select"
                value={riskFactors.some(item => item.value === selectedRiskFactor) ? selectedRiskFactor : ""}
                onChange={(e) => setSelectedRiskFactor(e.target.value)}
            >
                <option value="" disabled>Select Risk Factor</option>
                {riskFactors.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                ))}
            </Form.Control>
        </>
    );
};

const ScreeningRiskFactorDataPanel: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // List of available screening and risk factors
    const riskFactorSpainRegion_dictLst = [
        { value: "CS2017", label: "CS2017 - Coverage of CRC screening (%)" },
        { value: "POS2017", label: "POS2017 - Positive cases (% over total tests)" },
        { value: "OW2017", label: "OW2017 - BMI (25-30), >18 years old" },
        { value: "OBE2017", label: "OBE2017 - BMI (>30), >18 years old" },
        { value: "SMO2017", label: "SMO2017 - > 15 years old daily smoking" },
        { value: "ALC2017", label: "ALC2017 - > 15 years old daily drinking" },
        { value: "SED2017", label: "SED2017 - Sedentarism" },
        { value: "CS2019", label: "CS2019 - Coverage of CRC screening (%)" },
        { value: "POS2019", label: "POS2019 - Positive cases (% over total tests)" },
        { value: "PR2023", label: "PR2023 - Positive cases (% over total tests)" },
        { value: "PCI2023", label: "PCI2023 - Per capita income (Euros)" },
    ];

    // Use state to store the selected risk factor
    const [selectedRiskFactor, setSelectedRiskFactor] = useState(riskFactorSpainRegion_dictLst[0].value);

    // Grafana environment variables
    const grafana_host = import.meta.env.VITE_GRAFANA_HOST;
    const grafana_port = import.meta.env.VITE_GRAFANA_PORT;
    const grafana_path = import.meta.env.VITE_GRAFANA_PATH;
    const dashboard_name = import.meta.env.VITE_GRAFANA_DASHBOARD;

    // Construct Grafana iframe URL dynamically
    const grafana_url = `http://${grafana_host}:${grafana_port}/${grafana_path}/${dashboard_name}?orgId=1&theme=light`;
    const getUriParams = () => `panelId=10&var-riskFactorRegion_filter=${selectedRiskFactor}`;
    const iFrame_url = `${grafana_url}&${getUriParams()}`;

    // Log for debugging
    console.log("iFrame URL:", iFrame_url);

    useEffect(() => {
        setIsLoggedIn(AuthService.isLoggedIn());
    }, []);

    if (!isLoggedIn) return <h2>Unauthorized</h2>;

    // Accordion content
    const accordionContent_dictLst = [
        {
            title: "Source",
            content: (
                <p>
                    The screening data comes from reports of the respective programs of the ACs, and the risk factors are derived from the Spanish National Health Survey.
                    These data are the most recent available (2019 for screening data and 2017 for risk factors).
                </p>
            ),
        },
    ];

    return (
        <div className="row">
            {/* Left Panel - Dropdowns */}
            <div className="col-sm-2 mt-3">
                <RiskFactorSpainRegionFilter
                    selectedRiskFactor={selectedRiskFactor}
                    setSelectedRiskFactor={setSelectedRiskFactor}
                    riskFactorSpainRegion_dictLst={riskFactorSpainRegion_dictLst}
                />
            </div>

            {/* Middle Panel - Grafana iframe */}
            <div className="col-sm-8 mt-5">
                <div className="embed-responsive embed-responsive-16by9">
                    <iframe
                        id="embeddedPanel_id"
                        className="embed-responsive-item"
                        src={iFrame_url}
                        width="100%"
                        height="500px"
                    ></iframe>
                </div>
            </div>

            {/* Right Panel - Glossary Accordion */}
            <div className="col-sm-2">
                <h5>Glossary</h5>
                <Accordion defaultActiveKey="-1">
                    {accordionContent_dictLst.map((accordionContent_dict, index) => (
                        <Accordion.Item eventKey={index.toString()} key={index}>
                            <Accordion.Header>{accordionContent_dict.title}</Accordion.Header>
                            <Accordion.Body className="text-start">
                                {accordionContent_dict.content}
                            </Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>
            </div>
        </div>
    );
};

export default ScreeningRiskFactorDataPanel;

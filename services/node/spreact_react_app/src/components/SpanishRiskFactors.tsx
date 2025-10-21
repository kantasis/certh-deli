import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import * as AuthService from "../services/auth.service.tsx";
import Comments from "./Comments.tsx";
import { useLocation } from "react-router-dom";
import SaveGraphButton from "./SaveGraphButton.tsx";
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
        ["CS2017", "POS2017", "CS2019", "POS2019"].includes(item.value)
    );

    const riskFactors = riskFactorSpainRegion_dictLst.filter(item =>
        !["", "CS2017", "POS2017", "CS2019", "POS2019"].includes(item.value)
    );

    return (
        <>
            {/* Dropdown for Risk Factors */}
            <label className="form-label mt-3">
                <h6><strong>Select Risk Factor</strong></h6>
            </label>
            <Form.Control
                as="select"
                value={selectedRiskFactor}
                onChange={(e) => setSelectedRiskFactor(e.target.value)}
            >
                <option value="" disabled>Select Risk Factor</option>
                {riskFactors.map((item) => (
                    <option key={item.value} value={item.value}>
                        {item.label}
                    </option>
                ))}
            </Form.Control>
        </>
    );
};

const SpanishRiskFactorsDataPanel: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const location = useLocation();
    const savedIframeUrl = location.state?.iframeUrl;

    useEffect(() => {
        if (!savedIframeUrl) return;

        const url = new URL(savedIframeUrl);
        const params = new URLSearchParams(url.search);

        const riskFactor = params.get("var-riskFactorRegion_filter");
        if (riskFactor) setSelectedRiskFactor(riskFactor);

        // Optionally, save the panel label to localStorage for LIT03
        const panelLabel = location.state?.panelLabel;
        if (panelLabel) {
            localStorage.setItem("lit03Panel", panelLabel);
        }
    }, [savedIframeUrl, location.state]);


    // List of available screening and risk factors
    const riskFactorSpainRegion_dictLst = [
        { value: "CS2017", label: "2017 - Coverage of CRC screening (%)" },
        { value: "POS2017", label: "2017 - Positive cases (% over total tests)" },
        { value: "OW2017", label: "2017 - BMI (25-30), >18 years old" },
        { value: "OBE2017", label: "2017 - BMI (>30), >18 years old" },
        { value: "SMO2017", label: "2017 - > 15 years old daily smoking" },
        { value: "ALC2017", label: "2017 - > 15 years old daily drinking" },
        { value: "SED2017", label: "2017 - Sedentarism" },
        { value: "CS2019", label: "2019 - Coverage of CRC screening (%)" },
        { value: "POS2019", label: "2019 - Positive cases (% over total tests)" },
        { value: "PR2023", label: "2023 - Poverty Risk % persons living below poverty line" },
        { value: "PCI2023", label: "2023 - Per capita income (Euros)" },
    ];

    // Use state to store the selected risk factor
    const [selectedRiskFactor, setSelectedRiskFactor] = useState("");
    const panelLabel = localStorage.getItem("lit03Panel");
    // Grafana environment variables
    const grafana_host = import.meta.env.VITE_GRAFANA_HOST;
    const grafana_port = import.meta.env.VITE_GRAFANA_PORT;
    const grafana_path = import.meta.env.VITE_GRAFANA_PATH;
    const dashboard_name = import.meta.env.VITE_GRAFANA_DASHBOARD;

    // Construct Grafana iframe URL dynamically
    const grafana_url = `https://${grafana_host}:${grafana_port}/${grafana_path}/${dashboard_name}?orgId=1&theme=light`;
    const getUriParams = () => `panelId=10&var-riskFactorRegion_filter=${selectedRiskFactor}&panelLabel=${panelLabel}`;
    const iFrame_url = `${grafana_url}&${getUriParams()}`;

    // Log for debugging
    console.log("iFrame URL:", iFrame_url);

    useEffect(() => {
        setIsLoggedIn(AuthService.isLoggedIn());
    }, []);

    if (!isLoggedIn) return <h2>Unauthorized</h2>;

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

            {/* Middle Panel - Conditional Rendering of Grafana iframe */}
            <div className="col-sm-8 ">
                {selectedRiskFactor && selectedRiskFactor !== "" ? (
                    <div className="embed-responsive embed-responsive-16by9">
                        <iframe
                            id="embeddedPanel_id"
                            className="embed-responsive-item"
                            src={iFrame_url}
                            width="100%"
                            height="500px"
                        ></iframe>
                        <SaveGraphButton iframeUrl={iFrame_url} />
                        {/* {iFrame_url} */}
                    </div>
                ) : (
                    <div>
                        <div className=""><div><h5 className="mb-5">Data on risk factors for CRC are presented by autonomous communities. Comparison of these frequencies makes it possible
                            to identify the differences between autonomous communities.</h5></div>
                        </div>
                        <div className=""><h5>Please select a risk factor from the dropdown menu on the left to display the data.</h5></div>
                    </div>
                )}
            </div>

            {/* Right Panel - Sources */}
            <div className="col-sm-2">
                <h5>Sources</h5>
                <div style={{
                    border: '1px solid #e2e6e9',
                    borderRadius: 'var(--bs-border-radius)',
                    padding: '10px'
                }}>
                    Spanish National Health Survey <br />
                    <a target="_blank" href="https://www.sanidad.gob.es/estadEstudios/estadisticas/encuestaNacional/home.htm">Link</a>
                </div>
                <Comments />
            </div>
        </div>
    );
};

export default SpanishRiskFactorsDataPanel;

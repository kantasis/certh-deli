import React, { useState, useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import NewDash from "./CRCmortalityPanel";
import ScreeningRiskFactorDataPanel from "./ScreeningRiskFactorDataPanel";
import CrcIncidenceDataPanel from "./CrcIncidenceDataPanel";
import * as AuthService from "../services/auth.service.tsx";

const LIT03: React.FC = () => {
    const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(AuthService.isLoggedIn());
    }, []);

    useEffect(() => {
        if (selectedPanel) {
            let panelLabel = selectedPanel === "NewDash"
                ? "CRC Mortality"
                : selectedPanel === "ScreeningRiskFactorDataPanel"
                    ? "Screening & Risk Factors"
                    : "CRC Incidence Data";

            localStorage.setItem("lit03Panel", panelLabel); // ✅ Save dropdown text
        }
    }, [selectedPanel]);

    if (!isLoggedIn) return <h2>Unauthorized</h2>;

    const renderPanel = () => {
        switch (selectedPanel) {
            case "NewDash":
                return <NewDash />;
            case "ScreeningRiskFactorDataPanel":
                return <ScreeningRiskFactorDataPanel />;
            case "CrcIncidenceDataPanel":
                return <CrcIncidenceDataPanel />;
            default:
                return (
                    <div className="text-center mt-5">
                        <h2>Welcome to the LIT03 Dashboard</h2>
                        <p>Please use the dropdown menu to select and view the Spanish Regions data.</p>
                    </div>
                );
        }
    };

    return (
        <div className="mt-4">
            <div className="row">
                <div className="col-sm-2">
                    <Dropdown onSelect={(eventKey) => setSelectedPanel(eventKey)}>
                        <Dropdown.Toggle variant="" className="w-100" style={{ backgroundColor: '#186480', color:'white' }}>
                            {selectedPanel
                                ? selectedPanel === "NewDash"
                                    ? "CRC Mortality"
                                    : selectedPanel === "ScreeningRiskFactorDataPanel"
                                        ? "Screening & Risk Factors"
                                        : "CRC Incidence Data"
                                : "Select Dashboard"}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item eventKey="NewDash">CRC Mortality</Dropdown.Item>
                            <Dropdown.Item eventKey="ScreeningRiskFactorDataPanel">Screening & Risk Factors</Dropdown.Item>
                            <Dropdown.Item eventKey="CrcIncidenceDataPanel">CRC Incidence Data</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>

                <div className="col-sm-12">
                    <div className="">{renderPanel()}</div>
                </div>
            </div>
        </div>
    );
};

export default LIT03;

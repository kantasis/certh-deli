import React, { useState, useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import { Form } from "react-bootstrap";
import NewDash from "./CRCmortalityPanel";
import ScreeningDataPanel from "./ScreeningRiskFactorDataPanel";
import SpanishRiskFactors from "./SpanishRiskFactors";
import CrcIncidenceDataPanel from "./CrcIncidenceDataPanel";
import * as AuthService from "../services/auth.service.tsx";

const LIT03: React.FC = () => {
    // localStorage.setItem("lit03Panel", '');
    const [selectedPanel, setSelectedPanel] = useState<string | null>(null);

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(AuthService.isLoggedIn());
    }, []);

    const renderPanel = () => {
        switch (selectedPanel) {
            case "NewDash":
                return <NewDash />;
            case "ScreeningDataPanel":
                return <ScreeningDataPanel />;
            case "SpanishRiskFactors":
                return <SpanishRiskFactors />;
            default:
                return (
                    <div className="text-center my-5">
<<<<<<< Updated upstream

                        <div className="container w-75 my-5">
                            <h5>This section of the dashboard presents data from the Autonomous
                                Communities of Spain related to mortality, risk factors and CRC screening.
                                Decision-making for CRC prevention is performed at the subnational level.
                                Therefore, Spain has been selected for this analysis.</h5>
                        </div>
                        <h5 className="">Please use the dropdown menu on the left to select
                            and view the data.</h5>
=======
                       
                    <div className="container w-75 my-5">
                                            <h5>This section of the dashboard presents data from the Autonomous 
                            Communities of Spain related to mortality, risk factors and CRC screening. 
                            Decision-making for CRC prevention is performed at the subnational level. 
                            Therefore, Spain has been selected for this analysis.</h5>
                            </div>
                        <h5 className="">Please use the dropdown menu on the left to select
                        and view the data.</h5>
>>>>>>> Stashed changes
                    </div>
                );
        }
    };



    useEffect(() => {
        if (selectedPanel) {
            // Save a key identifier, not the label
            localStorage.setItem("lit03Panel", selectedPanel);
        } else {
            // Restore previously saved identifier
            const savedPanel = localStorage.getItem("lit03Panel");
            if (savedPanel) {
                setSelectedPanel(savedPanel);
            }
        }

    }, [selectedPanel]);

    if (!isLoggedIn) return <h2>Unauthorized</h2>;




    return (
        <div className="mt-4">
            <div className="row">
                <div className="col-sm-2">
                    {/* <Dropdown onSelect={(eventKey) => setSelectedPanel(eventKey)}>
                        <Dropdown.Toggle variant="" className="w-100" style={{ backgroundColor: '#186480', color: 'white' }}>
                            {selectedPanel
                                ? selectedPanel === "NewDash"
                                    ? "CRC Mortality"
                                    : selectedPanel === "ScreeningDataPanel"
                                        ? "Screening Data"
                                        : "Risk Factors"
                                : "Select Data"}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item eventKey="NewDash">Mortality</Dropdown.Item>
                            <Dropdown.Item eventKey="ScreeningDataPanel">Screening</Dropdown.Item>
                            <Dropdown.Item eventKey="SpanishRiskFactors">Risk Factors</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown> */}
                    <Form.Select
                        style={{ backgroundColor: '#186480', color: 'white', textAlign: 'center' }}
                        value={selectedPanel || ""}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === "") {
                                localStorage.setItem("lit03Panel", "");
                            }
                            setSelectedPanel(value);
                        }}
                    >
                        <option value="">Select a Panel</option>
                        <option value="NewDash">CRC Mortality</option>
                        <option value="ScreeningDataPanel">Screening Data</option>
                        <option value="SpanishRiskFactors">Risk Factors</option>
                    </Form.Select>

                </div>

                <div className="col-sm-12">
                    <div className="">{renderPanel()}</div>
                </div>
            </div>
        </div>
    );
};

export default LIT03;

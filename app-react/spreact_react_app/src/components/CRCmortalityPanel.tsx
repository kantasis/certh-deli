import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service.tsx";
import { Accordion } from "react-bootstrap";
import SpainRegionFilter from "./SpainRegionsFilter.tsx";
import YearFilter from "./YearFilter.tsx";
import SexFilter from "./SexFilter.tsx";

const grafana_host = import.meta.env.VITE_GRAFANA_HOST;
const grafana_port = import.meta.env.VITE_GRAFANA_PORT;
const grafana_path = import.meta.env.VITE_GRAFANA_PATH;
const dashboard_name = import.meta.env.VITE_GRAFANA_DASHBOARD;

const panel_id = 9;
const grafana_base_url = `http://${grafana_host}:${grafana_port}/${grafana_path}/${dashboard_name}?panelId=${panel_id}&orgId=1&theme=light`;

const NewDash: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [selectedRegions_lst, set_selectedRegions] = useState<string[]>(["Spain"]);
    const [minYear_int, set_minYear] = useState(0);
    const [maxYear_int, set_maxYear] = useState(0);
    const [selectedSex_int, set_selectedSex] = useState(0);

    const sex_dictLst = [
        { value: 0, label: "Both Sexes", var_filter: "Both" },
        { value: 1, label: "Male", var_filter: "Male" },
        { value: 2, label: "Female", var_filter: "Female" },
    ];

    useEffect(() => {
        setIsLoggedIn(AuthService.isLoggedIn());
    }, []);

    const getUriParams = () => {
        // Always ensure Spain is in the list, but other regions are added by the user
        let regions = selectedRegions_lst.length > 0 ? ["Spain", ...selectedRegions_lst] : ["Spain"];
        let regionFilter_str = `var-region_filter=${regions.join(",")}`;
        let yearFilter_str = `var-minyear_filter=${minYear_int}&var-maxyear_filter=${maxYear_int}`;
        let selectedSex_str = sex_dictLst[selectedSex_int]["var_filter"];

        return `${regionFilter_str}&${yearFilter_str}&var-sex_filter=${selectedSex_str}`;
    };

    const iFrame_url = selectedCountry ? `${grafana_base_url}&${getUriParams()}` : "";

    if (!isLoggedIn) return <h2>Unauthorized</h2>;

    return (
        <div className="row">
            {/* Left Sidebar */}
            <div className="col-sm-2">
                {/* Select Country Dropdown */}
                <label className="form-label">
                    <strong>Select Country</strong>
                </label>
                <select
                    className="form-control"
                    value={selectedCountry || ""}
                    onChange={(e) => {
                        const country = e.target.value;
                        setSelectedCountry(country);
                        if (country === "Spain") {
                            set_selectedRegions(["Spain"]); // Reset to only Spain if it's selected
                        } else {
                            set_selectedRegions([]); // Otherwise, clear regions if country is not Spain
                        }
                    }}
                >
                    <option value="">Select a country</option>
                    <option value="Spain">Spain</option>
                </select>

                {/* Show additional filters only if Spain is selected */}
                {selectedCountry === "Spain" && (
                    <>
                        <SpainRegionFilter
                            selectedRegions_lst={selectedRegions_lst}
                            set_selectedRegions={set_selectedRegions}
                            showSpain={false} // Hide Spain in filter because it's always included
                        />
                        <YearFilter
                            minYear_int={minYear_int}
                            set_minYear={set_minYear}
                            maxYear_int={maxYear_int}
                            set_maxYear={set_maxYear}
                        />
                        <SexFilter
                            selectedSex_int={selectedSex_int}
                            set_selectedSex={set_selectedSex}
                            sex_dictLst={sex_dictLst}
                        />
                    </>
                )}
            </div>

            {/* Center Content */}
            <div className="col-sm-8">
                {selectedCountry ? (
                    <div className="embed-responsive embed-responsive-16by9">
                        <iframe
                            id="embeddedPanel_id"
                            className="embed-responsive-item"
                            src={iFrame_url}
                            width="100%"
                            height="600px"
                        ></iframe>
                    </div>
                ) : (
                    <h4>Please select a country to continue.</h4>
                )}
            </div>

            {/* Right Sidebar */}
            <div className="col-sm-2">
                <h5>Glossary</h5>
                <Accordion defaultActiveKey="-1">
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>Source</Accordion.Header>
                        <Accordion.Body>
                            CRC mortality data were obtained for each AC between 1999-2022 according to the Spanish Ministry of Health reports.
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </div>
        </div>
    );
};

export default NewDash;

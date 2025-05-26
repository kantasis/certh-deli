import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service.tsx";
import { Accordion } from "react-bootstrap";
import SpainRegionFilter from "./SpainRegionsFilter.tsx";
import YearFilter from "./YearFilter.tsx";
import SexFilter from "./SexFilter.tsx";
import Comments from "./Comments.tsx";
import SaveGraphButton from "./SaveGraphButton.tsx";
import { useLocation } from "react-router-dom";

const grafana_host = import.meta.env.VITE_GRAFANA_HOST;
const grafana_port = import.meta.env.VITE_GRAFANA_PORT;
const grafana_path = import.meta.env.VITE_GRAFANA_PATH;
const dashboard_name = import.meta.env.VITE_GRAFANA_DASHBOARD;

const panel_id = 9;
const grafana_base_url = `http://${grafana_host}:${grafana_port}/${grafana_path}/${dashboard_name}?panelId=${panel_id}&orgId=1&theme=light`;

const NewDash: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [selectedRegions_lst, set_selectedRegions] = useState<string[]>([]);
    const [minYear_int, set_minYear] = useState(0);
    const [maxYear_int, set_maxYear] = useState(0);
    // const [selectedSex_int, set_selectedSex] = useState(null);
    const [selectedSex_int, set_selectedSex] = useState<string | null>(null);

    const location = useLocation();
    const savedIframeUrl = location.state?.iframeUrl;

    useEffect(() => {
        if (!savedIframeUrl) return;

        try {
            const url = new URL(savedIframeUrl);
            const params = new URLSearchParams(url.search);

            const region_filter = params.get("var-region_filter");
            console.log("region_filter raw:", region_filter);

            const minyear_filter = params.get("var-minyear_filter");
            console.log("minyear_filter raw:", minyear_filter);

            const maxyear_filter = params.get("var-maxyear_filter");
            console.log("maxyear_filter raw:", maxyear_filter);

            const sex_filter = params.get("var-sex_filter");
            console.log("sex_filter raw:", sex_filter);

            set_selectedRegions(region_filter ? region_filter.split(",") : []);

            set_minYear(minyear_filter ? Number(minyear_filter) : 0);
            set_maxYear(maxyear_filter ? Number(maxyear_filter) : 0);

            const sexValueMap: Record<string, number> = {
                Both: 0,
                Male: 1,
                Female: 2,
            };

            set_selectedSex(sex_filter && sexValueMap[sex_filter] !== undefined ? sexValueMap[sex_filter] : null);

            const panelLabel = params.get("panelLabel") ?? location.state?.panelLabel;
            if (panelLabel) {
                localStorage.setItem("lit03Panel", panelLabel);
            }
        } catch (err) {
            console.warn("Invalid savedIframeUrl:", savedIframeUrl, err);
        }
    }, [savedIframeUrl, location.state]);

    useEffect(() => {
        console.log("States updated:", {
            selectedRegions_lst,
            minYear_int,
            maxYear_int,
            selectedSex_int,
        });
    }, [selectedRegions_lst, minYear_int, maxYear_int, selectedSex_int]);
    const sex_dictLst = [
        { value: null, label: "Select...", var_filter: "" },
        { value: 0, label: "Both Sexes", var_filter: "Both" },
        { value: 1, label: "Male", var_filter: "Male" },
        { value: 2, label: "Female", var_filter: "Female" },
    ];

    useEffect(() => {
        setIsLoggedIn(AuthService.isLoggedIn());
    }, []);
    const panelLabel = localStorage.getItem("lit03Panel");
    const getUriParams = () => {
        let regionFilter_str = `var-region_filter=${selectedRegions_lst.join(",")}`;
        let yearFilter_str = `var-minyear_filter=${minYear_int}&var-maxyear_filter=${maxYear_int}`;
        let selectedSex_str = sex_dictLst.find(sex => sex.value === selectedSex_int)?.var_filter || "";

        return `${regionFilter_str}&${yearFilter_str}&var-sex_filter=${selectedSex_str}&panelLabel=${panelLabel}`;
    };

    const iFrame_url = `${grafana_base_url}&${getUriParams()}`;

    // Check if filters have been selected
    const isRegionSelected = selectedRegions_lst.length > 0 && selectedRegions_lst.some(region => region.trim() !== "");
    const isYearSelected = minYear_int > 0 && maxYear_int > 0;
    const isSexSelected = selectedSex_int !== null;
    const isAllFiltersSelected = isRegionSelected && isYearSelected && isSexSelected;

    if (!isLoggedIn) return <h2>Unauthorized</h2>;

    return (
        <div className="row">
            {/* Left Sidebar */}
            <div className="col-sm-2">
                {/* Spain Region Filter - Always Visible */}
                <SpainRegionFilter
                    selectedRegions_lst={selectedRegions_lst}
                    set_selectedRegions={set_selectedRegions}
                />

                {/* Year Filter - Becomes Visible After Region Selection */}
                {isRegionSelected && (
                    <YearFilter
                        minYear_int={minYear_int}
                        set_minYear={set_minYear}
                        maxYear_int={maxYear_int}
                        set_maxYear={set_maxYear}
                    />
                )}

                {isYearSelected && (
                    <SexFilter
                        selectedSex_int={selectedSex_int}
                        set_selectedSex={set_selectedSex}
                        sex_dictLst={sex_dictLst}
                    />
                )}
            </div>

            {/* Center Content */}
            <div className="col-sm-8">
                <div className="embed-responsive embed-responsive-16by9">
                    {/* Show message when filters are not yet fully selected */}
                    {!isAllFiltersSelected ? (
                        <div className="text-center">
                            <h5 className="my-5">The evolution of CRC mortality rates in the autonomous
                                communities of Spain is presented so that the different patterns can be compared.</h5>
                            <div className=""><h5 className="mb-5" >Please use the filters to refine your selection.</h5>
<<<<<<< Updated upstream
                                <p> Make sure to select a <strong>region</strong>, <strong>year range</strong>, and <strong>sex filter.</strong></p></div>
=======
                            <p> Make sure to select a <strong>region</strong>, <strong>year range</strong>, and <strong>sex filter.</strong></p></div>
>>>>>>> Stashed changes
                        </div>
                    ) : (
                        <>
                            <iframe
                                id="embeddedPanel_id"
                                className="embed-responsive-item"
                                src={iFrame_url}
                                width="100%"
                                height="600px"
                            ></iframe>
                            <SaveGraphButton iframeUrl={iFrame_url} />
                            {/* {iFrame_url} */}
                        </>
                    )}

                </div>
            </div>

            {/* Right Sidebar */}
            <div className="col-sm-2">
                <h5>Sources</h5>
                <div style={{
                    border: '1px solid #e2e6e9',
                    borderRadius: 'var(--bs-border-radius)',
                    padding: '10px'
                }}>Spanish Ministry of Health <br />
                    <a target="_blank" href="https://pestadistico.inteligenciadegestion.sanidad.gob.es/publicoSNS/I/mortalidad-por-causa-de-muerte/listado-de-causas-del-ministerio-de-sanidad-a-partir-de-1999/tasas-de-mortalidad-ajustadas-por-edad">Link</a>
                </div>
                {/* <Accordion defaultActiveKey="-1">
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>Source</Accordion.Header>
                        <Accordion.Body>
                            CRC mortality data were obtained for each AC between 1999-2022 according to the Spanish Ministry of Health reports.
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion> */}
                <Comments />
            </div>
        </div>
    );
};

export default NewDash;

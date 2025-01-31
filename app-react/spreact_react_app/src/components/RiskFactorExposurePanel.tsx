import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service.tsx";
import { Button, Dropdown } from 'react-bootstrap';
import CountryFilter from "./CountryFilter.tsx";
import YearFilter from "./YearFilter.tsx";
import FactorFilter from "./FactorFilter.tsx";
import Glossary from "./Glossary.tsx";
import SexFilter from "./SexFilter.tsx";
import AgeFilter from "./AgeFilter.tsx";
import AnalyticsRiskFactorFilter from "./AnalyticsRiskFactorFilter.tsx";
import AnalyticsFilter from "./AnalyticsFilter.tsx";
import RiskFactorExposureFilter from "./RiskFactorExposureFilter.tsx";



const grafana_host = import.meta.env.VITE_GRAFANA_HOST;
const grafana_port = import.meta.env.VITE_GRAFANA_PORT;
const grafana_path = import.meta.env.VITE_GRAFANA_PATH;
const dashboard_name = import.meta.env.VITE_GRAFANA_DASHBOARD;
// (5,8)
// const panel_id = 5;
const grafana_url = `http://${grafana_host}:${grafana_port}/${grafana_path}/${dashboard_name}?orgId=1&theme=light`;

const riskFactorExposurePanel: React.FC = () => {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [selectedCountries_lst, set_selectedCountries] = useState([]);
    const [selectedFactor_str, set_selectedFactor] = useState('');
    const [selectedRiskFactor_int, set_selectedRiskFactors] = useState(0);
    const [minYear_int, set_minYear] = useState(1990);
    const [maxYear_int, set_maxYear] = useState(2020);
    const [selectedSex_int, set_selectedSex] = useState(0);
    const [selectedRiskFactorExposure_int, set_selectedRiskFactorExposure] = useState(0);
    const [selectedAge_int, set_selectedAge] = useState(0);
    const [selectedAnalysis_int, set_selectedAnalysis] = useState(0);

    const sex_dictLst = [
        {
            value: 0,
            label: "Both",
            var_filter: "Both"
        },
        {
            value: 1,
            label: "Male",
            var_filter: "Male"
        },
        {
            value: 2,
            label: "Female",
            var_filter: "Female"
        },

    ];

    const riskFactorExposure_dictLst = [
        {
            value: 0,
            label: "Alcohol use",
            var_filter: "Alcohol use"
        },
        {
            value: 1,
            label: "Smoking",
            var_filter: "Smoking"
        },
        {
            value: 2,
            label: "Low Physical Activity",
            var_filter: "Low Physical Activity"
        },
        {
            value: 3,
            label: "High Body-Mass Index",
            var_filter: "High Body-Mass Index"
        },

    ];


    const age_dictLst = [
        {
            value: 0,
            label: "Age-standardized",
            var_filter: "Age-standardized"
        },
        {
            value: 1,
            label: "Under 25",
            var_filter: "Under 25"
        },
        {
            value: 2,
            label: "25 to 50",
            var_filter: "25 to 50"
        },
        {
            value: 3,
            label: "Above 50",
            var_filter: "Above 50"
        },

    ];
    const riskFactors_dictLst = [
        {
            value: 0,
            label: "Alcohol use",
        },
        {
            value: 1,
            label: "Diet high in red meat",
        },
        {
            value: 2,
            label: "Diet high in trans fatty acids",
        },
        {
            value: 3,
            label: "Diet low in polyunsaturated fatty acids",
        },
        {
            value: 4,
            label: "Diet low in seafood omega-3 fatty acids",
        },
        {
            value: 5,
            label: "Diet low in vegetables",
        },
        {
            value: 6,
            label: "Diet low in whole grains",
        },
        {
            value: 7,
            label: "High body-mass index",
        },
        {
            value: 8,
            label: "Low physical activity",
        },
    ];


    useEffect(
        () => {
            setIsLoggedIn(AuthService.isLoggedIn());
        },
        []
    );

    if (!isLoggedIn)
        return <h2>Unauthorized</h2>;



    const getUriParams = () => {
        const panelId = 8;
        let countryFilter_str = selectedCountries_lst.map((country_str, index) => `var-country_filter=${country_str}`).join('&');
        let yearFilter_str = `var-minyear_filter=${minYear_int}&var-maxyear_filter=${maxYear_int}`;
        let factorFilter_str = `var-factor_filter=${selectedFactor_str}`;
        let selectedSex_str = sex_dictLst[selectedSex_int]['var_filter'];
        let selectedAge_str = age_dictLst[selectedAge_int]['var_filter'];
        const riskFactorExposureFilter_str = riskFactorExposure_dictLst[selectedRiskFactorExposure_int]['var_filter'];
        return `${countryFilter_str}&${yearFilter_str}&${factorFilter_str}&var-sex_filter=${selectedSex_str}&var-age_filter=${selectedAge_str}&var-riskFactor_filter=${riskFactorExposureFilter_str}&panelId=${panelId}`;
        // return `${countryFilter_str}&${yearFilter_str}&${factorFilter_str}&var-sex_filter=${selectedSex_str}&var-age_filter=${selectedAge_str}`;
    };

    const iFrame_url = `${grafana_url}&${getUriParams()}`;

    // riskFactor_filter
    const riskFactor_html = (<>
        <iframe
            id="embeddedPanel_id"
            className="embed-responsive-item"
            src={iFrame_url}
            width="100%"
            height="600px"
        >
        </iframe>
        {<div>
            {iFrame_url}
        </div>}
    </>);
    const getUriParams2 = () => {
        const panelId = 5;
        let countryFilter_str = selectedCountries_lst.map((country_str, index) => `var-country_filter=${country_str}`).join('&');
        let yearFilter_str = `var-minyear_filter=${minYear_int}&var-maxyear_filter=${maxYear_int}`;
        let factorFilter_str = `var-factor_filter=${selectedFactor_str}`;
        let selectedSex_str = sex_dictLst[selectedSex_int]['var_filter'];
        let selectedAge_str = age_dictLst[selectedAge_int]['var_filter'];
        const riskFactorFilter_str = `var-riskFactor_filter=${riskFactors_dictLst[selectedRiskFactor_int].label}`;

        return `&panelId=${panelId}${countryFilter_str}&${yearFilter_str}&${factorFilter_str}&var-sex_filter=${selectedSex_str}&var-age_filter=${selectedAge_str}`;
    };
    const iFrame_url2 = `${grafana_url}&${getUriParams2()}`;
    const diet_html = (<>
        <iframe
            id="embeddedPanel_id"
            className="embed-responsive-item"
            // src={iFrame_url2}
            width="100%"
            height="600px"
        >
        </iframe>
        {<div>
            {/* {iFrame_url2} */}
        </div>}
    </>);


    const analyses_dictLst = [
        {
            value: 0,
            label: "Select...",
            title: "",
            caption: "",
            html: (<>

                <p>

                    Please select a type of presentation from the drop-down menu on the left.
                    <br />
                    <br />
                    In the menu on the right hand side you can find details about the data and methodology of the analysis.
                    <br />
                </p>
            </>),
        },
        {
            value: 1,
            label: "Nutrition",
            //    caption: "Time interval between Risk Factor exposure and CRC incidence",
            //    title: (<>
            //       <p>
            //          <br></br>
            //          Associations between exposure to various risk factors and CRC incidence for a specific year lag between them.<br /><br />
            //          Only statistically significant associations between risk factors and CRC incidence are shown. <br /><br />
            //          Higher coefficients indicate a stronger association between risk factor Summary Exposure Value (SEV) and CRC incidence. <br /><br />
            //          Negative coefficients may be related to a number of factors, e.g. the presence of confounding variables.
            //       </p>
            //    </>),
            html: diet_html,
        },
        {
            value: 2,
            label: "Lifestyle",
            //    title: (<>
            //       <p>
            //          <br></br>
            //          Change of associations between exposure to a specific risk factor and CRC incidence as year lags increase between them.<br /><br />
            //          Only statistically significant associations between risk factors and CRC incidence are shown. <br /><br />
            //          Higher coefficients indicate a stronger association between risk factor Summary Exposure Value (SEV) and CRC incidence. <br /><br />
            //          Negative coefficients may be related to a number of factors, e.g. the presence of confounding variables.
            //       </p>
            //    </>),
            //    caption: "Summary Exposure Value of various CRC Risk Factors",
            html: riskFactor_html,
        },

    ]
    return (<>


        <div className="row">

            {/* Left Navbar */}
            <div className="col-sm-2">
                <AnalyticsFilter
                    selectedAnalysis_int={selectedAnalysis_int}
                    set_selectedAnalysis={set_selectedAnalysis}
                    analyses_dictLst={analyses_dictLst}
                />

                {(analyses_dictLst[selectedAnalysis_int]['value'] === 1 || analyses_dictLst[selectedAnalysis_int]['value'] === 2) && (
                    <>
                        <CountryFilter
                            selectedCountries_lst={selectedCountries_lst}
                            set_selectedCountries={set_selectedCountries}
                        />
                        <YearFilter
                            minYear_int={minYear_int}
                            set_minYear={set_minYear}
                            maxYear_int={maxYear_int}
                            set_maxYear={set_maxYear}
                        />
                        <FactorFilter
                            selectedFactor_str={selectedFactor_str}
                            set_selectedFactor={set_selectedFactor}
                        />
                        <SexFilter
                            selectedSex_int={selectedSex_int}
                            set_selectedSex={set_selectedSex}
                            sex_dictLst={sex_dictLst}
                        />
                        <AgeFilter
                            selectedAge_int={selectedAge_int}
                            set_selectedAge={set_selectedAge}
                            age_dictLst={age_dictLst}
                        />
                    </>
                )}

                {analyses_dictLst[selectedAnalysis_int]['value'] === 2 && (
                    <RiskFactorExposureFilter
                        selectedRiskFactorExposure_int={selectedRiskFactorExposure_int}
                        set_selectedRiskFactorExposure={set_selectedRiskFactorExposure}
                        riskFactorExposure_dictLst={riskFactorExposure_dictLst}
                    />
                )}
            </div>




            {/* Center Content */}
            {/* <div className="col-sm-8">

                <div className="embed-responsive embed-responsive-16by9">
                    <iframe
                        id="embeddedPanel_id"
                        className="embed-responsive-item"
                        src={iFrame_url}
                        width="100%"
                        height="600px"
                    >
                    </iframe>
                </div>
            </div> */}
            {/* Centerpiece*/}
            <div className="col-sm-8 mt-5">

                {analyses_dictLst[selectedAnalysis_int]['html']}

            </div>
            {/* Right Navbar */}
            <div className="col-sm-2">
                <Glossary />
            </div>

        </div>
        <p className="text-start">{analyses_dictLst[selectedAnalysis_int]['title']}</p>
    </>);
};

export default riskFactorExposurePanel;

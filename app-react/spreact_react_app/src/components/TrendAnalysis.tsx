import React, { useRef, useEffect, useState } from "react";
import * as AuthService from "../services/auth.service.tsx";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import worldJson from "../assets/map/world.json";
import Comments from "./Comments.tsx";
import { Accordion } from 'react-bootstrap';
import SaveGraphButton from "./SaveGraphButton.tsx";
import { useLocation, useNavigate } from "react-router-dom";
import CountryFilter from "./CountryFilter.tsx";
// import trendCorrelationStaticData from '../assets/trend_correlation.json';
// import trendForecastingCRCData from '../assets/forecasting_CRC_new.json';
//import { Spinner, Alert } from "react-bootstrap";
import YearFilter from "./YearFilter.tsx";

echarts.registerMap("world", worldJson);

const EuropeMap = () => {


    const [trendForecastingCRCData, setTrendForecastingCRCData] = useState([]);
    // const [loadingData, setLoadingData] = useState(false);
    // const [error, setError] = useState<string | null>(null);

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const chartRef = useRef<ReactECharts>(null);          // NEW
    const [chartIframeUrl, setChartIframeUrl] = useState("");
    const [token, setToken] = useState(null);

    useEffect(() => {
        setIsLoggedIn(AuthService.isLoggedIn());
    }, []);


    const COUNTRY_OPTIONS = [
        "Albania", "Andorra", "Armenia", "Austria", "Azerbaijan",
        "Belarus", "Belgium", "Bosnia and Herzegovina", "Bulgaria",
        "Croatia", "Cyprus", "Czechia", "Denmark", "Estonia",
        "Finland", "France", "Georgia", "Germany", "Greece",
        "Hungary", "Iceland", "Ireland", "Italy", "Latvia",
        "Lithuania", "Luxembourg", "Malta", "Monaco", "Montenegro",
        "Netherlands", "North Macedonia", "Norway", "Poland", "Portugal",
        "Republic of Moldova", "Romania", "Russian Federation", "San Marino",
        "Serbia", "Slovakia", "Slovenia", "Spain", "Sweden",
        "Switzerland", "Ukraine", "United Kingdom"
    ];






    const DEFAULT_RISK_FACTORS = [
        "High alcohol use",
        "Smoking",
        "Low physical activity",
        "Diet high in red meat",
        "Diet high in processed meat",
        "Diet high in sugar-sweetened beverages",
        "Diet low in vegetables",
        "High LDL cholesterol",
        "High fasting plasma glucose",
        // "Socio-Demographic Index",
    ];

    const [selectedCountries_lst, set_selectedCountries] = useState([
        "Belgium",
        "Greece",
        "Italy",
    ]);

    const DEFAULT_RISK_FACTORS2 = [
        "High alcohol use",
        "Smoking",
        "Low physical activity",
        "Diet low in omega-6 polyunsaturated fatty acids",
        "Diet high in processed meat",
        "Diet high in red meat",
        "Diet high in sodium",
        "Diet high in sugar-sweetened beverages",
        "Diet high in trans fatty acids",
        "Diet low in calcium",
        //  "Diet low in fiber",
        //  "Diet low in fruits",
        //  "Diet low in legumes",
        //  "Diet low in milk",
        //  "Diet low in nuts and seeds",
        //  "Diet low in seafood omega-3 fatty acids",
        //  "Diet low in vegetables",
        //  "Diet low in whole grains",
        //  "High body-mass index",
        //  "High LDL cholesterol",
        //  "High fasting plasma glucose",
        //  "Socio-Development Index",
    ];


    const [analysisType, setAnalysisType] = useState('');
    const [rawData, setRawData] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [sexFilter, setSexFilter] = useState("Male");
    const [ageFilter, setAgeFilter] = useState("Age-standardized");
    const [yearInterval, setYearInterval] = useState("5 years (2016-2021)");
    const [loading, setLoading] = useState(false);
    const [associationData, setAssociationData] = useState([]);
    const [selectedRiskFactors, setSelectedRiskFactors] = useState([]);
    const [filteredTrendCorrelationData, setFilteredTrendCorrelationData] = useState([]);
    const [rawTrendCorrelationData, setRawTrendCorrelationData] = useState([]);
    const [filteredForecastingData, setFilteredForecastingData] = useState([]);
    const [forecastChartOption, setForecastChartOption] = useState(null);
    const [isRestoring, setIsRestoring] = useState(false);
    const [chartImageUrl, setChartImageUrl] = useState("");

    const [countryList, setCountryList] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState("");
    const [minYear_int, set_minYear] = useState<number | undefined>();
    const [maxYear_int, set_maxYear] = useState<number | undefined>();
    const [yearRangeInitialized, setYearRangeInitialized] = useState(false);
    // const [selectedSex_int, set_selectedSex] = useState(0);
    // const [selectedAge_int, set_selectedAge] = useState(0);

    const [ceilYear_int, set_ceilYear_int] = useState(0);


    const location = useLocation();
    const navigate = useNavigate();



    useEffect(() => {
        const filteredOrderedData = selectedRiskFactors
            .map(factor => rawTrendCorrelationData.find(d => d.Risk_Factor === factor))
            .filter(Boolean); // remove undefined if some factor isn't in data

        setFilteredTrendCorrelationData(filteredOrderedData);
    }, [selectedRiskFactors, rawTrendCorrelationData]);


    const [dataMinYear, setDataMinYear] = useState<number | undefined>(undefined);
    const [dataMaxYear, setDataMaxYear] = useState<number | undefined>(undefined);

    const buildForecastingUrl = () => {
        const baseUrl = "https://oncodir-datapi.catalink.eu/v1/data-fusion/extra/forecasting-crc";
        const params = new URLSearchParams();

        if (selectedCountry) params.append("country", selectedCountry);
        if (sexFilter) params.append("sex", sexFilter);
        if (ageFilter) params.append("age", ageFilter);
        if (minYear_int) params.append("minYear", minYear_int.toString());
        if (maxYear_int) params.append("maxYear", maxYear_int.toString());

        return `${baseUrl}?${params.toString()}`;
    };

    // Fetch data
    useEffect(() => {
        const fetchForecastingData = async () => {
            if (analysisType !== "Forecasting CRC") return;
            setLoading(true);
            // setLoadingData(true);
            // setError(null);

            try {
                const url = buildForecastingUrl();
                const response = await fetch(url);
                if (!response.ok) throw new Error("Failed to fetch forecasting data");

                const data = await response.json();
                setTrendForecastingCRCData(data.results || []);
            } catch (err: any) {
                console.error("Error fetching forecasting CRC data:", err);
                // setError(err.message || "Something went wrong while fetching data");
                setTrendForecastingCRCData([]);
            } finally {
                // ✅ correct usage of finally
                setTimeout(() => {
                    setLoading(false);
                }, 100);
            }
        };
        // Fetch when any relevant filter changes
        fetchForecastingData();
    }, [analysisType, selectedCountry, sexFilter, ageFilter, minYear_int, maxYear_int]);





    useEffect(() => {
        if (minYear_int !== undefined && maxYear_int !== undefined && minYear_int > maxYear_int) {
            set_maxYear(minYear_int);
        }
    }, [minYear_int, maxYear_int]);



    useEffect(() => {
        if (trendForecastingCRCData.length > 0) {
            const countries = [...new Set(trendForecastingCRCData.map(d => d.Country))];
            setCountryList(countries.sort());
        }
    }, [trendForecastingCRCData]);

    useEffect(() => {
        if (analysisType !== "Forecasting CRC") {
            setFilteredForecastingData([]);
            setForecastChartOption(null);
            set_minYear(undefined);
            set_maxYear(undefined);
            setYearRangeInitialized(false);
            return;
        }

        const filtered = Array.isArray(trendForecastingCRCData)
            ? trendForecastingCRCData.filter(d =>
                d.sex === sexFilter &&
                d.age === ageFilter &&
                d.Country === selectedCountry
            )
            : [];


        setFilteredForecastingData(filtered);

        if (filtered.length === 0) return;

        const yearsInData = [...new Set(filtered.map(d => d.Year))].sort((a, b) => a - b);
        const dataMinYear = yearsInData[0];
        const dataMaxYear = yearsInData[yearsInData.length - 1];

        // ✅ Save to state
        setDataMinYear(dataMinYear);
        setDataMaxYear(dataMaxYear);


        // Set initial min/max year once
        if (!yearRangeInitialized && yearsInData.length > 0 && !savedIframeUrl) {
            set_minYear(dataMinYear);
            set_maxYear(dataMaxYear);
            setYearRangeInitialized(true);
        }

        const seriesYears = yearsInData.filter(
            y =>
                (minYear_int === undefined || y >= minYear_int) &&
                (maxYear_int === undefined || y <= maxYear_int)
        );



        // Create Maps
        const observedMap = Object.fromEntries(
            filtered
                .filter(d => d.source === "Observed")
                .map(d => [d.Year, d])
        );

        const forecastedMap = Object.fromEntries(
            filtered
                .filter(d => d.source === "Forecasted")
                .map(d => [d.Year, d])
        );



        const upperCI = Object.fromEntries(
            filtered
                .filter(d => d.source === "Forecasted")
                .map(d => [d.Year, d["Colon and rectum cancer Incidence_upper"]])
        );

        const lowerCI = Object.fromEntries(
            filtered
                .filter(d => d.source === "Forecasted")
                .map(d => [d.Year, d["Colon and rectum cancer Incidence_lower"]])
        );

        // Chart Option
        setForecastChartOption({
            title: {
                text: ` ${selectedCountry} - ${sexFilter} - ${ageFilter} / ${minYear_int} – ${maxYear_int}`,
                left: "left",
                top: 0,
                textStyle: {
                    fontSize: 18,
                    fontWeight: "bold",
                    lineHeight: 24
                },
                padding: [0, 0, 20, 20]
            }, tooltip: {
                trigger: "axis",
                formatter: function (params) {
                    if (!params.length) return "";

                    const year = params[0].axisValue;
                    const observed = observedMap[year];
                    const forecasted = forecastedMap[year];
                    const country = observed?.Country || forecasted?.Country || "Unknown";

                    let tooltip = `<strong>Country: ${country}</strong><br/>
                   <strong>Year: ${year}</strong><br/>`;

                    let forecastAdded = false;

                    for (const p of params) {
                        const seriesName = p.seriesName;

                        if (seriesName === "Observed" && observed) {
                            tooltip += `
                CI Upper: ${observed["Colon and rectum cancer Incidence_upper"]?.toFixed(2)}<br/>
                🔵 Observed: ${observed["Colon and rectum cancer Incidence_value"]?.toFixed(2)}<br/>
                CI Lower: ${observed["Colon and rectum cancer Incidence_lower"]?.toFixed(2)}<br/>`;
                        }

                        if (seriesName === "Forecasted" && forecasted && !forecastAdded) {
                            tooltip += `
                🔴 CI Upper: ${forecasted["Colon and rectum cancer Incidence_upper"]?.toFixed(2)}<br/>
                🟢 Forecasted: ${forecasted["Colon and rectum cancer Incidence_value"]?.toFixed(2)}<br/>
                🟡 CI Lower: ${forecasted["Colon and rectum cancer Incidence_lower"]?.toFixed(2)}<br/>
                Arima (p, d, q): ${forecasted["Arima (p, d, q)"] || "N/A"}<br/>`;
                            forecastAdded = true;
                        }
                    }

                    return tooltip;
                }



            },


            legend: { data: ["Observed", "Forecasted"], top: 30 },
            xAxis: { type: "category", data: seriesYears },
            yAxis: {
                type: "value",
                name: "CRC Incidence Rate",
                nameLocation: "middle",
                nameRotate: 90,
                nameGap: 50
            },
            series: [
                {
                    name: "Observed",
                    type: "line",
                    data: seriesYears.map(y => observedMap[y] ? {
                        value: observedMap[y]["Colon and rectum cancer Incidence_value"],
                        year: y,
                        country: observedMap[y].Country
                    } : null),
                    symbol: "circle",
                    lineStyle: { type: "solid", color: "#007bff" }
                },
                {
                    name: "Forecasted",
                    type: "line",
                    data: seriesYears.map(y => forecastedMap[y] ? {
                        value: forecastedMap[y]["Colon and rectum cancer Incidence_value"],
                        year: y,
                        country: forecastedMap[y].Country,
                        lower: forecastedMap[y]["Colon and rectum cancer Incidence_lower"],
                        upper: forecastedMap[y]["Colon and rectum cancer Incidence_upper"]
                    } : null),
                    symbol: "circle",
                    lineStyle: { type: "dashed", color: "#28a745" }
                },
                {
                    name: "CI Lower",
                    type: "line",
                    stack: "confidence-band",
                    data: seriesYears.map(y => lowerCI[y] ?? null),
                    lineStyle: { opacity: 0 },
                    showSymbol: false,
                    emphasis: { disabled: true }
                },
                {
                    name: "Forecasted",
                    type: "line",
                    stack: "confidence-band",
                    data: seriesYears.map(y =>
                        lowerCI[y] != null && upperCI[y] != null
                            ? upperCI[y] - lowerCI[y]
                            : null
                    ),
                    lineStyle: { opacity: 0 },
                    areaStyle: {
                        color: "rgba(40, 167, 69, 0.2)"
                    },
                    showSymbol: false,
                    emphasis: { disabled: true }
                },
                {
                    name: "CI Upper",
                    type: "line",
                    data: seriesYears.map(y => upperCI[y] ?? null),
                    lineStyle: { color: "red", type: "line", opacity: 0 },
                    showSymbol: false,
                    emphasis: { disabled: true },
                }
            ],
            dataZoom: [
                {
                    type: "slider",
                    show: true,
                    xAxisIndex: 0,
                    start: 0,
                    end: 100,
                    height: 30,
                    bottom: 10
                },
                {
                    type: "inside",
                    xAxisIndex: 0,
                    start: 0,
                    end: 100
                }
            ]
        });
    }, [
        analysisType,
        sexFilter,
        ageFilter,
        selectedCountry,
        trendForecastingCRCData,
        minYear_int,
        maxYear_int
    ]);



    // useEffect(() => {
    //     if (!savedIframeUrl) return;
    //     console.log(analysisType)
    //     if (analysisType === "Association Analysis") {
    //         setSelectedRiskFactors(DEFAULT_RISK_FACTORS);
    //     } else if (analysisType === "Trend Correlation") {
    //         setSelectedRiskFactors(DEFAULT_RISK_FACTORS2);
    //     }
    // }, [analysisType]);


    const getUriParams = () => {


        const paramsObj = {
            analysis: analysisType,
            sexFilter,
            ageFilter,
            yearInterval,
            selectedRiskFactors,
            selectedCountry,
            minYear_int,
            maxYear_int
        };


        return paramsObj;
    };

    //const location = useLocation();
    const savedIframeUrl = location.state?.iframeUrl;

    useEffect(() => {
        if (!savedIframeUrl) return;

        try {
            const parsed = JSON.parse(savedIframeUrl);
            const params = parsed.params;

            if (!params) return;

            setIsRestoring(true);
            setAnalysisType(params.analysis);
            setSexFilter(params.sexFilter);
            setAgeFilter(params.ageFilter);
            setYearInterval(params.yearInterval);
            setSelectedRiskFactors(params.selectedRiskFactors || []);
            setSelectedCountry(params.selectedCountry);
            setDataMinYear(params.minYear_int);
            setDataMaxYear(params.maxYear_int);
            set_minYear(params.minYear_int);
            set_maxYear(params.maxYear_int);
            set_ceilYear_int(params.maxYear_int)

            setTimeout(() => setIsRestoring(false), 1500);
        } catch (error) {
            console.error("Invalid savedIframeUrl format", error);
        }
    }, [savedIframeUrl]);



    // helper now receives the analysisType you already store in state
    const getChartImageUrl = (analysisType: string) => {
        if (!chartRef.current) return "";

        const ec = chartRef.current.getEchartsInstance();

        if (analysisType === "Trend Analysis") {
            // smaller pixelRatio so the data‑URL is shorter
            return ec.getDataURL({
                type: "webp",
                quality: 0.7,
                pixelRatio: 0.8,
                backgroundColor: "#fff",
            });
        }

        // default (Association Analysis or anything else)
        return ec.getDataURL({
            type: "webp",
            quality: 0.7,
            pixelRatio: 1,      // full resolution
            backgroundColor: "#fff",
        });
    };
    const accordionContentTrend_dictLst = [
        {
            title: 'Data Sources',
            content: (<>
                <div style={{ height: '340px', overflow: 'scroll' }}>
                    <p>
                        <li><strong>Source: </strong>Global Burden of Disease Study 2021</li><br />

                        <li><strong>Years: </strong>1990-2021</li><br />

                        <li><strong>Geographic Coverage: </strong>46 countries in Europe</li><br />

                        <li><strong>Age Groups: </strong>Under 25 (0–24 years), 25–50 (25 to 49 years), Above 50 (50 and older), Age-Standardized (Adjusted rates that account for differences in age distributions across populations)</li><br />

                        <li><strong>Sex Groups: </strong>Both Sexes (Aggregated data for males and females), Males (males only), and Females (females only)</li><br />

                        <li><strong>CRC Incidence Rate: </strong>Number of new CRC cases diagnosed per 100,000 population in a year</li><br />

                        <li><strong>Risk factors: </strong>22 risk factors, comprising 4 lifestyle factors, 15 nutrition factors, 2 comorbidities, and 1 socioeconomic factor</li><br />

                        <li><strong>Summary Exposure Value (SEV) rates: </strong>This metric represents the relative risk-weighted prevalence of exposure, accounting for both the extent of exposure and its contribution to disease burden. SEV is the metric for 21 risk factors (excluding socioeconomic factor)</li><br />
                    </p>
                </div>
            </>)
        },
        {
            title: 'Methodology',
            content: (<>
                <div style={{ height: '340px', overflow: 'scroll' }}>
                    <p>
                        <strong>Trend Analysis</strong><br /><br />

                        Temporal trends in CRC incidence were analyzed utilizing the <strong>Estimated Annual Percentage Change (EAPC)</strong> over multiple intervals: 5, 10, 15, 20, 25, and 30 years.<br /><br />

                        The EAPC describes the rate of change in Age-Standardized Rates (ASRs) over time by fitting a regression model to the natural logarithm of ASRs, using time as the explanatory variable. This approach applies a Generalized Linear Model with a Gaussian distribution and assumes a constant rate of change on the logarithmic scale.<br /><br />

                        <strong>Interpreting Trends:</strong><br />
                        <strong>Increasing trend:</strong> EAPC and 95% CI {">"} 0<br />
                        <strong>Decreasing trend: </strong>EAPC and 95% CI {"<"} 0<br />
                        <strong>Stable trend: </strong>95% CI includes 0 (no statistically significant change)<br />

                    </p>
                </div>
            </>)
        },
        {
            title: 'References',
            content: (<>

                <p>
                    B. F. Hankey, L. A. Ries, C. L. Kosary, E. J. Feuer, R. M. Merrill, L. X. Clegg, and B. K. Edwards, "Partitioning linear trends in age-adjusted rates," Cancer causes & control, vol. 11, pp. 31–35, 2000. <br /><br />

                    L. X. Clegg, B. F. Hankey, R. Tiwari, E. J. Feuer, and B. K. Edwards, "Estimating average annual per cent change in trend analysis," Statistics in medicine, vol. 28, no. 29, pp. 3670–3682, 2009.<br /><br />

                </p>

            </>)
        },
    ];

    const accordionContentTrendCorrelation_dictLst = [
        {
            title: 'Data Sources',
            content: (<>
                <div style={{ height: '340px', overflow: 'scroll' }}>
                    <p>
                        <li><strong>Source: </strong>Global Burden of Disease Study 2021</li><br />

                        <li><strong>Years: </strong>1990-2021</li><br />

                        <li><strong>Geographic Coverage: </strong>46 countries in Europe</li><br />

                        <li><strong>Age Groups: </strong>Under 25 (0–24 years), 25–50 (25 to 49 years), Above 50 (50 and older), Age-Standardized (Adjusted rates that account for differences in age distributions across populations)</li><br />

                        <li><strong>Sex Groups: </strong>Both Sexes (Aggregated data for males and females), Males (males only), and Females (females only)</li><br />

                        <li><strong>CRC Incidence Rate: </strong>Number of new CRC cases diagnosed per 100,000 population in a year</li><br />

                        <li><strong>Risk factors: </strong>22 risk factors, comprising 4 lifestyle factors, 15 nutrition factors, 2 comorbidities, and 1 socioeconomic factor</li><br />

                        <li><strong>Summary Exposure Value (SEV) rates: </strong>This metric represents the relative risk-weighted prevalence of exposure, accounting for both the extent of exposure and its contribution to disease burden. SEV is the metric for 21 risk factors (excluding socioeconomic factor)</li><br />
                    </p>
                </div>
            </>)
        },
        {
            title: 'Methodology',
            content: (<>
                <div style={{ height: '340px', overflow: 'scroll' }}>

                    <strong>Trend Correlation</strong><br /><br />

                    <p>Associations between long-term trends in modifiable risk factors and trends in CRC incidence were examined over a 30-year period (1990–2021) to determine whether changes in specific risk factors correspond to increases or decreases in CRC incidence over time.</p>
                    <p>To evaluate these associations, a weighted linear regression analysis was conducted using Estimated Annual Percentage Changes (EAPCs) for both risk factors and CRC incidence.</p>
                    <p>The <strong>EAPC</strong> describes the rate of change in Age-Standardized Rates (ASRs) over time by fitting a regression model to the natural logarithm of ASRs, using time as the explanatory variable. This approach applies a Generalized Linear Model with a Gaussian distribution and assumes a constant rate of change on the logarithmic scale.</p>
                    <p>A <strong>Weighted Linear Regression</strong> model assessed the association between the EAPC of a risk factor (independent variable) and the EAPC of CRC incidence (dependent variable). Weights were derived from the inverse of the sum of squared standard errors of both variables, incorporating uncertainty in both axes. Outliers were identified using studentized residuals, with a threshold of ±2.5.</p>

                    The analysis included<strong>22 risk factors</strong> and was performed across defined age and sex groups.

                    <p><strong>Interpreting Associations:</strong></p>

                    <p><strong>Positive association:</strong> regression coefficients (β) &gt; 0 and p-value &lt; 0.05 (an increasing trend in the risk factor is associated with an increasing trend in CRC incidence)</p>

                    <p><strong>Negative association:</strong> β &gt; 0 and p-value  &lt; 0.05 (a decreasing trend in the risk factor is associated with a decreasing trend in CRC incidence)</p>

                    <strong>No statistically significant association:</strong> p ≥ 0.05

                </div>
            </>)
        }

    ];
    const accordionContentForecastingCRC_dictLst = [
        {
            title: 'Data Sources',
            content: (<>
                <div style={{ height: '340px', overflow: 'scroll' }}>
                    <p>
                        <li><strong>Source: </strong>Global Burden of Disease Study 2021</li><br />

                        <li><strong>Years: </strong>1990-2021</li><br />

                        <li><strong>Geographic Coverage: </strong>46 countries in Europe</li><br />

                        <li><strong>Age Groups: </strong>Under 25 (0–24 years), 25–50 (25 to 49 years), Above 50 (50 and older), Age-Standardized (Adjusted rates that account for differences in age distributions across populations)</li><br />

                        <li><strong>Sex Groups: </strong>Both Sexes (Aggregated data for males and females), Males (males only), and Females (females only)</li><br />

                        <li><strong>CRC Incidence Rate: </strong>Number of new CRC cases diagnosed per 100,000 population in a year</li><br />

                        <li><strong>Risk factors: </strong>22 risk factors, comprising 4 lifestyle factors, 15 nutrition factors, 2 comorbidities, and 1 socioeconomic factor</li><br />

                        <li><strong>Summary Exposure Value (SEV) rates: </strong>This metric represents the relative risk-weighted prevalence of exposure, accounting for both the extent of exposure and its contribution to disease burden. SEV is the metric for 21 risk factors (excluding socioeconomic factor)</li><br />
                    </p>
                </div>
            </>)
        },
        {
            title: 'Methodology',
            content: (<>
                <div style={{ height: '340px', overflow: 'scroll' }}>
                    <p>
                        <strong>Forecasting CRC</strong><br /><br />

                        <p>Future CRC incidence rates over the next 30 years across EU countries for various population groups are projected using the AutoRegressive Integrated Moving Average (ARIMA) time series model, which captures temporal trends and autocorrelations in historical data.</p>
                        <p>The <strong>ARIMA </strong>model integrates three components: autoregression (using past values), moving average (using past forecast errors), and differencing (to correct for non-stationarity). It is defined by the parameters ARIMA(p, d, q), where p is the number of lagged observations, d is the number of differencing steps required for stationarity, and q is the number of lagged forecast errors. An automated ARIMA (autoARIMA) approach was employed to identify optimal parameter values by testing multiple combinations and selecting the best-fitting model based on the Akaike Information Criterion (AIC).</p>
                        <p>The final models produced projections with <strong>95% confidence intervals (CI)</strong>, providing <strong>country</strong>-specific and <strong>subgroup</strong>-specific forecasts (by age and sex) of CRC incidence rates through the year 2050.</p>
                    </p>
                </div>
            </>)
        },

    ];
    const accordionContentAssociation_dictLst = [{
        title: 'Data Sources',
        content: (<>
            <div style={{ height: '340px', overflow: 'scroll' }}>
                <p>
                    <li><strong>Source: </strong>Global Burden of Disease Study 2021</li><br />

                    <li><strong>Years: </strong>1990-2021</li><br />

                    <li><strong>Geographic Coverage: </strong>46 countries in Europe</li><br />

                    <li><strong>Age Groups: </strong>Under 25 (0–24 years), 25–50 (25 to 49 years), Above 50 (50 and older), Age-Standardized (Adjusted rates that account for differences in age distributions across populations)</li><br />

                    <li><strong>Sex Groups: </strong>Both Sexes (Aggregated data for males and females), Males (males only), and Females (females only)</li><br />

                    <li><strong>CRC Incidence Rate: </strong>Number of new CRC cases diagnosed per 100,000 population in a year</li><br />

                    <li><strong>Risk factors: </strong>22 risk factors, comprising 4 lifestyle factors, 15 nutrition factors, 2 comorbidities, and 1 socioeconomic factor</li><br />

                    <li><strong>Summary Exposure Value (SEV) rates: </strong>This metric represents the relative risk-weighted prevalence of exposure, accounting for both the extent of exposure and its contribution to disease burden. SEV is the metric for 21 risk factors (excluding socioeconomic factor)</li><br />
                </p>
            </div>
        </>)
    }, {
        title: 'Methodology',
        content: (<>
            <div style={{ height: '340px', overflow: 'scroll' }}>
                <p>
                    <strong>Association analysis</strong><br /><br />

                    Associations between CRC incidence and modifiable risk factors were assessed using a <strong>Fixed-Effects Regression Model</strong>, applied across 46 countries and 20 years.<br /><br />

                    A Fixed-Effects Regression Model is a longitudinal analysis that accounts for repeated measurements within each country while capturing the shared influence of risk factors across Europe.<br /><br />

                    To address the latency between exposure and cancer development, a <strong>10-year time lag</strong> was applied, pairing risk factor data from 1990–2011 with CRC incidence data from 2000–2021. <br /><br />

                    The analysis included <strong>22 risk factors</strong> and was performed across defined <strong>age</strong> and <strong>sex groups</strong>.<br /><br />

                    <strong>Interpreting Associations:</strong><br /><br />
                    <strong>Positive association: </strong>regression coefficients (β) {">"} 0 and p-value {"<"} 0.05<br /><br />
                    <strong>Negative association: </strong>β {"<"} 0 and p-value  {"<"} 0.05<br /><br />
                    <strong>No statistically significant association: </strong>p ≥ 0.05<br /><br />
                </p>
            </div>
        </>)
    }, {
        title: 'References',
        content: (<>

            <p>
                P. D. Allison, Fixed effects regression models. SAGE publications, 2009. <br /><br />

                B. Hicks, J. A. Kaye, L. Azoulay, K. B. Kristensen, L. A. Habel, and A. Pottegard, "The application of lag times in cancer pharmacoepidemi ology: a narrative review," Annals of Epidemiology, vol. 84, pp. 25–32, 2023.<br /><br />

            </p>

        </>)
    }];

    const toggleRiskFactor = (factor) => {
        setSelectedRiskFactors((prev) => {
            if (prev.includes(factor)) {
                return prev.filter((f) => f !== factor);
            } else if (prev.length < 10) {
                return [...prev, factor];
            } else {
                return prev;
            }
        });
    };

    // Fetch Trend Correlation data from API
    useEffect(() => {
        if (analysisType !== "Trend Correlation") return;




        const controller = new AbortController();
        setLoading(true);

        const params = new URLSearchParams({
            sex: sexFilter,
            age: ageFilter,
            year_interval: yearInterval.split(" ")[0],
        });

        fetch(`https://oncodir-datapi.catalink.eu/v1/data-fusion/extra/trend-correlation?${params.toString()}`, {
            method: "GET",
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
                return res.json();
            })
            .then(data => {
                setRawTrendCorrelationData(data.results); // store all fetched risk factors
            })
            .catch(err => {
                if (err.name !== "AbortError") console.error(err);
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [analysisType, sexFilter, ageFilter, yearInterval, token]);





    const observed = filteredForecastingData.filter(d => d.source === "Observed");
    const forecasted = filteredForecastingData.filter(d => d.source === "Forecasted");

    const years = filteredForecastingData.map(d => d.Year);

    // Values for lines
    const observedValues = observed.map(d => d["Colon and rectum cancer Incidence_value"]);
    const forecastedValues = forecasted.map(d => d["Colon and rectum cancer Incidence_value"]);

    // CI bounds
    const lowerBounds = forecasted.map(d => d["Colon and rectum cancer Incidence_lower"]);
    const upperBounds = forecasted.map(d => d["Colon and rectum cancer Incidence_upper"]);


    useEffect(() => {
        const TOKEN_KEY = "oncodir_token";
        const TOKEN_TS_KEY = "oncodir_token_ts"; // timestamp of last token fetch
        const ONE_DAY = 24 * 60 * 60 * 1000; // 24 hours in ms

        const getToken = async () => {
            const storedToken = localStorage.getItem(TOKEN_KEY);
            const storedTs = localStorage.getItem(TOKEN_TS_KEY);
            const now = Date.now();

            if (storedToken && storedTs && now - parseInt(storedTs) < ONE_DAY) {
                // Token is still valid
                setToken(storedToken);
                return;
            }

            // Token missing or expired → fetch new token
            const controller = new AbortController();
            try {
                const res = await fetch(
                    "https://oncodir-datapi.catalink.eu/v1/services/login/",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            service_name: import.meta.env.VITE_SERVICE_NAME,
                            password: import.meta.env.VITE_SERVICE_PASSWORD,
                        }),
                        signal: controller.signal,
                    }
                );

                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const newToken = await res.text();

                localStorage.setItem(TOKEN_KEY, newToken);
                localStorage.setItem(TOKEN_TS_KEY, now.toString());
                setToken(newToken);
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Login failed:", err);
                }
            }

            return () => controller.abort();
        };

        getToken();
    }, []);


    useEffect(() => {
        if (analysisType !== "Trend Analysis") return;
        if (!token) return;
        const controller = new AbortController();
        setLoading(true);
        const params = new URLSearchParams({
            sex: sexFilter,
            age: ageFilter,
            year_interval: yearInterval.split(" ")[0],

        });

        fetch(`https://oncodir-datapi.catalink.eu/v1/data-fusion/extra/trends?${params.toString()}`, {
            method: "GET",
            signal: controller.signal,
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
                // Add auth if needed:

            }
        })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
                // console.log(res)
                return res.json();
            })
            .then((data) => {
                // console.log("Trend Analysis Data:", data.results);  // 👈 Logging here

                setRawData(data.results);
            })
            .catch((err) => {
                if (err.name !== "AbortError") {
                    console.error("Failed to load trend data:", err);
                }
            })
            .finally(() => setTimeout(() => {
                // ...your code
                setLoading(false);
            }, 300));

        return () => controller.abort();
    }, [analysisType, sexFilter, ageFilter, yearInterval, token]);



    useEffect(() => {
        if (analysisType !== "Association Analysis") return;
        if (!token) return;
        const controller = new AbortController();
        setLoading(true);

        const params = new URLSearchParams({
            sex: sexFilter,
            age: ageFilter,
            year_interval: yearInterval.split(" ")[0],
        });
        // selectedRiskFactors.forEach((rf) => {
        //     params.append("Risk_Factor", rf);
        // });
        fetch(`https://oncodir-datapi.catalink.eu/v1/data-fusion/extra/association?${params.toString()}`, {
            method: "GET",
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            }
        })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
                return res.json();
            })
            .then((data) => {
                //  console.log("Association Analysis Data:", data.results);  // 👈 Logging here
                //  console.log("Full API URL:", `http://oncodir.catalink.eu:7565/v1/data-fusion/extra/association?${params.toString()}`);
                setAssociationData(data.results)
            })
            .catch((err) => {
                if (err.name !== "AbortError") {
                    console.error("Failed to load association data:", err);
                }
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [analysisType, sexFilter, ageFilter, selectedRiskFactors,token]);




    useEffect(() => {
        if (!isLoggedIn) return;
        if (!rawData.length || analysisType !== "Trend Analysis") return;

        // setLoading(true);

        setTimeout(() => {
            const filtered = rawData.filter(
                (entry) =>
                    entry.sex === sexFilter &&
                    entry.age === ageFilter &&
                    entry.year_interval === yearInterval
            );

            const seenCountries = new Set();
            const formatted = [];

            for (const entry of filtered) {
                const country = entry.Country;
                if (seenCountries.has(country)) continue;

                seenCountries.add(country);

                const dataPoint = {
                    name: country,
                    value: entry.eapc,
                    trend: entry.trend,
                    eapc_low: entry.eapc_low,
                    eapc_up: entry.eapc_up,
                };

                // ⬇️ Override color for stable trend
                if (entry.trend === "Stable") {
                    dataPoint.itemStyle = { color: "#cccccc" };
                }

                formatted.push(dataPoint);
            }

            // ⬇️ Calculate dynamic min/max EAPC (ignoring nulls)
            const eapcValues = formatted
                .map((d) => d.value)
                .filter((v) => typeof v === "number");
            const minEapc = Math.min(...eapcValues);
            const maxEapc = Math.max(...eapcValues);

            setChartData(formatted);
            setEapcMin(minEapc);
            setEapcMax(maxEapc);
            setLoading(false);
        }, 300);
    }, [rawData]);


    const [eapcMin, setEapcMin] = useState(-3);
    const [eapcMax, setEapcMax] = useState(3);

    // Dynamic Y-axis range calculation
    const trendCoefValues = filteredTrendCorrelationData.map(item => item.Coef);
    const trendCILowerValues = filteredTrendCorrelationData.map(item => Number(item.CI_Lower));
    const trendCIUpperValues = filteredTrendCorrelationData.map(item => Number(item.CI_Upper));

    const trendYMinRaw = Math.min(...trendCoefValues, ...trendCILowerValues);
    const trendYMaxRaw = Math.max(...trendCoefValues, ...trendCIUpperValues);

    let trendPadding = 0;
    const trendRange = trendYMaxRaw - trendYMinRaw;

    if (trendYMinRaw < 0.009) {
        trendPadding = trendRange * 0.5;
    }
    if (trendYMaxRaw > 1) {
        trendPadding = trendRange * 0.4;
    }
    if (trendYMaxRaw < 1) {
        trendPadding = trendRange * 4;
    }

    let trendYMin = trendYMinRaw - trendPadding;
    let trendYMax = trendYMaxRaw + trendPadding;

    if (trendYMin > 1 || trendYMax > 1) {
        trendYMin = Math.floor(trendYMin);
        trendYMax = Math.ceil(trendYMax);
    }

    const trendCorrelationOption = {

        // title: {
        //     text: "Trend Correlation Coefficients by Risk Factor",
        //     left: "center"
        // },
        tooltip: {
            trigger: "axis",
            axisPointer: { type: "shadow" },
            formatter: function (params) {
                const name = params[0]?.name || "";

                const coefData = params.find(item => item.seriesName === "Correlation Coefficient");
                const ciData = params.find(item => item.seriesName === "Confidence Intervals (95%)");

                let result = `<div style="text-align:left;"><strong>Trend Correlation with ${name}</strong><br>`;

                if (coefData) {
                    result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${coefData.color};"></span>`;
                    result += `Coefficient: <strong>${coefData.value.toFixed(3)}</strong><br>`;
                }

                if (ciData && Array.isArray(ciData.value)) {
                    const low = ciData.value[2];
                    const high = ciData.value[3];
                    result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${ciData.color};"></span>`;
                    result += `Confidence Interval (95%): <strong>[${low.toFixed(3)}, ${high.toFixed(3)}]</strong>`;
                }

                result += `</div>`;
                return result;
            }
        },
        legend: {
            data: ["Correlation Coefficient", "Confidence Intervals (95%)"],
            top: "10%"
        },
        grid: {
            top: "20%",
            bottom: "25%"
        },
        xAxis: {
            type: "category",
            data: filteredTrendCorrelationData.map((item) => item.Risk_Factor),
            axisLabel: { rotate: 30, fontSize: 12 }
        },
        yAxis: {
            type: "value",
            name: "Correlation Coefficient",
            nameRotate: 90,
            nameLocation: "center",
            nameGap: 55,
            min: trendYMin,
            max: trendYMax
        },
        series: [
            {
                name: "Correlation Coefficient",
                type: "bar",
                data: filteredTrendCorrelationData.map((item) => item.Coef),
                itemStyle: {
                    color: "#5b9bd5"
                },
                barWidth: "50%",
                z: 1
            },
            {
                name: "Confidence Intervals (95%)",
                type: "custom",
                data: filteredTrendCorrelationData.map((item, index) => [
                    index,
                    item.Coef,
                    item.CI_Lower,
                    item.CI_Upper
                ]),
                renderItem: (params, api) => {
                    const xValue = api.value(0);
                    const coef = api.value(1);
                    const low = api.value(2);
                    const high = api.value(3);
                    const x = api.coord([xValue, 0])[0];
                    const yLow = api.coord([0, low])[1];
                    const yHigh = api.coord([0, high])[1];
                    const barWidth = 10;

                    return {
                        type: "group",
                        children: [
                            {
                                type: "line",
                                shape: { x1: x, y1: yLow, x2: x, y2: yHigh },
                                style: { stroke: "#5470c6", lineWidth: 2 },
                                z: 2
                            },
                            {
                                type: "line",
                                shape: { x1: x - barWidth / 2, y1: yLow, x2: x + barWidth / 2, y2: yLow },
                                style: { stroke: "#5470c6", lineWidth: 2 },
                                z: 2
                            },
                            {
                                type: "line",
                                shape: { x1: x - barWidth / 2, y1: yHigh, x2: x + barWidth / 2, y2: yHigh },
                                style: { stroke: "#5470c6", lineWidth: 2 },
                                z: 2
                            }
                        ]
                    };
                },
                encode: {
                    x: 0,
                    y: 1
                },
                data: filteredTrendCorrelationData.map((item, index) => [
                    index,
                    item.Coef,
                    item.CI_Lower,
                    item.CI_Upper
                ]),
                z: 2
            }
        ]
    };




    const trendOption = {
        // title: {
        //     text: "EAPC in European Countries",
        //     left: "center",
        // },
        tooltip: {
            trigger: "item",
            formatter: (params) => {
                const { name, value, data } = params;
                if (!data) return `${name}<br/>No data`;

                return `
          <strong>${name}</strong><br/>
          EAPC: <strong>${value?.toFixed(2) ?? "N/A"}</strong><br/>
          Trend: <strong>${data.trend}</strong><br/>
          Confidence Interval (95%): <strong>[${data.eapc_low?.toFixed(2)}, ${data.eapc_up?.toFixed(2)}]</strong>
        `;
            },
        },
        visualMap: [
            {
                type: "continuous",
                min: eapcMin,
                max: eapcMax,

                calculable: true,
                inRange: {
                    color: ["#4575b4", "#d94e5d"], // blue → neutral → red
                },
                outOfRange: {
                    color: '#ffffff' // white for missing data
                },
                text: ["Increasing EAPC", "Decreasing EAPC"],
                orient: "vertical",
                left: "left",
                bottom: "10%",
                textStyle: {
                    color: "#000"
                }
            },

        ]
        ,
        geo: {
            map: "world",
            roam: true,
            zoom: 3.7,
            center: [20, 55],
            emphasis: {
                label: { show: false },
            },
        }, graphic: [
            {
                type: 'group',
                left: 10,
                bottom: 300,
                silent: true, // Prevent pointer changes and interactions
                children: [
                    {
                        type: 'rect',
                        shape: {
                            x: 0,
                            y: 0,
                            width: 16,
                            height: 16,
                            r: 4
                        },
                        style: {
                            fill: '#cccccc'
                        }
                    },
                    {
                        type: 'text',
                        left: 22,
                        top: 1,
                        style: {
                            text: 'Stable',
                            font: '14px Arial',
                            fill: '#000'
                        }
                    }
                ]
            },
            {
                type: 'group',
                left: 10,
                bottom: 275,
                silent: true, // Also here
                children: [
                    {
                        type: 'rect',
                        shape: {
                            x: 0,
                            y: 0,
                            width: 16,
                            height: 16,
                            r: 4
                        },
                        style: {
                            fill: '#eeeeee',

                        }
                    },
                    {
                        type: 'text',
                        left: 22,
                        top: 1,
                        style: {
                            text: 'NaN',
                            font: '14px Arial',
                            fill: '#000'
                        }
                    }
                ]
            }
        ],


        series: [
            {
                name: "EAPC",
                type: "map",
                map: "world",
                geoIndex: 0,
                data: chartData,
            },
        ],
        toolbox: {
            feature: {
                saveAsImage: {
                    show: true,
                    title: 'Download as Image',
                    type: 'png', // or 'jpeg'
                    backgroundColor: '#fff',
                    // Optional: specify pixelRatio for higher resolution
                    pixelRatio: 2,
                }
            },
            right: 20,
            top: 0,
        },
    };

    // const uniqueTrendCorrelationRiskFactors = Array.from(
    //     new Set(rawData.map((d) => d.Risk_Factor))
    // ).sort();
    const uniqueRiskFactors = React.useMemo(() => {
        const sourceData =
            analysisType === "Trend Correlation"
                ? rawTrendCorrelationData  // always use full dataset here
                : associationData;

        return Array.from(new Set(sourceData.map((d) => d.Risk_Factor))).sort();
    }, [analysisType, rawTrendCorrelationData, associationData]);

    useEffect(() => {
        const filtered = rawTrendCorrelationData.filter(d =>
            selectedRiskFactors.includes(d.Risk_Factor)
        );
        setFilteredTrendCorrelationData(filtered);
    }, [selectedRiskFactors, rawTrendCorrelationData]);



    const filteredAssociationData = associationData.filter((d) =>

        selectedRiskFactors.includes(d.Risk_Factor) &&
        d.sex === sexFilter &&
        d.age === ageFilter
    );
    // … keep every thing else …
    // When your filteredAssociationData or options change, wait for chart to render, then generate image
    useEffect(() => {
        if (!chartRef.current) return;

        // Delay to allow the chart to re-render fully
        const timeout = setTimeout(() => {
            const echartsInstance = chartRef.current.getEchartsInstance();
            if (!echartsInstance) return;

            const params = analysisType === "Trend Analysis"
                ? { type: "webp", quality: 0.7, pixelRatio: 0.8, backgroundColor: "#fff" }
                : { type: "webp", quality: 0.7, pixelRatio: 1, backgroundColor: "#fff" };

            const url = echartsInstance.getDataURL(params);
            setChartImageUrl(url);
        }, 500);  // 500ms delay to ensure rendering done

        return () => clearTimeout(timeout);  // cleanup on unmount or param changes
    }, [analysisType, chartData, filteredAssociationData]);
    // Calculate the dynamic range for the Y-axis based on Coefficients and Confidence Intervals
    // Parse numbers from strings returned by toFixed
    const coefValues = filteredAssociationData.map(item => item.Coef);
    const ciLowerValues = filteredAssociationData.map(item => Number(item.CI_Lower.toFixed(0)));
    const ciUpperValues = filteredAssociationData.map(item => Number(item.CI_Upper.toFixed(0)));

    // Corrected min calculation
    const yMinRaw = Math.min(...coefValues, ...ciLowerValues);
    const yMaxRaw = Math.max(...coefValues, ...ciUpperValues);


    let padding = 0;
    const range = yMaxRaw - yMinRaw;

    if (yMinRaw < 0.009) {
        padding = range * 0.5;
    }
    if (yMaxRaw > 1) {
        padding = range * 0.4;
    }
    if (yMaxRaw < 1) {
        padding = range * 4;
    }

    let yMin = yMinRaw - padding;
    let yMax = yMaxRaw + padding;

    // Round to integers if both are over 1
    if (yMin > 1 || yMax > 1) {
        yMin = Math.floor(yMin);
        yMax = Math.ceil(yMax);
    }

    const yAxisRange = {
        min: yMin,
        max: yMax
    };

    // console.log(yMin);
    // console.log(yMax);
    const associationOption = {
        title: {
            text: "Associations between Risk Factor Exposure & CRC incidence",
            left: "center"
        },
        tooltip: {
            trigger: "axis",
            axisPointer: { type: "shadow" },
            formatter: function (params) {
                const name = params[0]?.name || "";

                const coefData = params.find(item => item.seriesName === "Coefficient");
                const ciData = params.find(item => item.seriesName === "Confidence Intervals (95%)");

                let result = `<div style="text-align:left;"><strong>Association between ${name} and CRC Incidence</strong><br>`;

                if (coefData) {
                    result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${coefData.color};"></span>`;
                    result += `Coefficient: <strong>${coefData.value}</strong><br>`;
                }

                if (ciData && Array.isArray(ciData.value)) {
                    const low = ciData.value[2];
                    const high = ciData.value[3];
                    result += `<span style="display:inline-block;margin-right:5px;border-radius:10px;width:10px;height:10px;background-color:${ciData.color};"></span>`;
                    result += `Confidence Interval (95%): <strong>[${low}, ${high}]</strong>`;
                }

                result += `</div>`;
                return result;
            }


        },
        legend: {
            data: ["Coefficient", "Confidence Intervals (95%)"],
            top: "10%"
        },

        grid: {
            top: "20%",
            bottom: "25%"
        },
        xAxis: {
            type: "category",
            data: filteredAssociationData.map((item) => item.Risk_Factor),
            axisLabel: { rotate: 30, fontSize: 12 }
        },
        yAxis: {
            type: "value",
            name: "Coefficient",
            nameRotate: 90,  // Rotate the axis label vertically
            nameLocation: "center",
            nameGap: 55,
            min: yAxisRange.min,  // Set dynamic min based on coefficient and CI values
            max: yAxisRange.max   // Set dynamic max based on coefficient and CI values
        },
        series: [
            {
                name: "Coefficient",
                type: "bar",
                data: filteredAssociationData.map((item) => item.Coef),
                itemStyle: {
                    color: "#5B9BD5"
                },
                barWidth: "50%",
                z: 1
            },
            {
                name: "Confidence Intervals (95%)",
                type: "custom",
                renderItem: (params, api) => {
                    const xValue = api.value(0);
                    const coef = api.value(1);
                    const low = api.value(2); // CI_Lower + 20
                    const high = api.value(3); // CI_Upper + 20
                    const x = api.coord([xValue, 0])[0];
                    const yLow = api.coord([0, low])[1];
                    const yHigh = api.coord([0, high])[1];
                    const barWidth = 10;

                    return {
                        type: "group",
                        children: [
                            {
                                type: "line",
                                shape: { x1: x, y1: yLow, x2: x, y2: yHigh },
                                style: { stroke: "#5470c6", lineWidth: 2 },
                                z: 2
                            },
                            {
                                type: "line",
                                shape: { x1: x - barWidth / 2, y1: yLow, x2: x + barWidth / 2, y2: yLow },
                                style: { stroke: "#5470c6", lineWidth: 2 },
                                z: 2
                            },
                            {
                                type: "line",
                                shape: { x1: x - barWidth / 2, y1: yHigh, x2: x + barWidth / 2, y2: yHigh },
                                style: { stroke: "#5470c6", lineWidth: 2 },
                                z: 2
                            }
                        ]
                    };
                },
                encode: {
                    x: 0,
                    y: 1
                },
                data: filteredAssociationData.map((item, index) => [
                    index,
                    item.Coef,
                    item.CI_Lower,
                    item.CI_Upper
                ]),
                z: 2
            }
        ]
    };



    const accordionContentMap: Record<string, any[]> = {
        "Trend Analysis": accordionContentTrend_dictLst,
        "Association Analysis": accordionContentAssociation_dictLst,
        "Trend Correlation": accordionContentTrendCorrelation_dictLst,
        "Forecasting CRC": accordionContentForecastingCRC_dictLst,
    };

    const urlToAnalysisType: Record<string, string> = {
        "trend-analysis": "Trend Analysis",
        "association-analysis": "Association Analysis",
        "trend-correlation": "Trend Correlation",
        "forecasting-crc": "Forecasting CRC",
    };

    const analysisTypeToUrl: Record<string, string> = {
        "Trend Analysis": "trend-analysis",
        "Association Analysis": "association-analysis",
        "Trend Correlation": "trend-correlation",
        "Forecasting CRC": "forecasting-crc",
    };

    const analysisTypeHints: Record<string, string> = {
        "Trend Analysis": "Long-term CRC incidence by demographic subgroup.",
        "Association Analysis": "Statistical associations between CRC and SEVs.",
        "Trend Correlation": "Relationships between CRC and SEV trends.",
        "Forecasting CRC": "Short-term extrapolations from historical data.",
    };

    const accordionContent_dictLst = accordionContentMap[analysisType] || [];
    useEffect(() => {
        if (isRestoring) return;

        const params = new URLSearchParams(location.search);
        const tabParam = params.get("tab");
        const mappedType = tabParam ? urlToAnalysisType[tabParam] : "";

        if (mappedType) {
            setAnalysisType(mappedType);
        }
    }, [location.search, isRestoring]);

    useEffect(() => {
        if (analysisType === "Association Analysis") {
            setSelectedRiskFactors([...DEFAULT_RISK_FACTORS]);
        } else if (analysisType === "Trend Correlation") {
            setSelectedRiskFactors([...DEFAULT_RISK_FACTORS2]);
        } else {
            setSelectedRiskFactors([]); // optional fallback
        }
    }, [analysisType]);

    const handleAnalysisTypeChange = (value: string) => {
        setAnalysisType(value);



        // ✅ URL sync
        const urlParam = analysisTypeToUrl[value] || "";

        const params = new URLSearchParams(location.search);

        if (urlParam) params.set("tab", urlParam);
        else params.delete("tab");

        navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    };




    if (!isLoggedIn) return <h2 className="text-center mt-5">Unauthorized</h2>;
    return (
        <>
            <style>{`
                .ta-page { padding: 24px 0 40px; }
                .ta-header { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border, #e5e7eb); }
                .ta-header h1 { font-size: 22px; font-weight: 800; color: var(--text, #0f172a); margin: 0 0 3px; }
                .ta-header p { font-size: 14px; color: var(--text-muted, #475569); margin: 0; }

                .ta-sidebar-card {
                    background: var(--bg, #fff);
                    border: 1px solid var(--border, #e5e7eb);
                    border-radius: 14px;
                    padding: 18px 16px;
                    margin-bottom: 12px;
                }
                .ta-sidebar-card .filter-label {
                    display: block;
                    font-size: 13px;
                    font-weight: 700;
                    color: var(--text-muted, #475569);
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    margin-bottom: 8px;
                }
                .ta-select {
                    width: 100%;
                    border: 1.5px solid var(--border, #e5e7eb);
                    border-radius: 8px;
                    padding: 7px 10px;
                    font-size: 14px;
                    color: var(--text, #0f172a);
                    background: #fff;
                    outline: none;
                    cursor: pointer;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    font-family: inherit;
                }
                .ta-select:focus { border-color: var(--brand, #1f6580); box-shadow: 0 0 0 3px rgba(31,101,128,0.15); }

                .ta-check-list {
                    max-height: 240px;
                    overflow-y: auto;
                    border: 1.5px solid var(--border, #e5e7eb);
                    border-radius: 8px;
                    padding: 6px 4px;
                }
                .ta-check-list label {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 4px 8px;
                    font-size: 14px;
                    color: var(--text, #0f172a);
                    cursor: pointer;
                    border-radius: 5px;
                }
                .ta-check-list label:hover { background: #f0f5f8; }
                .ta-check-list input[type="checkbox"] { accent-color: var(--brand, #1f6580); flex-shrink: 0; color-scheme: light; }

                .ta-chart-wrapper {
                    position: relative;
                    border: 1px solid var(--border, #e5e7eb);
                    border-radius: 14px;
                    overflow: hidden;
                    background: #fff;
                    min-height: 580px;
                    display: flex;
                    flex-direction: column;
                }
                .ta-chart-inner { padding: 12px; flex: 1; }
                .ta-chart-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 580px;
                    gap: 12px;
                }
                .ta-chart-loading span { font-size: 14px; color: var(--text-muted, #475569); font-weight: 500; }
                .ta-empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 400px;
                    padding: 32px;
                    text-align: center;
                }
                .ta-empty-icon { width: 52px; height: 52px; border-radius: 14px; background: #e8f2f6; color: var(--brand-dark, #185569); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
                .ta-empty-title { font-size: 16px; font-weight: 700; color: var(--text, #0f172a); margin: 0 0 6px; }
                .ta-empty-sub { font-size: 14px; color: var(--text-muted, #475569); margin: 0; max-width: 380px; line-height: 1.6; }


                @media (prefers-reduced-motion: reduce) {
                    .ta-select, .ta-check-list label { transition: none; }
                }
            `}</style>

        <div className="container-fluid ta-page">

            <div className="ta-header">
                <h1>{analysisType || "CRC Trend & Association Analysis"}</h1>
                <p>{analysisType ? analysisTypeHints[analysisType] : "Historical, subgroup-level analyses (associational)."}</p>
            </div>

            <div className="row g-3">
                {/* ── Left sidebar ── */}
                <div className="col-xl-2 col-lg-3">
                    <div className="ta-sidebar-card">
                        <span className="filter-label">Analysis Type</span>
                        <select
                            className="ta-select"
                            value={analysisType}
                            onChange={(e) => handleAnalysisTypeChange(e.target.value)}
                            aria-label="Select analysis type"
                        >
                            <option value="">— Select —</option>
                            {Object.keys(analysisTypeToUrl).map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    {(analysisType === "Association Analysis" || analysisType === "Trend Correlation") && (
                        <div className="ta-sidebar-card">
                            <span className="filter-label">Risk Factors (max 10)</span>
                            <div className="ta-check-list" role="group" aria-label="Risk factor checkboxes">
                                {uniqueRiskFactors.map((factor, index) => {
                                    const isSelected = selectedRiskFactors.includes(factor);
                                    const disabled = selectedRiskFactors.length >= 10 && !isSelected;
                                    return (
                                        <label key={index} style={{ opacity: disabled ? 0.5 : 1 }}>
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleRiskFactor(factor)}
                                                disabled={disabled}
                                            />
                                            {factor}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                    {analysisType === "Forecasting CRC" && (
                        <div className="ta-sidebar-card">
                            <span className="filter-label">Country</span>
                            <select
                                className="ta-select"
                                value={selectedCountry}
                                onChange={(e) => setSelectedCountry(e.target.value)}
                                aria-label="Select country"
                            >
                                <option value="">— Select a country —</option>
                                {COUNTRY_OPTIONS.map((country, index) => (
                                    <option key={index} value={country}>{country}</option>
                                ))}
                            </select>
                            {selectedCountry && (
                                <div style={{ marginTop: "12px" }}>
                                    <span className="filter-label">Year range</span>
                                    <YearFilter
                                        minYear_int={minYear_int ?? dataMinYear}
                                        set_minYear={set_minYear}
                                        maxYear_int={maxYear_int ?? dataMaxYear}
                                        set_maxYear={set_maxYear}
                                        floorYear_int={dataMinYear}
                                        ceilYear_int={dataMaxYear}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {((analysisType === "Forecasting CRC" && selectedCountry) ||
                        analysisType === "Trend Analysis" ||
                        analysisType === "Association Analysis" ||
                        analysisType === "Trend Correlation") && (
                        <div className="ta-sidebar-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            <div>
                                <span className="filter-label">Sex</span>
                                <select className="ta-select" value={sexFilter} onChange={(e) => setSexFilter(e.target.value)} aria-label="Select sex">
                                    <option value="Both">Both</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                            <div>
                                <span className="filter-label">Age</span>
                                <select className="ta-select" value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)} aria-label="Select age">
                                    <option value="Age-standardized">Age-standardized</option>
                                    <option value="Under 25">Under 25</option>
                                    <option value="25 to 50">25 to 50</option>
                                    <option value="Above 50">Above 50</option>
                                </select>
                            </div>
                            {analysisType === "Trend Analysis" && (
                                <div>
                                    <span className="filter-label">Year Interval</span>
                                    <select className="ta-select" value={yearInterval} onChange={(e) => setYearInterval(e.target.value)} aria-label="Select year interval">
                                        <option value="5 years (2016-2021)">5 years (2016–2021)</option>
                                        <option value="10 years (2011-2021)">10 years (2011–2021)</option>
                                        <option value="15 years (2006-2021)">15 years (2006–2021)</option>
                                        <option value="20 years (2001-2021)">20 years (2001–2021)</option>
                                        <option value="25 years (1996-2021)">25 years (1996–2021)</option>
                                        <option value="30 years (1991-2021)">30 years (1991–2021)</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    )}

                </div>


                {/* ── Center chart ── */}
                <div className="col-xl-8 col-lg-6">

                    {!analysisType && (
                        <div className="ta-chart-wrapper">
                            <div className="ta-empty-state">
                                <div className="ta-empty-icon" aria-hidden="true">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                                    </svg>
                                </div>
                                <p className="ta-empty-title">Select an Analysis Type</p>
                                <p className="ta-empty-sub">Choose <strong>Trend Analysis</strong>, <strong>Association Analysis</strong>, <strong>Trend Correlation</strong>, or <strong>Forecasting CRC</strong> from the sidebar to begin.</p>
                            </div>
                        </div>
                    )}

                    {analysisType === "Trend Analysis" && (
                        <div className="ta-chart-wrapper">
                            {loading ? (
                                <div className="ta-chart-loading">
                                    <div className="spinner" aria-label="Loading chart" />
                                    <span>Loading trend data…</span>
                                </div>
                            ) : (
                                <div className="ta-chart-inner">
                                    <ReactECharts ref={chartRef} key={JSON.stringify(chartData)} option={trendOption} style={{ height: "550px", width: "100%" }} />
                                </div>
                            )}
                        </div>
                    )}

                    {analysisType === "Association Analysis" && (
                        <div className="ta-chart-wrapper">
                            {loading ? (
                                <div className="ta-chart-loading">
                                    <div className="spinner" aria-label="Loading chart" />
                                    <span>Loading association data…</span>
                                </div>
                            ) : (
                                <div className="ta-chart-inner">
                                    <ReactECharts ref={chartRef} option={associationOption} style={{ height: "580px", width: "100%" }} />
                                </div>
                            )}
                        </div>
                    )}

                    {analysisType === "Trend Correlation" && (
                        <div className="ta-chart-wrapper">
                            {loading ? (
                                <div className="ta-chart-loading">
                                    <div className="spinner" aria-label="Loading chart" />
                                    <span>Loading trend correlation data…</span>
                                </div>
                            ) : (
                                <div className="ta-chart-inner">
                                    <ReactECharts ref={chartRef} key={JSON.stringify(chartData)} option={trendCorrelationOption} style={{ height: "580px", width: "100%" }} />
                                </div>
                            )}
                        </div>
                    )}

                    {analysisType === "Forecasting CRC" && !forecastChartOption && (
                        <div className="ta-chart-wrapper">
                            <div className="ta-empty-state">
                                <div className="ta-empty-icon" aria-hidden="true">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                                    </svg>
                                </div>
                                <p className="ta-empty-title">Select a Country</p>
                                <p className="ta-empty-sub">Choose a country from the sidebar to view the CRC forecast chart.</p>
                            </div>
                        </div>
                    )}

                    {analysisType === "Forecasting CRC" && forecastChartOption && (
                        <div className="ta-chart-wrapper">
                            {loading ? (
                                <div className="ta-chart-loading">
                                    <div className="spinner" aria-label="Loading chart" />
                                    <span>Loading forecast data…</span>
                                </div>
                            ) : (
                                <div className="ta-chart-inner">
                                    <ReactECharts ref={chartRef} key={JSON.stringify(chartData)} option={forecastChartOption} style={{ height: "580px", width: "100%" }} />
                                </div>
                            )}
                        </div>
                    )}

                    {analysisType && (
                        <div className="mt-3">
                            <SaveGraphButton iframeUrl={{ url: getChartImageUrl(analysisType === "Trend Analysis" ? chartIframeUrl : analysisType), params: getUriParams() }} />
                        </div>
                    )}

                </div>

                {/* ── Right: accordion + comments ── */}
                <div className="col-xl-2 col-lg-3">
                    <Accordion defaultActiveKey="-1" className="app-accordion" style={{ marginBottom: "16px" }}>
                        {accordionContent_dictLst.map(({ title, content }, index) => (
                            <Accordion.Item eventKey={index.toString()} key={index}>
                                <Accordion.Header>{title}</Accordion.Header>
                                <Accordion.Body className="text-start">{content}</Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                    <Comments />
                </div>

            </div>
        </div>
        </>
    );

};

export default EuropeMap;

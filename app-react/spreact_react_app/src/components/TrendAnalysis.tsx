import React, { useRef, useEffect, useState } from "react";
import * as AuthService from "../services/auth.service.tsx";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import worldJson from "../assets/map/world.json";
import { Form } from 'react-bootstrap';
import Comments from "./Comments.tsx";
import { Accordion } from 'react-bootstrap';
import SaveGraphButton from "./SaveGraphButton.tsx";
import { useLocation } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

echarts.registerMap("world", worldJson);

const EuropeMap = () => {


    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const chartRef = useRef<ReactECharts>(null);          // NEW
    const [chartIframeUrl, setChartIframeUrl] = useState("");


    useEffect(() => {
        setIsLoggedIn(AuthService.isLoggedIn());
    }, []);


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
    const [analysisType, setAnalysisType] = useState("");
    const [rawData, setRawData] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [sexFilter, setSexFilter] = useState("Male");
    const [ageFilter, setAgeFilter] = useState("Age-standardized");
    const [yearInterval, setYearInterval] = useState("5 years (2016-2021)");
    const [loading, setLoading] = useState(false);
    const [associationData, setAssociationData] = useState([]);
    const [selectedRiskFactors, setSelectedRiskFactors] = useState(DEFAULT_RISK_FACTORS);

    /* on first mount only */


    const location = useLocation();
    const savedIframeUrl = location.state?.iframeUrl;

    useEffect(() => {

        if (!savedIframeUrl) return;

        const url = new URL(savedIframeUrl);
        const params = new URLSearchParams(url.search);

        const analysis = params.get("analysis") || "";
        const sex = params.get("sex") || "Both";
        const age = params.get("age") || "Age-standardized";
        const years = params.get("years") || "5 years (2016-2021)";
        const risks = params.get("risks")?.split("|") || [];


        // Set your states here, which trigger fetch of JSON and rerender graph
        console.log(analysis)
        setAnalysisType(analysis);
        setSexFilter(sex);
        setAgeFilter(age);
        setYearInterval(years);
        setSelectedRiskFactors(risks);

    }, [savedIframeUrl, location.state]);

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

            </>)
        },
        {
            title: 'Methodology',
            content: (<>

                <p>
                    <strong>Trend Analysis</strong><br /><br />

                    Temporal trends in CRC incidence were analyzed utilizing the <strong>Estimated Annual Percentage Change (EAPC)</strong> over multiple intervals: 5, 10, 15, 20, 25, and 30 years.<br /><br />

                    The EAPC describes the rate of change in Age-Standardized Rates (ASRs) over time by fitting a regression model to the natural logarithm of ASRs, using time as the explanatory variable. This approach applies a Generalized Linear Model with a Gaussian distribution and assumes a constant rate of change on the logarithmic scale.<br /><br />

                    <strong>Interpreting Trends:</strong><br />
                    <strong>Increasing trend:</strong> EAPC and 95% CI {">"} 0<br />
                    <strong>Decreasing trend: </strong>EAPC and 95% CI {"<"} 0<br />
                    <strong>Stable trend: </strong>95% CI includes 0 (no statistically significant change)<br />

                </p>

            </>)
        },
        {
            title: 'References',
            content: (<>

                <p>
                    B. F. Hankey, L. A. Ries, C. L. Kosary, E. J. Feuer, R. M. Merrill, L. X. Clegg, and B. K. Edwards, “Partitioning linear trends in age-adjusted rates,” Cancer causes & control, vol. 11, pp. 31–35, 2000. <br /><br />

                    L. X. Clegg, B. F. Hankey, R. Tiwari, E. J. Feuer, and B. K. Edwards, “Estimating average annual per cent change in trend analysis,” Statistics in medicine, vol. 28, no. 29, pp. 3670–3682, 2009.<br /><br />

                </p>

            </>)
        },
    ];

    const accordionContentAssociation_dictLst = [{
        title: 'Data Sources',
        content: (<>

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

        </>)
    }, {
        title: 'Methodology',
        content: (<>

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

        </>)
    }, {
        title: 'References',
        content: (<>

            <p>
                P. D. Allison, Fixed effects regression models. SAGE publications, 2009. <br /><br />

                B. Hicks, J. A. Kaye, L. Azoulay, K. B. Kristensen, L. A. Habel, and A. Pottegard, “The application of lag times in cancer pharmacoepidemi ology: a narrative review,” Annals of Epidemiology, vol. 84, pp. 25–32, 2023.<br /><br />

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



    useEffect(() => {

        if (analysisType !== "Trend Analysis") return;

        setLoading(true);
        fetch("/DF_trends_results.json")
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
                return res.json();
            })
            .then((data) => {
                setRawData(data);
            })
            .catch((err) => {
                console.error("Failed to load JSON:", err);
            })
            .finally(() => setLoading(false));
    }, [analysisType]);  // <- triggers when analysisType changes

    useEffect(() => {
        if (analysisType !== "Association Analysis") return;
        fetch("/DF_associations_results.json")
            .then((res) => res.json())
            .then((json) => setAssociationData(json))
            .catch((err) => console.error("Failed to fetch association data:", err));
    }, [analysisType]);


    // FOR API
    // useEffect(() => {
    //     setLoading(true);

    //     const params = new URLSearchParams({
    //       sex: sexFilter,
    //       age: ageFilter,
    //       year_interval: yearInterval,
    //     });

    //     fetch(`/api/your-endpoint?${params.toString()}`)
    //       .then((res) => {
    //         if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    //         return res.json();
    //       })
    //       .then((data) => {
    //         setRawData(data);
    //       })
    //       .catch((err) => {
    //         console.error("Failed to load data:", err);
    //       })
    //       .finally(() => {
    //         setLoading(false);
    //       });
    //   }, [sexFilter, ageFilter, yearInterval]);



    useEffect(() => {
        if (!isLoggedIn) return;
        if (!rawData.length || analysisType !== "Trend Analysis") return;

        setLoading(true);

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
    }, [rawData, sexFilter, ageFilter, yearInterval]);


    const [eapcMin, setEapcMin] = useState(-3);
    const [eapcMax, setEapcMax] = useState(3);


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
            // {
            //     type: "piecewise",
            //     pieces: [
            //         // { min: 0.5, color: "#d94e5d", label: "Increasing EAPC" },
            //         // { min: -0.5, max: 0.5, color: "#f5f5dc", label: "Neutral EAPC" },
            //         // { max: -0.5, color: "#4575b4", label: "Decreasing EAPC" },
            //         { value: "Stable", label: "Stable", color: "#cccccc" }

            //     ],
            //     orient: "vertical",
            //     left: "left",
            //     bottom: "50%",  // stack it above or below the main one
            //     textStyle: {
            //         color: "#000"
            //     }
            // }
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
    };
    const uniqueRiskFactors = Array.from(new Set(associationData.map((d) => d.Risk_Factor)));
    const filteredAssociationData = associationData.filter((d) =>
        selectedRiskFactors.includes(d.Risk_Factor) &&
        d.sex === sexFilter &&
        d.age === ageFilter
    );
    // … keep every thing else …
    useEffect(() => {
        if (!chartRef.current) return;

        // choose parameters based on the analysisType you already calculated
        const params =
            analysisType === "Trend Analysis"
                ? { type: "webp", quality: 0.7, pixelRatio: 0.8, backgroundColor: "#fff" }
                : { type: "webp", quality: 0.7, pixelRatio: 1, backgroundColor: "#fff" };

        // let the browser finish painting before grabbing the dataURL
        //   (small timeout avoids a rare race condition)
        setTimeout(() => {
            const url = chartRef.current!
                .getEchartsInstance()
                .getDataURL(params);

            setChartIframeUrl(url);   // ← state update triggers re‑render
        });
    }, [
        analysisType,
        sexFilter,
        ageFilter,
        yearInterval,
        chartData,                // after your data array changes
        filteredAssociationData
    ]);
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

    const accordionContent_dictLst =
        analysisType === "Trend Analysis"
            ? accordionContentTrend_dictLst
            : analysisType === "Association Analysis"
                ? accordionContentAssociation_dictLst
                : [];
    //    #5470c6

    if (!isLoggedIn) return <h2>Unauthorized</h2>;
    return (

        <div className="container-fluid mt-5">
            <div className="row">
                {/* Left Column */}
                <div className="col-2">
                    {/* Always-visible Analysis Type Dropdown */}
                    <div className="form-group mb-4">
                        <label htmlFor="analysis-type" style={{ fontWeight: "bold", margin: "0px 0px 5px 0px" }}>
                            Select Analysis Type:
                        </label>
                        <select
                            id="analysis-type"
                            className="form-control"
                            value={analysisType}
                            onChange={(e) => setAnalysisType(e.target.value)}
                        >
                            <option value="">-- Select --</option>
                            <option value="Trend Analysis">Trend Analysis</option>
                            <option value="Association Analysis">Association Analysis</option>
                        </select>
                    </div>
                    {analysisType === "Association Analysis" && (
                        <Form className="mb-3" style={{ maxWidth: "400px" }}>
                            <Form.Label style={{ fontWeight: "bold" }}>
                                Select Risk Factors (max 10):
                            </Form.Label>
                            <div className="form-control" style={{ maxHeight: "280px", overflowY: "auto", padding: "5px", textAlign: "left" }}>
                                {uniqueRiskFactors.map((factor, index) => {
                                    const isSelected = selectedRiskFactors.includes(factor);
                                    const disableCheckbox = selectedRiskFactors.length >= 10 && !isSelected;

                                    return (
                                        <Form.Check
                                            key={index}
                                            type="checkbox"
                                            label={factor}
                                            value={factor}
                                            checked={isSelected}
                                            onChange={() => toggleRiskFactor(factor)}
                                            disabled={disableCheckbox}
                                        />
                                    );
                                })}
                            </div>
                        </Form>

                    )}
                    {/* Show filters only for Trend Analysis */}
                    {(analysisType === "Trend Analysis" || analysisType === "Association Analysis") && (
                        <>
                            {/* Shared filters for both analysis types */}
                            <div className="form-group mb-3">
                                <label htmlFor="sex-select" style={{ fontWeight: "bold" }}>
                                    Select Sex:
                                </label>
                                <select
                                    className="form-control"
                                    id="sex-select"
                                    value={sexFilter}
                                    onChange={(e) => setSexFilter(e.target.value)}
                                >
                                    <option value="Both">Both</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>

                            <div className="form-group mb-3">
                                <label htmlFor="age-select" style={{ fontWeight: "bold" }}>
                                    Select Age:
                                </label>
                                <select
                                    className="form-control"
                                    id="age-select"
                                    value={ageFilter}
                                    onChange={(e) => setAgeFilter(e.target.value)}
                                >
                                    <option value="Age-standardized">Age-standardized</option>
                                    <option value="Under 25">Under 25</option>
                                    <option value="25 to 50">25 to 50</option>
                                    <option value="Above 50">Above 50</option>
                                </select>
                            </div>

                            {/* Show year interval only for Trend Analysis */}
                            {analysisType === "Trend Analysis" && (
                                <div className="form-group mb-3">
                                    <label htmlFor="year-select" style={{ fontWeight: "bold" }}>
                                        Select Year Interval:
                                    </label>
                                    <select
                                        className="form-control"
                                        id="year-select"
                                        value={yearInterval}
                                        onChange={(e) => setYearInterval(e.target.value)}
                                    >
                                        <option value="5 years (2016-2021)">5 years (2016-2021)</option>
                                        <option value="10 years (2011-2021)">10 years (2011-2021)</option>
                                        <option value="15 years (2006-2021)">15 years (2006-2021)</option>
                                        <option value="20 years (2001-2021)">20 years (2001-2021)</option>
                                        <option value="25 years (1996-2021)">25 years (1996-2021)</option>
                                        <option value="30 years (1991-2021)">30 years (1991-2021)</option>
                                    </select>
                                </div>
                            )}
                        </>
                    )}

                </div>

                {/* Center Column */}
                <div className="col-8">
                    {!analysisType && (
                        <div>
                            <p>In this page, you can explore insights through two types of analysis: <strong>Trend Analysis</strong> and <strong>Association Analysis</strong> on various age and sex groups.</p>

                            <p>Please select the desired type of analysis results from the <strong>drop-down menu on the left.</strong></p>

                            <p>In the menu on the<strong> right-hand side</strong>, you can find detailed information about the <strong>data sources</strong> and <strong>methodology</strong> of the analysis.</p>
                        </div>
                    )}
                    {analysisType === "Trend Analysis" && (
                        <>
                            <h5>
                                <strong>EAPC in European Countries</strong>
                            </h5>
                            {loading && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "100%",
                                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        zIndex: 10,
                                    }}
                                >
                                    <div
                                        className="spinner-border text-primary"
                                        role="status"
                                        style={{ width: "3rem", height: "3rem" }}
                                    ></div>
                                    <div
                                        style={{
                                            marginTop: "1rem",
                                            fontWeight: "bold",
                                            fontSize: "1rem",
                                            color: "#333",
                                        }}
                                    >
                                        Loading...
                                    </div>
                                </div>
                            )}
                            <ReactECharts ref={chartRef} key={JSON.stringify(chartData)} option={trendOption} style={{ height: "550px", width: "100%" }} />
                            <SaveGraphButton iframeUrl={getChartImageUrl(chartIframeUrl)} />
                        </>
                    )}

                    {analysisType === "Association Analysis" && (
                        <>
                            {/* <h5>
                                <strong>Association Analysis</strong>
                               
                            </h5> */}
                            <ReactECharts
                                ref={chartRef}
                                option={associationOption}
                                style={{ height: "600px", width: "100%" }}
                            />
                            <SaveGraphButton iframeUrl={getChartImageUrl(chartIframeUrl)} />
                        </>
                    )}
                </div>

                {/* Right Column (Optional) */}
                <div className="col-2">{/* Reserved for future content */}

                    <Accordion defaultActiveKey="-1">
                        {accordionContent_dictLst.map(({ title, content }, index) => (
                            <Accordion.Item eventKey={index.toString()} key={index}>
                                <Accordion.Header className="text-left">{title}</Accordion.Header>
                                <Accordion.Body className="text-start">{content}</Accordion.Body>
                            </Accordion.Item>
                        ))}
                    </Accordion>

                    <Comments /></div>
            </div>
        </div>

    );

};

export default EuropeMap;

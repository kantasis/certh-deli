import React, { useRef, useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import axios from "axios";
import * as AuthService from "../services/auth.service.tsx";
import { Form } from 'react-bootstrap';
import Comments from "./Comments.tsx";
import { Accordion } from 'react-bootstrap';
import SaveGraphButton from "./SaveGraphButton.tsx";
import { useLocation } from "react-router-dom";

const countries_strLst = [
    "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia",
    "Denmark", "Estonia", "Finland", "France", "Germany", "Greece",
    "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg",
    "Malta", "Netherlands", "Poland", "Portugal", "Romania", "Slovakia",
    "Slovenia", "Spain", "Sweden"
];



// const riskFactorsLst = [
//     { value: "alcohol_use", label: "Alcohol use" },
//     { value: "diet_high_in_sugar_sweetened_beverages", label: "Diet high in sugar sweetened beverages" },
//     { value: "diet_high_in_trans_fatty_acids", label: "Diet high in trans fatty acids" },
//     { value: "diet_low_in_fiber", label: "Diet low in fiber" },
//     { value: "diet_low_in_seafood_omega_3_fatty_acids", label: "Diet low in seafood omega-3 fatty acids" },
//     { value: "high_BMI", label: "High body-mass index" },
//     { value: "low_physical_activity", label: "Low physical activity" },
// ];

const typeOptions = [
    { value: "exposure_weighted", label: "Overview: Exposure Weighted" },
    { value: "quick_wins", label: "Quick Wins" },
    { value: "effect_sev_unit", label: "Overview: Effect per SEV Unit" },
    { value: "sf_intervention", label: "Single-Factor Intervention" },
    // { value: "sf_target", label: "Single-Factor Target" },
];

const DeliPredictions = () => {

    const [country, setCountry] = useState("Austria");
    const [horizon, setHorizon] = useState("5");
    const [type, setType] = useState("");
    const [riskFactor, setRiskFactor] = useState("");
    const [chartOptions, setChartOptions] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [cleanToken, setToken] = useState(null);
    const [riskFactorsLst, setRiskFactorsLst] = useState([]);
    const [isRestoring, setIsRestoring] = useState(false);
    const chartRef = useRef<ReactECharts>(null);

    const [chartImageUrl, setChartImageUrl] = useState<string>("");

    useEffect(() => {
        setIsLoggedIn(AuthService.isLoggedIn());
    }, []);

    useEffect(() => {
        setRiskFactor(""); // reset risk factor when horizon changes
    }, [horizon, type]);

    useEffect(() => {
        const controller = new AbortController();

        fetch("http://oncodir.catalink.eu:7565/v1/services/login/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                service_name: import.meta.env.VITE_SERVICE_NAME,
                password: import.meta.env.VITE_SERVICE_PASSWORD
            }),
            signal: controller.signal
        })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
                return res.text();
            })
            .then(token => {
                const cleanToken = token.replace(/^"|"$/g, ""); // remove quotes
                setToken(cleanToken);
                // console.log("Token:", cleanToken);
            })
            .catch(err => {
                if (err.name !== "AbortError") {
                    console.error("Failed to fetch token:", err);
                }
            });

        return () => controller.abort();
    }, []);




    useEffect(() => {
        if (!chartRef.current) return;

        // Delay to allow the chart to fully render
        const timeout = setTimeout(() => {
            const echartsInstance = chartRef.current?.getEchartsInstance();
            if (!echartsInstance) return;

            const params = {
                type: "webp",
                quality: 0.7,
                pixelRatio: 1,
                backgroundColor: "#fff",
            };

            const url = echartsInstance.getDataURL(params);
            setChartImageUrl(url);  // Save the chart image
        }, 1500);

        return () => clearTimeout(timeout);  // cleanup if chart updates before timeout
    }, [chartOptions]); // re-run whenever the chart options change



    useEffect(() => {



        if (!type || !horizon || !cleanToken) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                let url = `http://oncodir.catalink.eu:7565/v1/deli/predictions?type=${type}&prediction_horizon=${horizon}`;

                if (["sf_intervention", "sf_target", "exposure_weighted"].includes(type) && country) {
                    url += `&country=${encodeURIComponent(country)}`;
                }

                if (riskFactor && ["sf_intervention", "sf_target", "effect_sev_unit"].includes(type)) {
                    url += `&risk_factor=${riskFactor}`;
                }

                const res = await axios.get(url, {
                    headers: {
                        "Authorization": `Bearer ${cleanToken}`,
                        "Content-Type": "application/json",
                    }
                });


                const formatRiskFactorLabel = (raw: string) => {
                    if (!raw) return "";
                    // replace underscores with spaces, capitalize each word
                    return raw
                        .split("_")
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ");
                };

                const apiData = res.data.data;

                // 🔹 Build dynamic risk factors list
                if (type === "sf_intervention" || type === "sf_target") {
                    const rfList = Object.keys(apiData || {}).map(key => ({
                        value: key,
                        label: apiData[key]?.factor_label || formatRiskFactorLabel(key)
                    }));
                    setRiskFactorsLst(rfList);
                }

                const options = buildChartOptions(res.data);
                setChartOptions(options);

            } catch (err) {
                setError(err.message || "Error fetching data");
            } finally {
                setLoading(false);
            }
        };


        fetchData();
    }, [type, horizon, country, riskFactor, cleanToken]);



    const buildChartOptions = (apiResponse) => {
        const { type, data } = apiResponse;
        if (!data) return {};

        // 1. Line chart for sf_intervention / sf_target
        if (["sf_intervention", "sf_target"].includes(type)) {
            if (!riskFactor) {
                return {
                    title: { text: '', left: 'center' },
                    series: [],
                    skipMessage: 'Please select a risk factor'
                };
            }

            const rfData = data[riskFactor]; // exact match
            const rfLabel = riskFactorsLst.find(rf => rf.value === riskFactor)?.label || riskFactor;

            if (!rfData) {
                return {
                    title: { text: '', left: 'center' },
                    series: [],
                    skipMessage: `No data available for risk factor: ${rfLabel}`
                };
            }

            // Case 1: skip_reason
            if (rfData.skip_reason) {
                return {
                    title: { text: `${rfData.factor_label || ''} — ${rfData.title || ''}`, left: 'center' },
                    series: [],
                    skipMessage: rfData.skip_reason
                };
            }

            // Case 2: no results
            if (!rfData.results || !rfData.results.length) {
                return {
                    title: { text: `${rfData.factor_label || ''} — ${rfData.title || ''}`, left: 'center' },
                    series: [],
                    skipMessage: 'No results available for this risk factor'
                };
            }

            // Case 3: normal chart
            const dataset = rfData.results.map(d => ({
                x: d.percent_reduction,
                ciLow: d.ci_lower,
                ciDiff: d.ci_upper - d.ci_lower,
                predicted: d.predicted_crc_incidence
            }));

            const baselineDataset = [dataset[0]];

            return {
                title: { text: `${rfData.factor_label || ''} — ${rfData.title || ''}`, left: 'center' },
                dataset: [
                    { source: dataset },
                    { source: baselineDataset }
                ],
                xAxis: {
                    type: 'category',
                    name: 'SEV Reduction (%)',
                    nameLocation: 'center',
                    nameGap: 30
                },
                yAxis: {
                    name: rfData.y_axis_label || '',
                    nameRotate: 90,
                    nameLocation: 'center',
                    nameGap: 55
                },
                series: [
                    { name: 'CI Lower', type: 'line', encode: { y: 'ciLow' }, stack: 'ci', symbol: 'none', lineStyle: { opacity: 0 } },
                    { name: 'CI Upper', type: 'line', encode: { y: 'ciDiff' }, stack: 'ci', symbol: 'none', areaStyle: { color: 'rgba(128,200,128,0.3)' }, lineStyle: { opacity: 0 } },
                    { name: 'Predicted CRC', type: 'line', encode: { y: 'predicted' }, smooth: true, lineStyle: { color: 'green', width: 2 }, symbol: 'circle', symbolSize: 6 },
                    { name: 'Baseline', type: 'scatter', datasetIndex: 1, encode: { x: 'x', y: 'predicted' }, itemStyle: { color: 'red' }, symbolSize: 10 }
                ],
                tooltip: {
                    trigger: 'axis',
                    formatter: (params) => {
                        const pred = params.find(p => p.seriesName === 'Predicted CRC');
                        if (!pred) return '';

                        const ciLow = pred?.data?.ciLow;
                        const ciDiff = pred?.data?.ciDiff;
                        const ciHigh = ciLow !== undefined && ciDiff !== undefined ? ciLow + ciDiff : null;

                        let tooltip = `
                        <strong>SEV Reduction:</strong> ${pred?.data?.x}%<br/>
                        <strong>Predicted CRC:</strong> ${pred?.data?.predicted.toFixed(2)}
                    `;

                        if (ciLow !== undefined && ciHigh !== null) {
                            tooltip += `<br/><strong>CI:</strong> [${ciLow.toFixed(2)}, ${ciHigh.toFixed(2)}]`;
                        }

                        return tooltip;
                    }
                }
            };
        }

        // 2. Quick Wins bar chart
        if (type === "quick_wins") {
            const barsData = data || [];
            const dataset = barsData.map(d => ({
                x: d.label,
                value: d.effect_estimate,
                ciLow: d.ci_lower,
                ciHigh: d.ci_upper
            }));

            return {
                title: { text: apiResponse.title || '', left: 'center' },
                dataset: [{ source: dataset }],
                xAxis: { type: 'category', encode: { x: 'x' }, axisLabel: { rotate: 30, fontSize: 12 }, nameLocation: 'center', nameGap: 55 },
                yAxis: { name: apiResponse.y_axis_label || '', nameRotate: 90, nameLocation: 'center', nameGap: 55 },
                series: [
                    { type: 'bar', encode: { y: 'value' }, itemStyle: { color: 'orange' } },
                    {
                        type: 'custom',
                        name: 'Confidence Intervals (95%)',
                        renderItem: (params, api) => {
                            const xValue = api.value(0);
                            const high = api.coord([xValue, api.value(2)]);
                            const low = api.coord([xValue, api.value(1)]);
                            const halfWidth = api.size([1, 0])[0] * 0.2;
                            const style = api.style({ stroke: 'black', lineWidth: 1.5 });

                            return {
                                type: 'group',
                                children: [
                                    { type: 'line', shape: { x1: high[0] - halfWidth, y1: high[1], x2: high[0] + halfWidth, y2: high[1] }, style },
                                    { type: 'line', shape: { x1: high[0], y1: high[1], x2: low[0], y2: low[1] }, style },
                                    { type: 'line', shape: { x1: low[0] - halfWidth, y1: low[1], x2: low[0] + halfWidth, y2: low[1] }, style }
                                ]
                            };
                        },
                        encode: { x: 0, y: [1, 2] },
                        data: dataset.map(d => [d.x, d.ciLow, d.ciHigh]),
                        z: 100
                    }
                ],
                tooltip: {
                    formatter: (param) => {
                        const d = param.data;
                        return `<strong>${d.x}</strong><br/>
                        <strong>Value:</strong> ${d.value.toFixed(2)}<br/>
                        <strong>CI:</strong> [${d.ciLow.toFixed(2)}, ${d.ciHigh.toFixed(2)}]`;
                    }
                }
            };
        }

        // 3. Exposure-weighted / effect_sev_unit bars
        const barsData = data.exclude_negative && data.exclude_negative.length > 0
            ? data.exclude_negative
            : data.include_negative || [];

        const dataset = barsData.map(d => ({
            x: d.label,
            value: d.value,
            ciLow: d.ci_lower,
            ciHigh: d.ci_upper
        }));

        return {
            title: { text: apiResponse.title || '', left: 'center' },
            dataset: [{ source: dataset }],
            xAxis: { type: 'category', encode: { x: 'x' }, axisLabel: { rotate: 30, fontSize: 12 }, nameLocation: 'center', nameGap: 55 },
            yAxis: { name: apiResponse.y_label || '', nameRotate: 90, nameLocation: 'center', nameGap: 55 },
            series: [
                { type: 'bar', encode: { y: 'value' }, itemStyle: { color: 'steelblue' } },
                {
                    type: 'custom',
                    name: 'Confidence Intervals (95%)',
                    renderItem: (params, api) => {
                        const xValue = api.value(0);
                        const high = api.coord([xValue, api.value(2)]);
                        const low = api.coord([xValue, api.value(1)]);
                        const halfWidth = api.size([1, 0])[0] * 0.2;
                        const style = api.style({ stroke: 'black', lineWidth: 1.5 });

                        return {
                            type: 'group',
                            children: [
                                { type: 'line', shape: { x1: high[0] - halfWidth, y1: high[1], x2: high[0] + halfWidth, y2: high[1] }, style },
                                { type: 'line', shape: { x1: high[0], y1: high[1], x2: low[0], y2: low[1] }, style },
                                { type: 'line', shape: { x1: low[0] - halfWidth, y1: low[1], x2: low[0] + halfWidth, y2: low[1] }, style }
                            ]
                        };
                    },
                    encode: { x: 0, y: [1, 2] },
                    data: dataset.map(d => [d.x, d.ciLow, d.ciHigh]),
                    z: 100
                }
            ],
            tooltip: {
                trigger: 'axis',
                formatter: (params) => {
                    const barData = params.find(p => p.seriesType === 'bar').data;
                    const ci = dataset.find(d => d.x === barData.x);
                    return `<strong>${ci.x}</strong><br/>
                        <strong>Value:</strong> ${ci.value.toFixed(2)}<br/>
                        <strong>CI:</strong> [${ci.ciLow.toFixed(2)}, ${ci.ciHigh.toFixed(2)}]`;
                }
            }
        };
    };

    const getUriParams = () => {
        const params: Record<string, string> = {};

        if (type) params.analysis = type;
        if (horizon) params.horizon = horizon;
        if (country) params.country = country;
        if (riskFactor) {
            const rfLabel = riskFactorsLst.find(rf => rf.value === riskFactor)?.label || riskFactor;
            params.riskFactor = rfLabel; // store friendly label
        }


        return params;
    };

    const getChartImageUrl = () => {
        if (!chartRef.current) return "";

        const ec = chartRef.current.getEchartsInstance();


        return ec.getDataURL({
            type: "webp",
            quality: 0.7,
            pixelRatio: 1,
            backgroundColor: "#fff",
        });
    };


    const iframeUrl = {
        url: window.location.pathname,  // page route (for restore)
        params: getUriParams(),         // filters (for restore)
        preview: getChartImageUrl(),    // snapshot (for preview in SavedDashboards)
    };

    console.log(getChartImageUrl());
    const location = useLocation();
    const savedIframeUrl = location.state?.iframeUrl;

    const [pendingRiskFactor, setPendingRiskFactor] = useState<string | null>(null);

    useEffect(() => {
        if (!savedIframeUrl) return;

        try {
            const parsed = typeof savedIframeUrl === "string" ? JSON.parse(savedIframeUrl) : savedIframeUrl;
            const params = parsed.params;
            if (!params) return;

            if (params.analysis) setType(params.analysis);
            if (params.horizon) setHorizon(params.horizon);
            if (params.country) setCountry(params.country);

            if (params.riskFactor) {
                setPendingRiskFactor(params.riskFactor); // store label temporarily
            }

        } catch (error) {
            console.error("Invalid savedIframeUrl format", error);
        }
    }, [savedIframeUrl]);

    // When riskFactorsLst is ready, apply once
    useEffect(() => {
        if (pendingRiskFactor && riskFactorsLst.length > 0) {
            const rf = riskFactorsLst.find(
                (rf) => rf.label === pendingRiskFactor || rf.value === pendingRiskFactor
            );
            if (rf) {
                setRiskFactor(rf.value);
            }
            setPendingRiskFactor(null); // ✅ clear so it won’t override user changes later
        }
    }, [pendingRiskFactor, riskFactorsLst]);





    if (!isLoggedIn) return <h2>Unauthorized</h2>;
    return (
        <div className="container-fluid mt-5">
            <div className="row">
                {/* Left Column */}
                <div className="col-2">
                    <div className="form-group mb-4">
                        <div>
                            {/* Type */}
                            <div>
                                <label style={{ fontWeight: "bold", margin: "0px 0px 5px 0px" }}>Type: </label>

                                <select className="form-control" value={type} onChange={(e) => setType(e.target.value)}>
                                    <option value="">Select type</option>
                                    {typeOptions.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>

                            </div>
                        </div>
                    </div>
                    {/* Horizon */}
                    {["sf_intervention", "sf_target", "exposure_weighted", "quick_wins", "effect_sev_unit"].includes(type) && (
                        <div className="form-group mb-4">
                            <label style={{ fontWeight: "bold", margin: "0px 0px 5px 0px" }}>Horizon: </label>
                            <select className="form-control" value={horizon} onChange={(e) => setHorizon(e.target.value)}>
                                <option value="">Select horizon</option>
                                <option value="1">1 Year</option>
                                <option value="3">3 Years</option>
                                <option value="5">5 Years</option>
                                <option value="10">10 Years</option>
                            </select>
                        </div>
                    )}

                    {/* Country */}
                    {["sf_intervention", "sf_target", "exposure_weighted"].includes(type) && (
                        <div className="form-group mb-4">
                            <label style={{ fontWeight: "bold", margin: "0px 0px 5px 0px" }}>Country: </label>
                            <select className="form-control" value={country} onChange={(e) => setCountry(e.target.value)}>
                                <option value="">Select country</option>
                                {countries_strLst.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    )}

                    {/* Risk Factor */}
                    {["sf_intervention"].includes(type) && (
                        <div className="form-group mb-4">
                            <label style={{ fontWeight: "bold", margin: "0px 0px 5px 0px" }}>Risk Factor: </label>
                            <select className="form-control" value={riskFactor} onChange={(e) => setRiskFactor(e.target.value)}>
                                <option value="">Select risk factor</option>
                                {riskFactorsLst.map((rf) => (
                                    <option key={rf.value} value={rf.value}>{rf.label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                </div>

                <div className="col-8">
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
                    {error && <p style={{ color: "red" }}>Error: {error}</p>}
                    {!loading && !error && !chartOptions.skipMessage && chartOptions.series && type !== "" && (
                        <ReactECharts ref={chartRef} option={chartOptions} style={{ height: "570px", width: "100%" }} />


                    )}
                    {chartOptions.skipMessage && (
                        <p style={{ color: 'red', fontWeight: 'bold' }}>{chartOptions.skipMessage}</p>

                    )}
                    {!chartOptions.skipMessage && type && (!["sf_intervention"].includes(type) || (type === "sf_intervention" && riskFactor)) && (
                        <SaveGraphButton
                            iframeUrl={{
                                url: getChartImageUrl(),   // page route for restoration
                                params: getUriParams(),    // current filters
                                preview: chartImageUrl     // snapshot of the chart
                            }}
                        />
                    )}


                </div >
                {/* //url: getChartImageUrl(chartIframeUrl), */}

                <div className="col-2"> <Comments /></div>
            </div>




        </div>



    );

};

export default DeliPredictions;

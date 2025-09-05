import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import axios from "axios";

const countries_strLst = [
    "Greece", "Romania", "Lithuania", "Belgium", "Italy", "Spain", "Andorra",
    "Cyprus", "Turkey", "Switzerland", "Hungary", "Luxembourg", "Sweden", "Norway",
    "Belarus", "United Kingdom", "Russian Federation", "Netherlands", "Montenegro",
    "Austria", "Ireland", "Germany", "Serbia", "Portugal", "Finland", "Malta",
    "Albania", "Ukraine", "Bulgaria", "Croatia", "Latvia", "England", "Slovenia",
    "North Macedonia", "France", "Estonia", "Slovakia", "Monaco", "Israel",
    "Poland", "Iceland", "Republic of Moldova", "Denmark",
    "Bosnia and Herzegovina", "Czechia"
];

const riskFactorsLst = [
    { value: "alcohol_use", label: "Alcohol use" },
    { value: "diet_high_in_red_meat", label: "Diet high in red meat" },
    { value: "diet_high_in_trans_fatty_acids", label: "Diet high in trans fatty acids" },
    { value: "diet_low_in_polyunsaturated_fatty_acids", label: "Diet low in polyunsaturated fatty acids" },
    { value: "diet_low_in_seafood_omega_3_fatty_acids", label: "Diet low in seafood omega-3 fatty acids" },
    { value: "diet_low_in_vegetables", label: "Diet low in vegetables" },
    { value: "diet_low_in_whole_grains", label: "Diet low in whole grains" },
    { value: "high_BMI", label: "High body-mass index" },
    { value: "low_physical_activity", label: "Low physical activity" },
];

const typeOptions = [
    { value: "exposure_weighted", label: "Exposure Weighted" },
    { value: "quick_wins", label: "Quick Wins" },
    { value: "effect_sev_unit", label: "Effect per SEV Unit" },
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

    useEffect(() => {
        if (!type || !horizon) return;

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

                const res = await axios.get(url);
                const options = buildChartOptions(res.data);
                setChartOptions(options);
            } catch (err) {
                setError(err.message || "Error fetching data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [type, horizon, country, riskFactor]);

    const buildChartOptions = (apiResponse) => {
        const { type, data } = apiResponse;
        if (!data) return {};

        // 1. Line chart for sf_intervention / sf_target
        if (["sf_intervention", "sf_target"].includes(type)) {
            const rfData = riskFactor ? data[riskFactor] : Object.values(data)[0];
            if (!rfData || !rfData.results) return {};

            const dataset = rfData.results.map(d => ({
                x: d.percent_reduction,
                ciLow: d.ci_lower,
                ciDiff: d.ci_upper - d.ci_lower,
                predicted: d.predicted_crc_incidence
            }));
            const baselineDataset = [dataset[0]];

            return {
                title: { text: rfData.title, left: "center" },
                dataset: [
                    { source: dataset },
                    { source: baselineDataset }
                ],
                xAxis: { type: 'category', encode: { x: 'x' }, name: 'SEV Reduction (%)' },
                yAxis: { type: 'value', name: 'Predicted CRC per 100,000' },
                series: [
                    { name: 'CI Lower', type: 'line', encode: { y: 'ciLow' }, stack: 'ci', symbol: 'none', lineStyle: { opacity: 0 } },
                    { name: 'CI Upper', type: 'line', encode: { y: 'ciDiff' }, stack: 'ci', symbol: 'none', areaStyle: { color: 'rgba(128,200,128,0.3)' }, lineStyle: { opacity: 0 } },
                    { name: 'Predicted CRC', type: 'line', encode: { y: 'predicted' }, smooth: true, lineStyle: { color: 'green', width: 2 }, symbol: 'circle', symbolSize: 6 },
                    { name: 'Baseline', type: 'scatter', datasetIndex: 1, encode: { x: 'x', y: 'predicted' }, itemStyle: { color: 'red' }, symbolSize: 10 }
                ],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' },
                    formatter: (params) => {
                        const predictedSeries = params.find(p => p.seriesName === 'Predicted CRC');
                        if (!predictedSeries) return '';
                        const predicted = predictedSeries.data.predicted;
                        const ciLow = predictedSeries.data.ciLow;
                        const ciHigh = ciLow + predictedSeries.data.ciDiff;
                        const x = predictedSeries.data.x;
                        return `${x}<br/>
                        CI Lower: ${ciLow.toFixed(2)}<br/>
                        CI Upper: ${ciHigh.toFixed(2)}<br/>
                        Predicted: ${predicted.toFixed(2)}`;
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
                title: { text: barsData.length ? barsData[0].title : "Quick Wins", left: "center" },
                dataset: [{ source: dataset }],
                xAxis: { type: 'category', encode: { x: 'x' }, name: 'Risk Factor' },
                yAxis: { type: 'value', name: 'New CRC Cases per 100,000' },
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
                    trigger: 'axis',
                    formatter: (params) => {
                        const p = params.find(p => p.seriesType === 'bar').data;
                        return `${p[0]}<br/>Value: ${p[1].toFixed(2)}<br/>CI: [${p[2].toFixed(2)}, ${p[3].toFixed(2)}]`;
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
            title: { text: typeOptions.find(t => t.value === type)?.label || '', left: "center" },
            dataset: [{ source: dataset }],
            xAxis: { type: 'category', encode: { x: 'x' }, name: 'Risk Factor' },
            yAxis: { type: 'value', name: 'Risk Factor–Associated CRC Burden (per 100,000)' },
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
                    return `${ci.x}<br/>Value: ${ci.value.toFixed(2)}<br/>CI: [${ci.ciLow.toFixed(2)}, ${ci.ciHigh.toFixed(2)}]`;
                }
            }
        };
    };




    return (
        <div>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                {/* Type */}
                <div>
                    <label>Type: </label>
                    <select value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="">Select type</option>
                        {typeOptions.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                </div>

                {/* Horizon */}
                <div>
                    <label>Horizon: </label>
                    <select value={horizon} onChange={(e) => setHorizon(e.target.value)}>
                        <option value="">Select horizon</option>
                        <option value={1}>1 Year</option>
                        <option value={3}>3 Years</option>
                        <option value={5}>5 Years</option>
                        <option value={10}>10 Years</option>
                    </select>
                </div>

                {/* Country */}
                {["sf_intervention", "sf_target", "exposure_weighted"].includes(type) && (
                    <div>
                        <label>Country: </label>
                        <select value={country} onChange={(e) => setCountry(e.target.value)}>
                            <option value="">Select country</option>
                            {countries_strLst.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                )}

                {/* Risk Factor */}
                {["sf_target", "effect_sev_unit"].includes(type) && (
                    <div>
                        <label>Risk Factor: </label>
                        <select value={riskFactor} onChange={(e) => setRiskFactor(e.target.value)}>
                            <option value="">Select risk factor</option>
                            {riskFactorsLst.map((rf) => <option key={rf.value} value={rf.value}>{rf.label}</option>)}
                        </select>
                    </div>
                )}
            </div>

            {loading && <p>Loading predictions...</p>}
            {error && <p style={{ color: "red" }}>Error: {error}</p>}
            {!loading && !error && chartOptions.series && (
                <ReactECharts option={chartOptions} style={{ height: "500px", width: "100%" }} />
            )}
        </div>
    );
};

export default DeliPredictions;

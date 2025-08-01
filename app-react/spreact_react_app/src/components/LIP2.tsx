import React, { useState, useMemo, useEffect } from "react";
import data from "../assets/aggregation_final_greece.json";
import ReactECharts from "echarts-for-react";
import Comments from "./Comments.tsx";
import { Accordion } from 'react-bootstrap';

const AggregationAnalysis = () => {
    const [selectedVariable, setSelectedVariable] = useState("");
    const [selectedPeriodType, setSelectedPeriodType] = useState("");
    const [selectedTimePeriod, setSelectedTimePeriod] = useState("");

    const variables = [...new Set(data.map((d) => d.Variable))];
    const periodTypes = ["Week", "Month"];

    const timePeriods = useMemo(() => {
        return data
            .filter((d) =>
                selectedPeriodType === "Week"
                    ? d["Time-Period"]?.includes("/")
                    : !d["Time-Period"]?.includes("/")
            )
            .map((d) => d["Time-Period"])
            .filter((v, i, a) => a.indexOf(v) === i);
    }, [selectedPeriodType]);

    const pieChartVarsDetailed = ["Age", "BMI"];
    const pieChartVarsSimple = [
        "Biological Sex",
        "Smoking status",
        "Activity level",
        "CRC Family history",
        "Diabetes",
        "Education",
        "Employment",
        "Ethnicity",
        "Housing",
        "IBD",
        "Metabolic syndrome",
        "Occupation",
        "Region",
        "Relationship status",
    ];
    const barChartVarsTime = [
        "Alcohol grams/day",
        "Cheese grams/day",
        "Cooked vegetables grams/day",
        "Diary-plant based products mL/day",
        "Fruits grams/day",
        "Large fatty fish grams/day",
        "Legumes grams/day",
        "Nuts seeds grams/day",
        "Processed meat grams/day",
        "Raw vegetables grams/day",
        "Red meat grams/day",
        "Small fatty fish grams/day",
        "Wholegrains grams/day",
        "CRC Risk Assessment Score (PYRAMID)",
    ];

    const chartType = useMemo(() => {
        if (pieChartVarsDetailed.includes(selectedVariable)) return "pie-detailed";
        if (pieChartVarsSimple.includes(selectedVariable)) return "pie-simple";
        if (barChartVarsTime.includes(selectedVariable)) return "bar";
        return null;
    }, [selectedVariable]);

    useEffect(() => {
        setSelectedPeriodType("");
        setSelectedTimePeriod("");
    }, [chartType]);

    const filteredData = useMemo(() => {
        return data.filter((d) => {
            const matchesVariable = selectedVariable ? d.Variable === selectedVariable : false;

            const matchesPeriodType =
                !selectedPeriodType ||
                (selectedPeriodType === "Week"
                    ? d["Time-Period"]?.includes("/")
                    : d["Time-Period"] && !d["Time-Period"].includes("/"));

            const matchesTimePeriod =
                !selectedTimePeriod || d["Time-Period"] === selectedTimePeriod;

            return matchesVariable && matchesPeriodType && matchesTimePeriod;
        });
    }, [selectedVariable, selectedPeriodType, selectedTimePeriod]);


    const getPieOptions = (detailed = false) => {
        return {
            tooltip: {
                trigger: "item",
                formatter: (params) => {
                    const row = filteredData.find((r) => r.Category === params.name);
                    return `
            <strong>${params.name}</strong><br/>
            Percentage of Total: ${params.value.toFixed(2)}%<br/>
            Frequency: ${row.Frequency ?? "-"}<br/>
            ${detailed
                            ? `Mean: ${row.Mean ?? "-"}<br/>
                   Median: ${row.Median ?? "-"}<br/>
                   Std. Dev.: ${row["Std. Dev."] ?? "-"}<br/>
                   Min: ${row.Min ?? "-"}<br/>
                   Max: ${row.Max ?? "-"}`
                            : ""
                        }
          `;
                },
            },
            series: [
                {
                    type: "pie",
                    radius: "60%",
                    data: filteredData.map((d) => ({
                        name: d.Category,
                        value: d["Percentage of Total"] ?? 0,
                    })),
                },
            ],
        };
    };

    const getBarOptions = () => {
        const categories = [...new Set(filteredData.map((d) => d.Category))];
        const timePeriods = [...new Set(filteredData.map((d) => d["Time-Period"]))];

        const isPyramid = selectedVariable === "CRC Risk Assessment Score (PYRAMID)";
        const isDetailedNutrition = !isPyramid;

        const series = categories.map((cat) => {
            return {
                name: cat,
                type: "bar",
                stack: "total",
                emphasis: { focus: "series" },
                data: timePeriods.map((tp) => {
                    const entry = filteredData.find(
                        (d) => d.Category === cat && d["Time-Period"] === tp
                    );
                    return entry?.Frequency ?? 0;
                }),
            };
        });

        return {
            tooltip: {
                trigger: "item",
                formatter: (params) => {
                    const row = filteredData.find(
                        (d) =>
                            d.Category === params.seriesName &&
                            d["Time-Period"] === params.name
                    );
                    if (!row) return "";

                    let content = `<strong>${params.seriesName}</strong><br/>`;
                    content += `Time Period: ${params.name}<br/>`;
                    content += `Frequency: ${row.Frequency ?? "-"}<br/>`;
                    content += `Percentage of Total: ${row["Percentage of Total"]?.toFixed(2) ?? "-"}%`;

                    if (!["CRC Risk Assessment Score (PYRAMID)"].includes(selectedVariable)) {
                        content += `
        <br/>Mean: ${row.Mean ?? "-"}
        <br/>Median: ${row.Median ?? "-"}
        <br/>Std. Dev.: ${row["Std. Dev."] ?? "-"}
        <br/>Min: ${row.Min ?? "-"}
        <br/>Max: ${row.Max ?? "-"}`;
                    }

                    return content;
                },
            },

            legend: { top: 20 },
            xAxis: { type: "category", data: timePeriods },
            yAxis: { type: "value" },
            series,
        };
    };


    return (
        <div>
            <h3>Aggregation Analysis</h3>

            <div className="container-fluid mt-5">
                <div className="row">
                    {/* Left Column */}
                    <div className="col-2">
                        {/* Always-visible Analysis Type Dropdown */}
                        <div className="form-group mb-4">
                            <label htmlFor="analysis-type" style={{ fontWeight: "bold", margin: "0px 0px 5px 0px" }}>
                                Select Variable</label>
                            <select
                                className="form-control"
                                value={selectedVariable}
                                onChange={(e) => setSelectedVariable(e.target.value)}
                            >
                                <option value="">-- Select Variable --</option>
                                {variables.map((v, i) => (
                                    <option key={i} value={v}>
                                        {v}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Period Type filter only shown for barChartVarsTime */}
                        {barChartVarsTime.includes(selectedVariable) && (
                            <div className="form-group">
                                <label>Period Type</label>
                                <select
                                    className="form-control"
                                    value={selectedPeriodType}
                                    onChange={(e) => setSelectedPeriodType(e.target.value)}
                                >
                                    <option value="">-- Select Period Type --</option>
                                    {periodTypes.map((pt, i) => (
                                        <option key={i} value={pt}>
                                            {pt}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {selectedPeriodType && (
                            <div className="form-group">
                                <label>Time Period</label>
                                <select
                                    className="form-control"
                                    value={selectedTimePeriod}
                                    onChange={(e) => setSelectedTimePeriod(e.target.value)}
                                >
                                    <option value="">-- Select Time Period --</option>
                                    {timePeriods.map((tp, i) => (
                                        <option key={i} value={tp}>
                                            {tp}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                    {/* Render Table and Charts only if variable is selected */}
                    <div className="col-8">
                        {selectedVariable && filteredData.length > 0 && (
                            <>
                                {chartType === "pie-detailed" && (
                                    <ReactECharts option={getPieOptions(true)} style={{ height: 400 }} />
                                )}
                                {chartType === "pie-simple" && (
                                    <ReactECharts option={getPieOptions(false)} style={{ height: 400 }} />
                                )}
                                {chartType === "bar" && (
                                    <ReactECharts option={getBarOptions()} style={{ height: 400 }} />
                                )}
                                <table className="table table-bordered table-striped mt-3">
                                    <thead>
                                        <tr>
                                            <th>Variable</th>
                                            <th>Category</th>
                                            <th>Frequency</th>
                                            <th>% of Total</th>
                                            <th>Mean</th>
                                            <th>Median</th>
                                            <th>Std. Dev.</th>
                                            <th>Min</th>
                                            <th>Max</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.map((row, idx) => (
                                            <tr key={idx}>
                                                <td>{row.Variable}</td>
                                                <td>{row.Category}</td>
                                                <td>{row.Frequency ?? "-"}</td>
                                                <td>{row["Percentage of Total"]?.toFixed(2)}</td>
                                                <td>{row.Mean?.toFixed(2) ?? "-"}</td>
                                                <td>{row.Median ?? "-"}</td>
                                                <td>{row["Std. Dev."]?.toFixed(2) ?? "-"}</td>
                                                <td>{row.Min ?? "-"}</td>
                                                <td>{row.Max ?? "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>


                            </>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AggregationAnalysis;

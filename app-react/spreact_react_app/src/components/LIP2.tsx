import React, { useState, useMemo, useEffect } from "react";
import data from "../assets/aggregation_final_greece.json";
import ReactECharts from "echarts-for-react";
import { Modal, Button } from "react-bootstrap";
import Comments from "./Comments.tsx";

const AggregationAnalysis = () => {
    const [selectedVariable, setSelectedVariable] = useState("");
    const [selectedPeriodType, setSelectedPeriodType] = useState("");
    const [selectedTimePeriod, setSelectedTimePeriod] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const rowsPerPage = 10;

    const variables = [...new Set(data.map((d) => d.Variable))];
    const periodTypes = ["Week", "Month"];



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


    // Time periods, only relevant for bar variables
    const timePeriods = useMemo(() => {
        if (!barChartVarsTime.includes(selectedVariable)) return [];
        const periods = data
            .filter((d) => d.Variable === selectedVariable)
            .filter((d) =>
                selectedPeriodType === "Week"
                    ? d["Time-Period"]?.includes("/")
                    : selectedPeriodType === "Month"
                        ? d["Time-Period"] && !d["Time-Period"].includes("/")
                        : true
            )
            .map((d) => d["Time-Period"])
            .filter((v, i, a) => v != null && a.indexOf(v) === i);

        return periods.sort((a, b) => a.toString().localeCompare(b.toString()));
    }, [selectedVariable, selectedPeriodType, data]);

    // Ensure selectedTimePeriod is valid
    useEffect(() => {
        if (barChartVarsTime.includes(selectedVariable)) {
            // ✅ Only reset if it's not one of Week, Month, or "" (All)
            if (
                selectedPeriodType !== "" &&
                !periodTypes.includes(selectedPeriodType)
            ) {
                setSelectedPeriodType("");
            }

            // reset time period if invalid
            if (selectedTimePeriod && !timePeriods.includes(selectedTimePeriod)) {
                setSelectedTimePeriod("");
            }
        } else {
            setSelectedPeriodType("");
            setSelectedTimePeriod("");
        }
    }, [selectedVariable, timePeriods, selectedPeriodType, selectedTimePeriod]);





    const chartType = useMemo(() => {
        if (pieChartVarsDetailed.includes(selectedVariable)) return "pie-detailed";
        if (pieChartVarsSimple.includes(selectedVariable)) return "pie-simple";
        if (barChartVarsTime.includes(selectedVariable)) return "bar";
        return null;
    }, [selectedVariable]);

    useEffect(() => {
        if (selectedTimePeriod === undefined && timePeriods.length > 0) {
            setSelectedTimePeriod("");
        }
    }, [timePeriods]);

    useEffect(() => {
        setSelectedTimePeriod("");
    }, [selectedPeriodType]);

    // Reset or set defaults when selectedVariable changes
    useEffect(() => {
        if (barChartVarsTime.includes(selectedVariable)) {
            // ✅ only set default if user hasn’t chosen anything
            if (selectedPeriodType === undefined) {
                setSelectedPeriodType(""); // default to All
            }

            // reset time period if invalid
            if (selectedTimePeriod && !timePeriods.includes(selectedTimePeriod)) {
                setSelectedTimePeriod("");
            }
        } else {
            setSelectedPeriodType("");
            setSelectedTimePeriod("");
        }
    }, [selectedVariable, timePeriods]);


    const formatTimePeriod = (tp) => {
        if (!tp) return "";
        if (tp.includes("/")) {
            const [start, end] = tp.split("/");
            const [startY, startM, startD] = start.split("-");
            const [endY, endM, endD] = end.split("-");
            return `${startD}-${startM}-${startY} - ${endD}-${endM}-${endY}`;
        }
        if (tp.includes("-")) {
            const [year, month] = tp.split("-");
            return `${month}-${year}`;
        }
        return tp;
    };

    const filteredData = useMemo(() => {
        return data.filter((d) => {
            // Always filter by variable
            const matchesVariable = selectedVariable ? d.Variable === selectedVariable : true;

            // Period type filter (only for bar variables, and only if explicitly chosen)
            let matchesPeriodType = true;
            if (barChartVarsTime.includes(selectedVariable) && selectedPeriodType) {
                matchesPeriodType = selectedPeriodType === "Week"
                    ? d["Time-Period"]?.includes("/")
                    : d["Time-Period"] && !d["Time-Period"].includes("/");
            }

            // Time period filter (only if chosen and exists in valid list)
            let matchesTimePeriod = true;
            if (barChartVarsTime.includes(selectedVariable) && selectedTimePeriod) {
                matchesTimePeriod = d["Time-Period"] === selectedTimePeriod;
            }

            return matchesVariable && matchesPeriodType && matchesTimePeriod;
        });
    }, [selectedVariable, selectedPeriodType, selectedTimePeriod]);



    useEffect(() => {
        setCurrentPage(1);
    }, [filteredData]);

    const handleDownloadCSV = () => {
        const header = [
            "Variable",
            "Category",
            "Frequency",
            "% of Total",
            "Mean",
            "Median",
            "Std. Dev.",
            "Min",
            "Max",
        ];
        const rows = filteredData.map((row) => [
            row.Variable,
            row.Category,
            row.Frequency != null ? row.Frequency.toString() : "-",
            row["Percentage of Total"] != null ? row["Percentage of Total"].toFixed(2).replace(".", ",") : "-",
            row.Mean != null ? row.Mean.toFixed(2).replace(".", ",") : "-",
            row.Median != null ? (typeof row.Median === "number" ? row.Median.toFixed(2).replace(".", ",") : row.Median) : "-",
            row["Std. Dev."] != null ? row["Std. Dev."].toFixed(2).replace(".", ",") : "-",
            row.Min != null ? row.Min.toString().replace(".", ",") : "-",
            row.Max != null ? row.Max.toString().replace(".", ",") : "-",
        ]);


        const csvArray = [header, ...rows].map((r) => r.map((cell) => `"${cell}"`).join(";"));
        const csvContent = "\uFEFF" + csvArray.join("\n");
        const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `aggregation_${selectedVariable || "data"}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const currentData = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    // --- Color Mapping ---
    const colorMapping = {
        "Activity level": { "Very active": "green", Active: "blue", "Somewhat active": "yellow", "Not active at all/Sedentary": "red" },
        Age: { "<40": "green", "50-60": "yellow", "70+": "red", Missing: "gray" },
        BMI: { Normal: "green", Underweight: "yellow", Overweight: "blue", Obese: "red", Missing: "gray" },
        "Biological Sex": { Male: "blue", Female: "yellow", Missing: "gray" },
        "CRC Family history": { No: "green", Yes: "red" },
        "Region": { Urban: "#fac858", Rural: "#5470c6", Suburban: "#91cc75" },
        Diabetes: { No: "green" },
        Education: { "Elementary education (Basic reading and writing)": "yellow", "Secondary education or vocational training": "orange", "University education (Bachelor’s degree)": "blue", "Postgraduate education (Master’s degree, PhD)": "lightblue" },
        Employment: { "Still studying": "yellow", "Part-time / Seasonal employment": "orange", "Full-time / Self-employed": "lightblue", Retired: "blue" },
        Ethnicity: { Caucasian: "yellow", Other: "orange" },
        Housing: { Apartment: "yellow", Duplex: "green", "Single-family house": "orange", "Studio Apartment": "blue", Townhouse: "purple" },
        IBD: { No: "green", Yes: "red" },
        "Metabolic syndrome": { No: "green", Yes: "red" },
        Occupation: { "Elementary occupation": "lightblue", Manager: "yellow", Professional: "orange", "Service and sales worker": "green", "Skilled agricultural, forestry and fishery worker": "purple", "Technician and associate professional": "darkgreen", "Don't know / No answer": "lightgray", Missing: "gray" },
        "Relationship status": { "Living with a partner": "blue", "Living without a partner": "yellow" },
        "Smoking status": { "I have never smoked": "green", "I am a former smoker": "orange", "I am currently a regular smoker": "red" },
        "Alcohol grams/day": { Missing: "gray", Standard: "green", High: "red" },
        "CRC Risk Assessment Score (PYRAMID)": { Missing: "gray", 2: "green", 3: "yellow", 4: "red" },
        "Cheese grams/day": { Missing: "gray", Low: "red", Standard: "green" },
        "Cooked vegetables grams/day": { Missing: "gray", Low: "red", Standard: "green" },
        "Diary-plant based products mL/day": { Missing: "gray", Low: "red", Standard: "green" },
        "Fruits grams/day": { Missing: "gray", Low: "red", Standard: "green" },
        "Large fatty fish grams/day": { Missing: "gray", Low: "red", Standard: "green" },
        "Legumes grams/day": { Missing: "gray", Low: "red", Standard: "green" },
        "Nuts seeds grams/day": { Missing: "gray", Standard: "green", High: "red" },
        "Processed meat grams/day": { Missing: "gray", Standard: "green", High: "red" },
        "Raw vegetables grams/day": { Missing: "gray", Low: "red", Standard: "green" },
        "Red meat grams/day": { Missing: "gray", Standard: "green", High: "red" },
        "Small fatty fish grams/day": { Missing: "gray", Low: "red", Standard: "green" },
        "Wholegrains grams/day": { Missing: "gray", Low: "red", Standard: "green" },
    };

    const pieCategoryOrder = {
        "Activity level": ["Very active", "Active", "Somewhat active", "Not active at all/Sedentary"],
        Age: ["<40", "50-60", "70+", "Missing"],
        BMI: ["Normal", "Underweight", "Overweight", "Obese", "Missing"],
        "Biological Sex": ["Male", "Female", "Missing"],
        "CRC Family history": ["No", "Yes"],
        Diabetes: ["No"],
        Education: [
            "Elementary education (Basic reading and writing)",
            "Secondary education or vocational training",
            "University education (Bachelor’s degree)",
            "Postgraduate education (Master’s degree, PhD)"
        ],
        Employment: ["Still studying", "Part-time / Seasonal employment", "Full-time / Self-employed", "Retired"],
        Ethnicity: ["Caucasian", "Other"],
        Housing: ["Apartment", "Duplex", "Single-family house", "Studio Apartment", "Townhouse"],
        IBD: ["No", "Yes"],
        "Metabolic syndrome": ["No", "Yes"],
        Occupation: [
            "Elementary occupation",
            "Manager",
            "Professional",
            "Service and sales worker",
            "Skilled agricultural, forestry and fishery worker",
            "Technician and associate professional",
            "Don't know / No answer",
            "Missing"
        ],
        Region: null, // keep original order
        "Relationship status": ["Living with a partner", "Living without a partner"],
        "Smoking status": ["I have never smoked", "I am a former smoker", "I am currently a regular smoker"]
    };


    // --- Pie Chart Options ---
    const getPieOptions = (detailed = false) => {
        const order = pieCategoryOrder[selectedVariable];

        // Sort data according to custom order
        let dataSorted;
        if (order) {
            dataSorted = order
                .map(cat => filteredData.find(d => d.Category === cat))
                .filter(Boolean); // remove missing categories
        } else {
            dataSorted = [...filteredData]; // original order if no custom order
        }

        const seriesData = dataSorted.map((d) => ({
            name: d.Category,
            value: d["Percentage of Total"] ?? 0,
            itemStyle: { color: colorMapping[selectedVariable]?.[d.Category] || "#ccc" },
        }));

        return {
            tooltip: {
                trigger: "item",
                formatter: (params) => {
                    const row = filteredData.find((r) => r.Category === params.name);
                    if (!row) return '';
                    const pct = row["Percentage of Total"] != null ? row["Percentage of Total"].toFixed(2) : "-";
                    const freq = row.Frequency != null ? row.Frequency : "-";

                    return `
                    <strong>${params.name}</strong><br/>
                    <strong>Percentage of Total:</strong> ${pct}%<br/>
                    <strong>Frequency:</strong> ${freq}<br/>
                    ${detailed
                            ? `<strong>Mean:</strong> ${row.Mean?.toFixed(2) ?? "-"}<br/>
                           <strong>Median:</strong> ${row.Median?.toFixed(2) ?? "-"}<br/>
                           <strong>Std. Dev.:</strong> ${row["Std. Dev."]?.toFixed(2) ?? "-"}<br/>
                           <strong>Min:</strong> ${row.Min?.toFixed(2) ?? "-"}<br/>
                           <strong>Max:</strong> ${row.Max?.toFixed(2) ?? "-"}`
                            : ""}
                `;
                },
            },
            legend: { top: 20 },
            series: [{ type: "pie", radius: "60%", data: seriesData }],
        };
    };
    // helper function to map your custom colors to bootstrap table classes
    const getBootstrapRowClass = (variable: string, category: string) => {
        const color = colorMapping[variable]?.[category];

        switch (color) {
            case "green":
            case "#91cc75":
            case "lightgreen":
                return "table-success";
            case "red":
                return "table-danger";
            case "yellow":
            case "orange":
            case "#fac858":
                return "table-warning";
            case "blue":
            case "lightblue":
            case "#5470c6":
                return "table-info";
            case "gray":
            case "lightgray":
                return "table-secondary";
            default:
                return "";
        }
    };



    // --- Bar Chart Options ---
    const getBarOptions = () => {
        let allCategories =
            selectedVariable === "CRC Risk Assessment Score (PYRAMID)"
                ? [2, 3, 4, "Missing"]
                : ["Low", "Standard", "High", "Missing"];

        // Keep only categories present in the filtered data
        const existingCategories = allCategories.filter(cat =>
            filteredData.some(d => d.Category === cat)
        );

        const timePeriods = [...new Set(filteredData.map(d => d["Time-Period"]))];

        const dataMap = {};
        filteredData.forEach(d => {
            const key = `${d.Category}||${d["Time-Period"]}`;
            dataMap[key] = d;
        });

        const series = existingCategories.map(cat => ({
            name: cat,
            type: "bar",
            stack: "total",
            emphasis: { focus: "series" },
            itemStyle: { color: colorMapping[selectedVariable]?.[cat] || "#ccc" },
            data: timePeriods.map(tp => {
                const entry = dataMap[`${cat}||${tp}`];
                return {
                    value: entry?.Frequency ?? 0,
                    raw: entry || { Frequency: 0 }
                };
            })
        }));

        const safeNum = (val) => (typeof val === "number" && !isNaN(val) ? val.toFixed(2) : "-");

        return {
            tooltip: {
                trigger: "item",
                formatter: (params) => {
                    const entry = params.data?.raw || {};
                    return `
                        <strong>${params.seriesName}</strong><br/>
                        <strong>Time Period: </strong>${params.name}<br/>
                        <strong>Frequency: </strong>${params.value}
                        ${typeof entry.Mean === "number" ? `<br/><strong>Mean: </strong>${entry.Mean.toFixed(2)}` : ""}
                        ${typeof entry.Median === "number" ? `<br/><strong>Median: </strong>${entry.Median.toFixed(2)}` : ""}
                        ${typeof entry["Std. Dev."] === "number" ? `<br/><strong>Std. Dev.: </strong>${entry["Std. Dev."].toFixed(2)}` : ""}
                        ${typeof entry.Min === "number" ? `<br/><strong>Min: </strong>${entry.Min.toFixed(2)}` : ""}
                        ${typeof entry.Max === "number" ? `<br/><strong>Max: </strong>${entry.Max.toFixed(2)}` : ""}
                    `;

                }
            },
            legend: { top: 20 },
            xAxis: { type: "category", data: timePeriods.map(tp => formatTimePeriod(tp)) },
            yAxis: { type: "value", name: "Frequency" },
            series
        };
    };

    return (

        <div className="container-fluid mt-3">

            <div className="row">
                <h3>Aggregation Analysis</h3>
                {/* Left Column */}
                <div className="col-2">
                    <label className="fw-bold mb-1">Select Variable</label>
                    <select
                        className="form-control mb-3"
                        value={selectedVariable}
                        onChange={(e) => setSelectedVariable(e.target.value)}
                    >
                        <option value="">-- Select Variable --</option>
                        {variables.map((v, i) => (
                            <option key={i} value={v}>{v}</option>
                        ))}
                    </select>

                    {barChartVarsTime.includes(selectedVariable) && (
                        <>
                            <label><strong>Period Type</strong></label>
                            <select
                                className="form-control mb-3"
                                value={selectedPeriodType}
                                onChange={(e) => setSelectedPeriodType(e.target.value)}
                            >
                                <option value="">-- All Period Types --</option>
                                {periodTypes.map((pt, i) => (
                                    <option key={i} value={pt}>{pt}</option>
                                ))}
                            </select>

                            <label><strong>Time Period</strong></label>
                            <select
                                className="form-control mb-3"
                                value={selectedTimePeriod}
                                onChange={(e) => setSelectedTimePeriod(e.target.value)}
                                disabled={!selectedPeriodType}
                            >
                                <option value="">-- All Time Periods --</option>
                                {timePeriods.map((tp, i) => (
                                    <option key={i} value={tp}>{formatTimePeriod(tp)}</option>
                                ))}
                            </select>
                        </>
                    )}
                </div>

                {/* Main Column */}
                <div className="col-8 mt-5">

                    <h5 className="">{selectedVariable}</h5>
                    {!selectedVariable && <p>Please select a variable from the dropdown menu on the left.</p>}

                    {selectedVariable && filteredData.length > 0 && (
                        <>
                            {chartType === "pie-detailed" && <ReactECharts key={selectedVariable} option={getPieOptions(true)} style={{ height: 400 }} />}
                            {chartType === "pie-simple" && <ReactECharts key={selectedVariable} option={getPieOptions(false)} style={{ height: 400 }} />}
                            {chartType === "bar" && <ReactECharts key={selectedVariable} option={getBarOptions()} style={{ height: 400 }} />}

                            <Button className="mt-3" onClick={() => setShowModal(true)}>View Table</Button>

                            <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered>
                                <Modal.Header closeButton>
                                    <Modal.Title>{selectedVariable}</Modal.Title>
                                    <Button variant="success" className="ms-auto" onClick={handleDownloadCSV}>Download CSV</Button>
                                </Modal.Header>
                                <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full border border-gray-200 rounded-lg shadow-md">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide">Color</th>
                                                    {[
                                                        "Variable",
                                                        "Category",
                                                        "Frequency",
                                                        "% of Total",
                                                        "Mean",
                                                        "Median",
                                                        "Std. Dev.",
                                                        "Min",
                                                        "Max",
                                                    ].map((header, i) => (
                                                        <th
                                                            key={i}
                                                            className="px-4 py-2 text-left text-sm font-semibold text-gray-700 uppercase tracking-wide"
                                                        >
                                                            {header}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentData.map((row, idx) => {
                                                    const color = colorMapping[row.Variable]?.[row.Category] || "#ccc";

                                                    return (
                                                        <tr key={idx} style={{ height: "50px" }}>
                                                            <td className="px-4 py-2 text-center">
                                                                <div
                                                                    style={{
                                                                        width: "16px",
                                                                        height: "16px",
                                                                        borderRadius: "50%",
                                                                        backgroundColor: colorMapping[row.Variable]?.[row.Category] || "#ccc",
                                                                        display: "inline-block",
                                                                    }}
                                                                />
                                                            </td>
                                                            <td className="px-4 py-2">{row.Variable}</td>
                                                            <td className="px-4 py-2">{row.Category}</td>
                                                            <td className="px-4 py-2">{row.Frequency ?? "-"}</td>
                                                            <td className="px-4 py-2">{row["Percentage of Total"]?.toFixed(2) ?? "-"}</td>
                                                            <td className="px-4 py-2">{row.Mean?.toFixed(2) ?? "-"}</td>
                                                            <td className="px-4 py-2">{row.Median ?? "-"}</td>
                                                            <td className="px-4 py-2">{row["Std. Dev."]?.toFixed(2) ?? "-"}</td>
                                                            <td className="px-4 py-2">{row.Min ?? "-"}</td>
                                                            <td className="px-4 py-2">{row.Max ?? "-"}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>

                                    </div>
                                </Modal.Body>

                                <Modal.Footer>
                                    <Button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>Previous</Button>
                                    <span className="mx-2">Page {currentPage} of {totalPages}</span>
                                    <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>Next</Button>
                                </Modal.Footer>
                            </Modal>
                        </>
                    )}
                </div>
                <div className="col-2"><Comments /></div>

            </div>
        </div>
    );
};

export default AggregationAnalysis;

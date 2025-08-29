import React, { useState, useMemo, useEffect } from "react";
import data from "../assets/aggregation_final_greece.json";
import ReactECharts from "echarts-for-react";
import { Modal, Button } from "react-bootstrap";

const AggregationAnalysis = () => {
    const [selectedVariable, setSelectedVariable] = useState("");
    const [selectedPeriodType, setSelectedPeriodType] = useState("");
    const [selectedTimePeriod, setSelectedTimePeriod] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const rowsPerPage = 10;

    const variables = [...new Set(data.map((d) => d.Variable))];
    const periodTypes = ["Week", "Month"];

    const timePeriods = useMemo(() => {
        const periods = data
            .filter(d =>
                selectedPeriodType === "Week"
                    ? d["Time-Period"]?.includes("/")
                    : d["Time-Period"] && !d["Time-Period"].includes("/")
            )
            .map(d => d["Time-Period"])
            .filter((v, i, a) => v != null && a.indexOf(v) === i); // <-- filter out nulls

        return periods.sort((a, b) => a.toString().localeCompare(b.toString()));
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
        // Only set default if undefined, otherwise leave "" for All Time Periods
        if (selectedTimePeriod === undefined && timePeriods.length > 0) {
            setSelectedTimePeriod("");
        }
    }, [timePeriods]);


    useEffect(() => {
        // Reset Time Period whenever Period Type changes
        setSelectedTimePeriod("");
    }, [selectedPeriodType]);

    useEffect(() => {
        if (!barChartVarsTime.includes(selectedVariable)) {
            setSelectedPeriodType("");
            setSelectedTimePeriod("");
        }
    }, [selectedVariable]);

    const formatTimePeriod = (tp) => {
        if (!tp) return "";

        // Handle weeks like "2024-10-07/2024-10-13" → "07-10-2024 - 13-10-2024"
        if (tp.includes("/")) {
            const [start, end] = tp.split("/");
            const [startY, startM, startD] = start.split("-"); // YYYY-MM-DD
            const [endY, endM, endD] = end.split("-");
            return `${startD}-${startM}-${startY} - ${endD}-${endM}-${endY}`;
        }

        // Handle months like "2024-10" → "01-10-2024"
        if (tp.includes("-")) {
            const [year, month] = tp.split("-");
            return `01-${month}-${year}`;
        }

        return tp;
    };




    const filteredData = useMemo(() => {
        return data.filter((d) => {
            // Variable must match
            const matchesVariable = selectedVariable ? d.Variable === selectedVariable : true;

            // Period type
            const matchesPeriodType =
                !selectedPeriodType || selectedPeriodType === "" ||
                (selectedPeriodType === "Week"
                    ? d["Time-Period"]?.includes("/")
                    : d["Time-Period"] && !d["Time-Period"].includes("/"));

            // Time period
            const matchesTimePeriod =
                !selectedTimePeriod || selectedTimePeriod === "" || d["Time-Period"] === selectedTimePeriod;

            return matchesVariable && matchesPeriodType && matchesTimePeriod;
        });
    }, [selectedVariable, selectedPeriodType, selectedTimePeriod]);


    useEffect(() => {
        setCurrentPage(1);
    }, [filteredData]);


    // --- CSV Download (pure JS, no file-saver needed) ---
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
            row.Frequency ?? "-",
            row["Percentage of Total"] != null ? row["Percentage of Total"].toFixed(2) : "-",
            row.Mean ?? "-",
            row.Median ?? "-",
            row["Std. Dev."] ?? "-",
            row.Min ?? "-",
            row.Max ?? "-",
        ]);

        // Join rows with comma and line breaks
        const csvArray = [header, ...rows].map((r) =>
            r.map((cell) => `"${cell}"`).join(";") // <-- semicolon separator
        );

        // Add UTF-8 BOM for Excel
        const csvContent = "\uFEFF" + csvArray.join("\n");

        const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `aggregation_${selectedVariable || "data"}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    // --- Pagination ---
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const currentData = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    // --- Chart Options ---
    const getPieOptions = (detailed = false) => ({
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
    });

    const timePeriodLookup = {};
    timePeriods.forEach(tp => {
        timePeriodLookup[formatTimePeriod(tp)] = tp;
    });

    const getBarOptions = () => {
        const categories = [...new Set(filteredData.map((d) => d.Category))];
        const timePeriods = [...new Set(filteredData.map((d) => d["Time-Period"]))];

        // Lookup table: formatted time → original time
        const timePeriodLookup = {};
        timePeriods.forEach(tp => {
            timePeriodLookup[formatTimePeriod(tp)] = tp;
        });

        const series = categories.map((cat) => ({
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
        }));

        return {
            tooltip: {
                trigger: "item",
                formatter: (params) => {
                    const originalTP = timePeriodLookup[params.name]; // map back
                    const row = filteredData.find(
                        (d) => d.Category === params.seriesName && d["Time-Period"] === originalTP
                    );
                    if (!row) return "";

                    let content = `<strong>${params.seriesName}</strong><br/>`;
                    content += `Time Period: ${params.name}<br/>`; // show formatted
                    content += `Frequency: ${row.Frequency ?? "-"}<br/>`;
                    content += `Percentage of Total: ${row["Percentage of Total"]?.toFixed(2) ?? "-"}%`;

                    if (selectedVariable !== "CRC Risk Assessment Score (PYRAMID)") {
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
            xAxis: {
                type: "category",
                data: timePeriods.map(tp => formatTimePeriod(tp)), // formatted
            },
            yAxis: { type: "value" },
            series,
        };
    };



    return (
        <div className="container-fluid mt-3">
            <h3>Aggregation Analysis</h3>
            <div className="row mt-4">
                {/* Left Column */}
                <div className="col-2">
                    <label className="fw-bold">Select Variable</label>
                    <select
                        className="form-control mb-3"
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
                <div className="col-8">
                    {!selectedVariable && (
                        <p>Please select a variable from the dropdown menu on the left.</p>
                    )}

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

                            <Button className="mt-3" onClick={() => setShowModal(true)}>
                                View Table
                            </Button>

                            {/* Modal */}
                            <Modal
                                show={showModal}
                                onHide={() => setShowModal(false)}
                                size="xl"
                                centered
                            >
                                <Modal.Header closeButton>
                                    <Modal.Title>{selectedVariable}</Modal.Title>
                                    <Button
                                        variant="success"
                                        className="ms-auto"
                                        onClick={handleDownloadCSV}
                                    >
                                        Download CSV
                                    </Button>
                                </Modal.Header>
                                <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
                                    <table className="table table-bordered table-striped">
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
                                            {currentData.map((row, idx) => (
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
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((p) => p - 1)}
                                    >
                                        Previous
                                    </Button>
                                    <span className="mx-2">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <Button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage((p) => p + 1)}
                                    >
                                        Next
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AggregationAnalysis;

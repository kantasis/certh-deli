import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import axios from "axios";
import * as AuthService from "../services/auth.service.tsx";
import Comments from "./Comments.tsx";
import { Accordion, Modal, Button } from 'react-bootstrap';
import SaveGraphButton from "./SaveGraphButton.tsx";
import { useLocation, useNavigate } from "react-router-dom";


const countries_strLst = [
    "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czechia",
    "Denmark", "Estonia", "Finland", "France", "Germany", "Greece",
    "Hungary", "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg",
    "Malta", "Netherlands", "Poland", "Portugal", "Romania", "Slovakia",
    "Slovenia", "Spain", "Sweden"
];

const typeOptions = [
    { value: "exposure_weighted", label: "Overview: Exposure Weighted" },
    { value: "quick_wins", label: "Quick Wins" },
    { value: "effect_sev_unit", label: "Overview: Effect per SEV Unit" },
    { value: "sf_intervention", label: "Single-Factor Intervention" },
    { value: "sf_target", label: "Single-Factor Target" },
    { value: "two_factor_heatmaps", label: "Two-Factor Joint Effect" }
];

// ─────────────────────────────────────────────
// Inline HeatmapEChart (ported from TwoFactorHeatmapViewer)
// ─────────────────────────────────────────────
function HeatmapEChart({ heatmap, country, horizon, chartRef, onChartRendered }) {
    const Z = heatmap.Z_plot;
    const rows = Z.length;
    const cols = Z[0].length;

    const xGrid = heatmap.x_axis?.grid ?? [];
    const yGrid = heatmap.y_axis?.grid ?? [];

    const data = [];
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            data.push([x, y, Z[y][x]]);
        }
    }

    const capitalizeWords = (str) => str.replace(/\b\w/g, (c) => c.toUpperCase());
    const formatHorizon = (h) => {
        const n = String(h).replace("Y", "");
        return `${n} ${n === "1" ? "Year" : "Years"}`;
    };

    const friendlyCountry = capitalizeWords(country.replace(/_/g, " "));
    const friendlyFactor1 = capitalizeWords(heatmap.factor_1.replace(/_/g, " "));
    const friendlyFactor2 = capitalizeWords(heatmap.factor_2.replace(/_/g, " "));

    const option = {
        title: [
            {
                text: `${friendlyCountry} | ${formatHorizon(horizon)} | ${friendlyFactor1} × ${friendlyFactor2}`,
                left: "center",
                top: 10,
                textStyle: { fontSize: 16, fontWeight: "bold" },
            },
            {
                text: `Baseline: ${heatmap.baseline_incidence} | Max Δ: ${heatmap.Z_max.toFixed(3)}%`,
                left: "center",
                top: 35,
                textStyle: { fontSize: 12, color: "#444" },
            },
        ],
        tooltip: {
            backgroundColor: "#ffffff",
            borderColor: "#000",
            borderWidth: 1,
            textStyle: { color: "#000", fontSize: 12 },
            formatter: (p) => {
                const x = xGrid[p.value[0]];
                const y = yGrid[p.value[1]];
                return `
                    ${friendlyFactor1}: ${(100 * y).toFixed(1)}%<br/>
                    ${friendlyFactor2}: ${(100 * x).toFixed(1)}%<br/>
                    <b>Change vs Baseline: ${p.value[2].toFixed(2)}%</b>
                `;
            },
        },
        xAxis: {
            type: "category",
            name: friendlyFactor2 + ": exposure reduction (%)",
            nameLocation: "middle",
            nameGap: 50,
            data: xGrid.map((v) => `${(v * 100).toFixed(1)}%`),
            axisLabel: { rotate: 45 },
        },
        yAxis: {
            type: "category",
            name: friendlyFactor1 + ": exposure reduction (%)",
            nameLocation: "middle",
            nameRotate: 90,
            nameGap: 50,
            inverse: true,
            data: yGrid.map((v) => `${(v * 100).toFixed(1)}%`),
        },
        visualMap: {
            min: 0,
            max: heatmap.Z_max,
            orient: "vertical",
            right: -3,
            top: "middle",
            itemHeight: 220,
            itemWidth: 16,
            calculable: true,
            text: ["Highest reduction", "Lowest reduction"],
            textStyle: { fontSize: 12, color: "#333", fontWeight: 500 },
            formatter: (value) => `${value.toFixed(2)}%`,
            inRange: { color: ["#440154", "#3b528b", "#21918c", "#5ec962", "#fde725"] },
        },
        graphic: {
            elements: [
                {
                    type: "text",
                    right: 6,
                    top: "middle",
                    rotation: -Math.PI / 2,
                    z: 100,
                    style: {
                        text: "Estimated CRC incidence reduction (%)",
                        fill: "#333",
                        fontSize: 12,
                        fontWeight: 500,
                        textAlign: "center",
                        textVerticalAlign: "middle",
                    },
                },
            ],
        },
        series: [
            {
                type: "heatmap",
                data,
                emphasis: {
                    itemStyle: {
                        borderColor: "#111",
                        borderWidth: 2,
                        shadowBlur: 15,
                        shadowColor: "rgba(0,0,0,0.3)",
                    },
                },
            },
        ],
    };

    return (
        <ReactECharts
            ref={chartRef}
            option={option}
            notMerge
            lazyUpdate={false}
            style={{ height: 600, width: "100%" }}
            onChartReady={() => {
                setTimeout(() => {
                    const instance = chartRef.current?.getEchartsInstance();
                    if (!instance) return;
                    const url = instance.getDataURL({ type: "webp", pixelRatio: 2, backgroundColor: "#fff" });
                    onChartRendered(url);
                }, 500);
            }}
        />
    );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
const DeliPredictions = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // ── shared ────────────────────────────────
    const [type, setType] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [token, setToken] = useState(null);

    // ── regular-chart state ───────────────────
    const chartRef = useRef<ReactECharts>(null);
    const [country, setCountry] = useState("Austria");
    const [horizon, setHorizon] = useState("5");
    const [riskFactor, setRiskFactor] = useState("");
    const [chartOptions, setChartOptions] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [riskFactorsLst, setRiskFactorsLst] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);
    const [modalTitle, setModalTitle] = useState<string>("");
    const [biasContent, setBiasContent] = useState<string[]>([]);
    const [isBiasModal, setIsBiasModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const itemsPerPage = 5;
    const [baselineShift, setBaselineShift] = useState(0);
    const [apiResponse, setApiResponse] = useState(null);
    const [selectedTarget, setSelectedTarget] = useState(0);
    const [chartImageUrl, setChartImageUrl] = useState<string>("");

    // ── two_factor state ──────────────────────
    const tfChartRef = useRef<ReactECharts>(null);
    const [tfCountry, setTfCountry] = useState("Austria");
    const [tfHorizon, setTfHorizon] = useState("1");
    const [tfPairId, setTfPairId] = useState(null);
    const [tfJson, setTfJson] = useState(null);
    const [tfLoading, setTfLoading] = useState(false);
    const [tfChartImageUrl, setTfChartImageUrl] = useState<string>("");
    const [tfIsRestored, setTfIsRestored] = useState(false);

    const isTwoFactor = type === "two_factor_heatmaps";

    // ── read tab from URL ─────────────────────
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setType(params.get("tab") || "");
    }, [location.search]);

    // ── auth ──────────────────────────────────
    useEffect(() => {
        setIsLoggedIn(AuthService.isLoggedIn());
    }, []);

    // ── token ─────────────────────────────────
    useEffect(() => {
        const TOKEN_KEY = "oncodir_token";
        const TOKEN_TS_KEY = "oncodir_token_ts";
        const ONE_DAY = 24 * 60 * 60 * 1000;

        const getToken = async () => {
            const storedToken = localStorage.getItem(TOKEN_KEY);
            const storedTs = localStorage.getItem(TOKEN_TS_KEY);
            const now = Date.now();
            if (storedToken && storedTs && now - parseInt(storedTs) < ONE_DAY) {
                setToken(storedToken);
                return;
            }
            const controller = new AbortController();
            try {
                const res = await fetch("https://oncodir-datapi.catalink.eu/v1/services/login/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        service_name: import.meta.env.VITE_SERVICE_NAME,
                        password: import.meta.env.VITE_SERVICE_PASSWORD,
                    }),
                    signal: controller.signal,
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const newToken = await res.text();
                localStorage.setItem(TOKEN_KEY, newToken);
                localStorage.setItem(TOKEN_TS_KEY, now.toString());
                setToken(newToken);
            } catch (err) {
                if (err.name !== "AbortError") console.error("Login failed:", err);
            }
            return () => controller.abort();
        };
        getToken();
    }, []);

    // ── bias JSON ─────────────────────────────
    useEffect(() => {
        fetch("/bias_assessment.json")
            .then((res) => res.json())
            .then((data) => {
                const alerts = data?.["Alerts Consolidation"]?.["Bias Analysis Alerts"];
                if (Array.isArray(alerts)) setBiasContent(alerts);
            })
            .catch((err) => console.error("Failed to load Bias Analysis Alerts:", err));
    }, []);

    // ── reset risk factor on horizon / type change ──
    useEffect(() => { setRiskFactor(""); }, [horizon, type]);

    // ── chart image snapshot ──────────────────
    useEffect(() => {
        if (!chartRef.current) return;
        const timeout = setTimeout(() => {
            const instance = chartRef.current?.getEchartsInstance();
            if (!instance) return;
            setChartImageUrl(instance.getDataURL({ type: "webp", quality: 0.7, pixelRatio: 1, backgroundColor: "#fff" }));
        }, 1500);
        return () => clearTimeout(timeout);
    }, [chartOptions]);

    // ── regular chart fetch ───────────────────
    useEffect(() => {
        if (!type || !horizon || !token || isTwoFactor) return;
        if (["sf_intervention", "sf_target", "exposure_weighted"].includes(type) && !country) return;

        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                let url = `https://oncodir-datapi.catalink.eu/v1/deli/predictions?type=${type}&prediction_horizon=${horizon}`;
                if (["sf_intervention", "sf_target", "exposure_weighted"].includes(type) && country)
                    url += `&country=${encodeURIComponent(country)}`;
                if (riskFactor && ["sf_intervention", "sf_target", "effect_sev_unit"].includes(type))
                    url += `&risk_factor=${riskFactor}`;

                const res = await axios.get(url, {
                    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
                });

                const formatLabel = (raw: string) =>
                    raw.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

                const apiData = res.data.data;
                if (type === "sf_intervention" || type === "sf_target") {
                    setRiskFactorsLst(
                        Object.keys(apiData || {}).map((key) => ({
                            value: key,
                            label: apiData[key]?.factor_label || formatLabel(key),
                        }))
                    );
                }
                setApiResponse(res.data);
                setChartOptions(buildChartOptions(res.data, baselineShift, riskFactor, selectedTarget));
            } catch (err) {
                setError(err.message || "Error fetching data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [type, horizon, country, riskFactor, token]);

    // ── rebuild chart when slider / target changes ──
    useEffect(() => {
        if (!apiResponse) return;
        setChartOptions(buildChartOptions(apiResponse, baselineShift, riskFactor, selectedTarget));
    }, [apiResponse, baselineShift, riskFactor, selectedTarget]);

    useEffect(() => { setBaselineShift(0); }, [type, riskFactor, country]);

    useEffect(() => {
        if (!type) setChartOptions({ title: { text: "", left: "center" }, series: [], skipMessage: "" });
    }, [type]);

    // ── click handler for sf_target ───────────
    useEffect(() => {
        if (!chartRef.current) return;
        const chart = chartRef.current.getEchartsInstance();
        chart.on("click", handleChartClick);
        return () => { chart.off("click", handleChartClick); };
    }, [chartOptions]);

    const handleChartClick = useCallback((params) => {
        if (type !== "sf_target") return;
        const { data } = params;
        if (!data || data.length < 2) return;
        setSelectedTarget(Math.round(data[0]));
    }, [type]);

    // ── two_factor fetch ──────────────────────
    useEffect(() => {
        if (!isTwoFactor || !isLoggedIn || !token || !tfHorizon || !tfCountry || !tfIsRestored) return;
        const controller = new AbortController();
        const loadData = async () => {
            try {
                setTfLoading(true);
                const res = await fetch(
                    `https://oncodir-datapi.catalink.eu/v1/deli/predictions` +
                    `?type=two_factor_heatmaps&prediction_horizon=${tfHorizon}&country=${tfCountry}`,
                    { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, signal: controller.signal }
                );
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const j = await res.json();
                setTfJson(j);
                setTfCountry(j.country);
                setTfPairId(j.top_pairs_table?.[0]?.pair_id ?? null);
            } catch (err) {
                if (err.name !== "AbortError") console.error("Two-factor API error:", err);
            } finally {
                setTfLoading(false);
            }
        };
        loadData();
        return () => controller.abort();
    }, [isTwoFactor, isLoggedIn, token, tfHorizon, tfCountry, tfIsRestored]);

    // ── default first pair when json loads ────
    useEffect(() => {
        if (!tfJson) return;
        setTfPairId(tfJson.top_pairs_table?.[0]?.pair_id ?? null);
    }, [tfJson]);

    // ── restore saved state ───────────────────
    const savedIframeUrl = location.state?.iframeUrl;
    const [pendingRiskFactor, setPendingRiskFactor] = useState<string | null>(null);

    useEffect(() => {
        if (!savedIframeUrl) { setTfIsRestored(true); return; }
        try {
            const parsed = typeof savedIframeUrl === "string" ? JSON.parse(savedIframeUrl) : savedIframeUrl;
            const params = parsed.params;
            if (!params) { setTfIsRestored(true); return; }
            if (params.analysis) setType(params.analysis);
            if (params.horizon) setHorizon(params.horizon);
            if (params.country) setCountry(params.country);
            if (params.riskFactor) setPendingRiskFactor(params.riskFactor);
            if (params.tfCountry) setTfCountry(params.tfCountry);
            if (params.tfHorizon) setTfHorizon(String(params.tfHorizon));
            if (params.pairId) setTfPairId(params.pairId);
        } catch (err) {
            console.error("Invalid savedIframeUrl format", err);
        }
        setTfIsRestored(true);
    }, [savedIframeUrl]);

    useEffect(() => {
        if (pendingRiskFactor && riskFactorsLst.length > 0) {
            const rf = riskFactorsLst.find((r) => r.label === pendingRiskFactor || r.value === pendingRiskFactor);
            if (rf) setRiskFactor(rf.value);
            setPendingRiskFactor(null);
        }
    }, [pendingRiskFactor, riskFactorsLst]);

    // ── helpers ───────────────────────────────
    const capitalizeWords = (str) => str.replace(/\b\w/g, (c) => c.toUpperCase());

    const tfPairs = useMemo(() => tfJson?.top_pairs_table || [], [tfJson]);

    const tfHeatmap = useMemo(() => {
        if (!tfJson || !tfPairId) return null;
        return tfJson.heatmaps.find((h) => h.pair_id === tfPairId);
    }, [tfJson, tfPairId]);

    const getChartImageUrl = () => {
        if (!chartRef.current) return "";
        return chartRef.current.getEchartsInstance().getDataURL({ type: "webp", quality: 0.7, pixelRatio: 1, backgroundColor: "#fff" });
    };

    const getUriParams = () => {
        const params: Record<string, string> = {};
        if (type) params.analysis = type;
        if (isTwoFactor) {
            if (tfHorizon) params.tfHorizon = tfHorizon;
            if (tfCountry) params.tfCountry = tfCountry;
            if (tfPairId) params.pairId = tfPairId;
        } else {
            if (horizon) params.horizon = horizon;
            if (["sf_intervention", "sf_target", "exposure_weighted"].includes(type) && country) params.country = country;
            if (["sf_intervention", "sf_target", "effect_sev_unit"].includes(type) && riskFactor) {
                params.riskFactor = riskFactorsLst.find((rf) => rf.value === riskFactor)?.label || riskFactor;
            }
        }
        return params;
    };

    const handleAccordionModal = (title: string, isBias: boolean) => {
        setModalTitle(title);
        setIsBiasModal(isBias);
        setShowModal(true);
    };

    const paginatedBiasContent = () => {
        const totalPages = Math.ceil(biasContent.length / itemsPerPage);
        const start = currentPage * itemsPerPage;
        const end = start + itemsPerPage;
        return (
            <>
                <ul>{biasContent.slice(start, end).map((item, idx) => <li key={idx}>{item}</li>)}</ul>
                <div className="d-flex justify-content-between align-items-center mt-3">
                    <Button variant="primary" onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 0}>Previous</Button>
                    <span className="mx-3">Page {currentPage + 1} of {totalPages}</span>
                    <Button variant="primary" onClick={() => setCurrentPage((p) => p + 1)} disabled={end >= biasContent.length}>Next</Button>
                </div>
                <div className="mt-3 text-center">
                    Click <a href="/Bias_Analysis_Report.pdf" target="_blank">here</a> to download the Bias Analysis Report
                </div>
            </>
        );
    };

    // ── chart builder ─────────────────────────
    const buildChartOptions = (apiResponse, baselineShift?, riskFactor?, selectedTarget?) => {
        const { type, data } = apiResponse;
        if (!data) return {};

        if (type === "sf_intervention") {
            if (!riskFactor) return { title: { text: "", left: "center" }, series: [], skipMessage: '<div class="d-flex justify-content-center mt-3 alert alert-info text-center">Please select a risk factor</div>' };
            const rfData = data[riskFactor];
            const rfLabel = riskFactorsLst.find((rf) => rf.value === riskFactor)?.label || riskFactor;
            if (!rfData) return { title: { text: "", left: "center" }, series: [], skipMessage: `No data available for risk factor: ${rfLabel}` };
            if (rfData.skip_reason) return { title: { text: `${rfData.factor_label || ""} — ${rfData.title || ""}`, left: "center" }, series: [], skipMessage: `<div class="d-flex justify-content-center mt-3 alert alert-warning text-center">${rfData.skip_reason}</div>` };
            if (!rfData.results?.length) return { title: { text: `${rfData.factor_label || ""} — ${rfData.title || ""}`, left: "center" }, series: [], skipMessage: "No results available for this risk factor" };

            const dataset = rfData.results.map((d) => ({ x: d.percent_reduction, ciLow: d.ci_lower, ciDiff: d.ci_upper - d.ci_lower, predicted: d.predicted_crc_incidence }));
            const baselineDataset = baselineShift < dataset.length ? [dataset[baselineShift]] : [];

            return {
                title: { text: `${rfData.factor_label || ""} — ${rfData.title || ""}`, left: "center" },
                legend: { top: 30, left: "center", itemWidth: 20, itemHeight: 12 },
                dataset: [{ source: dataset }, { source: baselineDataset }],
                xAxis: { type: "category", name: "SEV Reduction (%)", nameLocation: "center", nameGap: 30 },
                yAxis: { name: rfData.y_axis_label || "", nameRotate: 90, nameLocation: "center", nameGap: 55 },
                series: [
                    { name: "", type: "line", encode: { y: "ciLow" }, stack: "ci", symbol: "none", lineStyle: { opacity: 0 }, showInLegend: false },
                    { name: "Confidence Intervals", type: "line", encode: { y: "ciDiff" }, stack: "ci", symbol: "none", areaStyle: { color: "rgba(128,200,128,0.3)" }, lineStyle: { opacity: 0 } },
                    { name: "Predicted CRC", type: "line", encode: { y: "predicted" }, smooth: true, lineStyle: { color: "green", width: 2 }, symbol: "circle", symbolSize: 6 },
                    { name: "Prediction at % SEV Reduction", type: "scatter", datasetIndex: 1, encode: { x: "x", y: "predicted" }, z: 200, symbol: "circle", itemStyle: { color: "red" }, symbolSize: 10 },
                ],
                tooltip: {
                    trigger: "axis",
                    formatter: (params) => {
                        const pred = params.find((p) => p.seriesName === "Predicted CRC");
                        const baseline = params.find((p) => p.seriesName === "Prediction at % SEV Reduction");
                        const ci = params.find((p) => p.seriesName === "Confidence Intervals");
                        if (!pred) return "";
                        const { x, predicted, ciLow, ciDiff } = pred.data;
                        const ciHigh = ciLow !== undefined && ciDiff !== undefined ? ciLow + ciDiff : null;
                        let html = `<div style="text-align:left;"><div><strong>${rfData.factor_label} - ${rfData.title || ""}</strong></div><div>SEV Reduction: <strong>${x}</strong>%</div>`;
                        html += `<div style="display:flex;align-items:center;margin-bottom:4px;"><span style="display:inline-block;width:10px;height:10px;background-color:${pred.color || "green"};border-radius:50%;margin-right:5px;"></span>Predicted CRC:&nbsp;<strong>${predicted.toFixed(2)}</strong></div>`;
                        if (baseline) html += `<div style="display:flex;align-items:center;margin-bottom:4px;"><span style="display:inline-block;width:10px;height:10px;background-color:${baseline.color || "red"};border-radius:50%;margin-right:5px;"></span>Prediction at ${apiResponse.data[riskFactor].results[baselineShift]?.percent_reduction}% SEV reduction:&nbsp;<strong>${baseline.data.predicted.toFixed(2)}</strong></div>`;
                        if (ciLow !== undefined && ciHigh !== null) html += `<div style="display:flex;align-items:center;margin-top:4px;"><span style="display:inline-block;width:10px;height:10px;background-color:${ci?.itemStyle?.color || "#93cd78"};border-radius:50%;margin-right:5px;"></span>Confidence Interval:<strong>&nbsp;[${ciLow.toFixed(2)}, ${ciHigh.toFixed(2)}]</strong></div>`;
                        html += "</div>";
                        return html;
                    },
                },
            };
        }

        if (type === "sf_target") {
            if (!riskFactor) return { title: { text: "", left: "center" }, series: [], skipMessage: '<div class="d-flex justify-content-center mt-3 alert alert-info text-center">Please select a risk factor</div>' };
            const targetData = data[riskFactor];
            if (!targetData) return { title: { text: "" }, series: [] };
            if (targetData.skip_reason) return { title: { text: targetData.title, left: "center" }, skipMessage: `<div class="alert alert-warning mt-3 text-center">${targetData.skip_reason}</div>` };

            const dataset = targetData.results.filter((d) => d.required_sev_reduction !== null).map((d) => ({ x: d.target_crc_reduction, y: d.required_sev_reduction, feasible: d.feasible }));
            const selected = dataset.find((d) => Math.round(d.x) === Math.round(Number(selectedTarget)));
            const activePoint = selected || dataset[dataset.length - 1];
            const titleMatch = targetData.title.match(/—\s*(.*)/);
            const countryAndYears = titleMatch ? titleMatch[1] : targetData.country || "";
            const subtext = activePoint ? `To reduce CRC Incidence by ${activePoint.x.toFixed(0)}% in ${countryAndYears}, SEV must be reduced by ${activePoint.y.toFixed(2)}%.` : "";

            return {
                title: { text: targetData.title, subtext, left: "center", top: 10, textStyle: { fontSize: 16, fontWeight: "bold" }, subtextStyle: { fontSize: 13, color: "#555", fontStyle: "italic", lineHeight: 18 } },
                grid: { top: 80 },
                xAxis: { type: "value", name: targetData.x_axis_label || "Target CRC Incidence Reduction (%)", nameLocation: "center", nameGap: 30 },
                yAxis: { type: "value", name: targetData.y_axis_label || "Required SEV Reduction (%)", nameLocation: "center", nameGap: 45 },
                tooltip: { trigger: "axis", formatter: (params) => { const [x, y] = params[0]?.data || []; if (x == null || y == null) return ""; return `<div style="text-align:left;"><strong>${targetData.factor_label}</strong><br/>Target CRC Incidence Reduction: <strong>${x}%</strong><br/>Required SEV Reduction: <strong>${y.toFixed(2)}%</strong></div>`; } },
                series: [
                    { name: "CRC ↓ vs SEV ↓", type: "line", smooth: true, data: dataset.map((d) => [d.x, d.y]), lineStyle: { color: "#5470c6", width: 2 }, symbol: "circle", symbolSize: 6, itemStyle: { color: "#5470c6" } },
                    { name: "Selected Point", type: "scatter", data: activePoint ? [[activePoint.x, activePoint.y]] : [], symbolSize: 12, itemStyle: { color: "red", borderColor: "#fff", borderWidth: 1 }, z: 10, label: activePoint ? { show: true, position: "top", formatter: `${activePoint.y.toFixed(2)}% SEV ↓` } : {} },
                    { type: "line", markLine: { symbol: "none", data: activePoint ? [{ xAxis: activePoint.x, label: { formatter: "Target", position: "end" } }] : [], lineStyle: { type: "dashed", color: "#333" } } },
                ],
            };
        }

        if (type === "quick_wins") {
            const dataset = (data || []).map((d) => ({ x: d.label, value: d.effect_estimate, ciLow: d.ci_lower, ciHigh: d.ci_upper }));
            return {
                title: { text: apiResponse.title || "", left: "center", top: -5 },
                legend: { top: 40, left: "center" },
                dataset: [{ source: dataset }],
                xAxis: { type: "category", encode: { x: "x" }, axisLabel: { rotate: 30, fontSize: 12 }, nameLocation: "center", nameGap: 55 },
                yAxis: { name: apiResponse.y_axis_label || "", nameRotate: 90, nameLocation: "center", nameGap: 55 },
                series: [
                    { type: "bar", name: "Coefficient", encode: { y: "value" }, itemStyle: { color: "#77bef7" } },
                    { type: "custom", name: "Confidence Intervals (95%)", itemStyle: { color: "#5470c6" }, renderItem: (_p, api) => { const xv = api.value(0); const hi = api.coord([xv, api.value(2)]); const lo = api.coord([xv, api.value(1)]); const hw = api.size([1, 0])[0] * 0.2; const s = api.style({ stroke: "#5470c6", lineWidth: 2 }); return { type: "group", children: [{ type: "line", shape: { x1: hi[0] - hw, y1: hi[1], x2: hi[0] + hw, y2: hi[1] }, style: s }, { type: "line", shape: { x1: hi[0], y1: hi[1], x2: lo[0], y2: lo[1] }, style: s }, { type: "line", shape: { x1: lo[0] - hw, y1: lo[1], x2: lo[0] + hw, y2: lo[1] }, style: s }] }; }, encode: { x: 0, y: [1, 2] }, data: dataset.map((d) => [d.x, d.ciLow, d.ciHigh]), z: 100 },
                ],
                tooltip: { trigger: "axis", formatter: (params) => { if (!params?.length) return ""; const cat = params[0].axisValue; const lines = params.map((p) => { const val = p.seriesName === "Confidence Intervals (95%)" ? `[${p.data[1].toFixed(2)}, ${p.data[2].toFixed(2)}]` : (p.data.value?.toFixed(2) ?? p.data); return `<div style="display:flex;align-items:center;margin:2px 0;"><span style="display:inline-block;width:10px;height:10px;background-color:${p.color};border-radius:50%;margin-right:5px;"></span>${p.seriesName}:&nbsp;<strong>${val}</strong></div>`; }).join(""); return `<div style="text-align:left;"><div style="font-weight:bold;margin-bottom:4px;">${apiResponse.title}<br>${cat}</div>${lines}</div>`; } },
            };
        }

        // exposure_weighted / effect_sev_unit
        const barsData = data.exclude_negative?.length ? data.exclude_negative : data.include_negative || [];
        const dataset = barsData.map((d) => ({ x: d.label, value: d.value, ciLow: d.ci_lower, ciHigh: d.ci_upper }));
        return {
            title: { text: apiResponse.title || "", left: "center" },
            legend: { top: 30, left: "center" },
            dataset: [{ source: dataset }],
            xAxis: { type: "category", encode: { x: "x" }, axisLabel: { rotate: 30, fontSize: 12 }, nameLocation: "center", nameGap: 55 },
            yAxis: { name: apiResponse.y_label || "", nameRotate: 90, nameLocation: "center", nameGap: 55 },
            series: [
                { type: "bar", name: "Coefficient", encode: { y: "value" }, itemStyle: { color: "#77bef7" } },
                { type: "custom", name: "Confidence Intervals (95%)", renderItem: (_p, api) => { const xv = api.value(0); const hi = api.coord([xv, api.value(2)]); const lo = api.coord([xv, api.value(1)]); const hw = api.size([1, 0])[0] * 0.2; const s = api.style({ stroke: "#5470c6", lineWidth: 2 }); return { type: "group", children: [{ type: "line", shape: { x1: hi[0] - hw, y1: hi[1], x2: hi[0] + hw, y2: hi[1] }, style: s }, { type: "line", shape: { x1: hi[0], y1: hi[1], x2: lo[0], y2: lo[1] }, style: s }, { type: "line", shape: { x1: lo[0] - hw, y1: lo[1], x2: lo[0] + hw, y2: lo[1] }, style: s }] }; }, encode: { x: 0, y: [1, 2] }, data: dataset.map((d) => [d.x, d.ciLow, d.ciHigh]), z: 100 },
            ],
            tooltip: { trigger: "axis", formatter: (params) => { const cat = params[0].axisValue; const lines = params.map((p) => { const val = p.seriesName === "Confidence Intervals (95%)" ? `[${p.data[1].toFixed(2)}, ${p.data[2].toFixed(2)}]` : (p.data.value?.toFixed(2) ?? p.data.predicted?.toFixed(2) ?? p.data); return `<div style="text-align:left;display:flex;align-items:center;margin:2px 0;"><span style="display:inline-block;width:10px;height:10px;background-color:${p.color};border-radius:50%;margin-right:5px;"></span>${p.seriesName}:&nbsp;<strong>${val}</strong></div>`; }).join(""); return `<div style="text-align:left;"><div style="font-weight:bold;margin-bottom:4px;">${apiResponse.title}<br>${cat}</div>${lines}</div>`; } },
        };
    };

    // ── accordion content ─────────────────────
    const regularAccordionItems = [
        {
            title: "Source",
            content: (
                <div style={{ height: "340px", overflow: "scroll" }}>
                    <p>
                        <li><strong>Source: </strong>Global Burden of Disease 2021.</li><br />
                        <li><strong>Years: </strong>Data from 1990 to 2021.</li><br />
                        <li><strong>Geographic Coverage: </strong>27 European countries</li><br />
                        <li><strong>CRC Incidence Rate: </strong>Number of new CRC cases diagnosed per 100,000 population in a year</li><br />
                        <li><strong>Sex Groups: </strong>Both Sexes (Aggregated data for males and females), Males (males only), and Females (females only)</li><br />
                    </p>
                </div>
            )
        },
        { title: "Summary Exposure Value (SEV)", content: (<p>Measure of a population's exposure to a risk factor that takes into account the extent of exposure by risk level and the severity of that risk's contribution to disease burden.</p>) },
        { title: "Year Lags", content: (<p>Year lags refer to the time interval between risk factor exposure and CRC incidence. Based on: Cai et al. 2024 (Public Health).</p>) },
        {
            title: "Methodology",
            content: (
                <p>
                    Generalized Additive Models (GAMs) trained across all countries, incorporating country as a categorical covariate to account for country-specific variations in SEV effects.<br /><br />
                    Time-lag analyses of 1, 3, 5 and 10 years between CRC Incidence and Risk Factors investigated potential downstream effects.<br /><br />
                    SEV for 1991 was correlated with CRC incidence for 1992, 1994, 1996 and 2001 and so on.<br /><br />
                    Negative coefficients may be related to a number of factors, e.g. the presence of confounding variables.
                </p>
            )
        },
        ...(biasContent.length > 0 ? [{ title: "Bias Assessment", content: (<ul>{biasContent.map((item, idx) => <li key={idx}>{item}</li>)}</ul>) }] : []),
    ];

    const twoFactorAccordionItems = [
        {
            title: "Source",
            content: (
                <div style={{ height: "340px", overflow: "scroll" }}>
                    <p>
                        <li><strong>Source: </strong>Global Burden of Disease 2021.</li><br />
                        <li><strong>Years: </strong>Data from 1990 to 2021.</li><br />
                        <li><strong>Geographic Coverage: </strong>27 European countries.</li><br />
                        <li><strong>CRC Incidence Rate: </strong>Number of new CRC cases diagnosed per 100,000 population in a year.</li><br />
                        <li><strong>Sex Groups: </strong>Both Sexes (Aggregated data for males and females), Males (males only), and Females (females only).</li><br />
                    </p>
                </div>
            )
        },
        { title: "Summary Exposure Value (SEV)", content: (<p>Measure of a population's exposure to a risk factor that takes into account the extent of exposure by risk level and the severity of that risk's contribution to disease burden. Year lags refer to the time interval between risk factor exposure and CRC incidence.</p>) },
        {
            title: "Methodology",
            content: (
                <p>
                    XGBoost (XGB) regression models trained across all 27 EU countries, incorporating country as a native categorical variable to capture country-specific baseline effects.
                    The best risk factor subset was selected by comparing three feature importance strategies i.e. permutation importance, tree gain importance, and Maximum Relevance Minimum Redundancy (MRMR), evaluated via time-series cross-validation, with the best-performing method chosen per horizon.
                    Time-lag analyses of 1, 3, 5 and 10 years between CRC incidence and risk factor SEVs investigated potential downstream effects.
                    For visualization purposes, only cross-category pairs were considered, combining one lifestyle and one dietary risk factor. Pairs with known biological redundancy or high collinearity were excluded.
                    The top 5 pairs per country and horizon were ranked by their estimated joint CRC incidence reduction at a standardised exposure reduction.
                </p>
            )
        },
    ];

    const activeAccordionItems = isTwoFactor ? twoFactorAccordionItems : regularAccordionItems;

    if (!isLoggedIn) return <h2>Unauthorized</h2>;

    return (
        <div className="container-fluid mt-5">
            <div className="row">

                {/* ── Left column ── */}
                <div className="col-2">
                    {/* Type selector — always visible */}
                    <div className="form-group mb-4">
                        <label style={{ fontWeight: "bold", margin: "0px 0px 5px 0px" }}>Type: </label>
                        <select
                            className="form-control"
                            value={type || ""}
                            onChange={(e) => {
                                const value = e.target.value;
                                setType(value);
                                const params = new URLSearchParams(location.search);
                                value ? params.set("tab", value) : params.delete("tab");
                                navigate(`${location.pathname}?${params.toString()}`, { replace: true });
                            }}
                        >
                            <option value="">Select type</option>
                            {typeOptions.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>

                    {/* two_factor controls */}
                    {isTwoFactor && (
                        <>
                            <div className="form-group mb-4">
                                <label style={{ fontWeight: "bold", margin: "0px 0px 5px 0px" }}>Horizon: </label>
                                <select className="form-control" value={tfHorizon} onChange={(e) => setTfHorizon(e.target.value)}>
                                    <option value="1">1 Year</option>
                                    <option value="3">3 Years</option>
                                    <option value="5">5 Years</option>
                                    <option value="10">10 Years</option>
                                </select>
                            </div>

                            <div className="form-group mb-4">
                                <label style={{ fontWeight: "bold", margin: "0px 0px 5px 0px" }}>Country: </label>
                                <select className="form-control" value={tfCountry} onChange={(e) => setTfCountry(e.target.value)}>
                                    {countries_strLst.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="form-group mb-4">
                                <label style={{ fontWeight: "bold", margin: "0px 0px 5px 0px" }}>Factor Pair: </label>
                                <select className="form-control" value={tfPairId || ""} onChange={(e) => setTfPairId(e.target.value)}>
                                    {tfPairs.map((p) => (
                                        <option key={p.pair_id} value={p.pair_id}>
                                            {capitalizeWords(p.factor_1.replace(/_/g, " "))} × {capitalizeWords(p.factor_2.replace(/_/g, " "))}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <p><strong>Two-Factor Joint Effect:</strong><br />Explore the combined impact of two risk factors on CRC incidence using a joint heatmap, showing how simultaneous reductions in exposure interact.</p>
                        </>
                    )}

                    {/* Regular controls */}
                    {!isTwoFactor && (
                        <>
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

                            {["sf_intervention", "sf_target", "exposure_weighted"].includes(type) && (
                                <div className="form-group mb-4">
                                    <label style={{ fontWeight: "bold", margin: "0px 0px 5px 0px" }}>Country: </label>
                                    <select className="form-control" value={country} onChange={(e) => setCountry(e.target.value)}>
                                        <option value="">Select country</option>
                                        {countries_strLst.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            )}

                            {["sf_intervention", "sf_target"].includes(type) && (
                                <div className="form-group mb-4">
                                    <label style={{ fontWeight: "bold", margin: "0px 0px 5px 0px" }}>Risk Factor:</label>
                                    <select className="form-control" value={riskFactor} onChange={(e) => setRiskFactor(e.target.value)}>
                                        <option value="">Select risk factor</option>
                                        {riskFactorsLst.map((rf) => <option key={rf.value} value={rf.value}>{rf.label}</option>)}
                                    </select>

                                    {type === "sf_target" && riskFactor && apiResponse?.data?.[riskFactor] && (
                                        <div style={{ marginTop: "1rem" }}>
                                            <label htmlFor="targetRange">% CRC ↓ Target: <strong>{selectedTarget}%</strong></label>
                                            <input id="targetRange" type="range" min={0} max={Math.floor(apiResponse.data[riskFactor].max_crc_reduction ?? 100)} step={1} value={selectedTarget} onChange={(e) => setSelectedTarget(Number(e.target.value))} style={{ width: "100%", cursor: "pointer" }} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {type === "sf_intervention" && riskFactor && apiResponse?.data?.[riskFactor]?.results && (
                                <div style={{ margin: "20px 0" }}>
                                    <label>Prediction at: {apiResponse.data[riskFactor].results[baselineShift]?.percent_reduction ?? 0}% SEV reduction</label>
                                    <input type="range" min={0} max={apiResponse.data[riskFactor].results.length - 1} step={1} value={baselineShift} onChange={(e) => setBaselineShift(Number(e.target.value))} style={{ width: "100%", cursor: "pointer" }} />
                                </div>
                            )}

                            {type === "effect_sev_unit" && <p><strong>Overview (Effect per SEV Unit):</strong><br />Compare which risk factors are most strongly associated with CRC at the European level, reflecting their potency per unit of exposure.</p>}
                            {type === "exposure_weighted" && <p><strong>Overview (Exposure-Weighted):</strong><br />Identify which risk factors are most associated with the selected country's CRC burden, combining both potency and population exposure levels.</p>}
                            {type === "quick_wins" && <p><strong>Quick Wins:</strong><br />Highlight the highest-return intervention points most associated with CRC incidence at the European level for further policy exploration.</p>}
                            {type === "sf_intervention" && <p><strong>Single-Factor Intervention:</strong> Quantify 'what-if' scenarios by estimating how reductions in a single risk factor's exposure are statistically associated with changes in future CRC cases in the selected country.</p>}
                        </>
                    )}
                </div>

                {/* ── Center column ── */}
                <div className="col-8">

                    {/* two_factor heatmap */}
                    {isTwoFactor && (
                        <>
                            {tfLoading && (
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "400px" }}>
                                    <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }} />
                                    <div style={{ marginTop: "1rem", fontWeight: "bold", fontSize: "1rem", color: "#333" }}>Loading...</div>
                                </div>
                            )}
                            {!tfLoading && tfHeatmap && (
                                <>
                                    <HeatmapEChart
                                        heatmap={tfHeatmap}
                                        country={tfCountry}
                                        horizon={tfHorizon}
                                        chartRef={tfChartRef}
                                        onChartRendered={(url) => setTfChartImageUrl(url)}
                                    />
                                    <div className="mt-3">
                                        <SaveGraphButton iframeUrl={{ url: tfChartImageUrl, params: getUriParams(), preview: tfChartImageUrl }} />
                                    </div>
                                </>
                            )}
                            {!tfLoading && !tfHeatmap && tfJson && (
                                <div className="alert alert-warning mt-3">No heatmap data available for this selection.</div>
                            )}
                        </>
                    )}

                    {/* Regular charts */}
                    {!isTwoFactor && (
                        <>
                            {!type && (
                                <div>
                                    <p>Through this tab, users can explore different aspects of the relationship between risk factor exposure and CRC incidence, at both the European and country level.</p>
                                    <p><strong>Note: </strong>All functionalities provide policy insights based on associations between risk factors and CRC incidence and consider time lags of 1, 3, 5, and 10 years between exposure and disease.</p>
                                    <p><strong>Disclaimer: </strong>These functionalities are based on observational GBD data and statistical models. Results reflect associations, not proven causal effects, and should be used to inform priority setting and expert-led planning.</p>
                                </div>
                            )}

                            {loading && (
                                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(255,255,255,0.7)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
                                    <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }} />
                                    <div style={{ marginTop: "1rem", fontWeight: "bold", fontSize: "1rem", color: "#333" }}>Loading...</div>
                                </div>
                            )}

                            {error && <p style={{ color: "red" }}>Error: {error}</p>}

                            {!loading && !error && !chartOptions.skipMessage && chartOptions.series && type !== "" && (
                                <ReactECharts ref={chartRef} option={chartOptions} style={{ height: "570px", width: "100%" }} />
                            )}

                            {chartOptions.skipMessage && (
                                <div className="m-auto" style={{ width: "100%", maxWidth: "600px" }} dangerouslySetInnerHTML={{ __html: chartOptions.skipMessage }} />
                            )}

                            {!chartOptions.skipMessage && type && (!["sf_intervention"].includes(type) || (type === "sf_intervention" && riskFactor)) && !loading && (
                                <div className="mt-3">
                                    <SaveGraphButton iframeUrl={{ url: getChartImageUrl(), params: getUriParams(), preview: chartImageUrl }} />
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ── Right column ── */}
                <div className="col-sm-2">
                    <Accordion defaultActiveKey="-1">
                        {activeAccordionItems.map((item, idx) => {
                            const isBiasAssessment = item.title === "Bias Assessment";
                            return (
                                <Accordion.Item eventKey={idx.toString()} key={idx}>
                                    <Accordion.Header
                                        onClick={(e) => {
                                            if (isBiasAssessment) {
                                                e.stopPropagation();
                                                e.preventDefault();
                                                handleAccordionModal("The following biases were detected in the data used for the CRC Predictive Analytics:", true);
                                            }
                                        }}
                                    >
                                        {item.title}
                                    </Accordion.Header>
                                    {!isBiasAssessment && <Accordion.Body className="text-start">{item.content}</Accordion.Body>}
                                </Accordion.Item>
                            );
                        })}
                    </Accordion>

                    <Comments />

                    <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                        <Modal.Header closeButton>
                            <Modal.Title>{modalTitle}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body style={{ maxHeight: "60vh", overflowY: "auto" }}>
                            {isBiasModal ? paginatedBiasContent() : modalContent}
                        </Modal.Body>
                    </Modal>
                </div>

            </div>
        </div>
    );
};

export default DeliPredictions;

import { useEffect, useMemo, useState, useRef } from "react";
import * as AuthService from "../services/auth.service.tsx";
import ReactECharts from "echarts-for-react";
import { Accordion } from 'react-bootstrap';
import Comments from "./Comments.tsx";
import SaveGraphButton from "./SaveGraphButton.tsx";
import { useLocation } from "react-router-dom";





// --------------------------------------------------
// TwoFactorHeatmapViewer (React + ECharts)
// --------------------------------------------------
// - Uses react-echarts / echarts-for-react
// - Faithful to Python matplotlib heatmap logic
// - Z_plot already oriented TOP -> BOTTOM (no inversion)
// --------------------------------------------------
const TwoFactorHeatmapViewer = () => {
  const [json, setJson] = useState(null);
  const [country, setCountry] = useState("Austria");
  const [pairId, setPairId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state
  const [chartOptions, setChartOptions] = useState({});
  const [chartImageUrl, setChartImageUrl] = useState<string>("");
  const chartRef = useRef<ReactECharts>(null);
  const [token, setToken] = useState(null);
  const [horizon, setHorizon] = useState("1");
  const [isRestored, setIsRestored] = useState(false);

  const location = useLocation();
  // console.log(location)

  const savedIframeUrl = location.state?.iframeUrl;
  // console.log(savedIframeUrl)

  useEffect(() => {
    setIsLoggedIn(AuthService.isLoggedIn());
  }, []);


  useEffect(() => {
    if (!savedIframeUrl) {
      setCountry("Austria");
      setHorizon("1");
      setIsRestored(true);
      return;
    }

    try {
      const parsed = JSON.parse(savedIframeUrl);
      const params = parsed.params;

      if (!params) return;

      setCountry(params.country);
      setHorizon(String(params.horizon));
      setPairId(params.pairId);

      setIsRestored(true); // ✅ IMPORTANT
    } catch (error) {
      console.error("Invalid savedIframeUrl format", error);
    }
  }, [savedIframeUrl]);






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

  // useEffect(() => {
  //   if (!location.search) return; // skip if no query params

  //   const params = new URLSearchParams(location.search);

  //   const h = params.get("horizon"); // e.g., "1Y"
  //   const c = params.get("country"); // e.g., "Austria"
  //   const p = params.get("pairId");  // optional

  //   // console.log(h)

  //   if (h) setHorizon(h);
  //   if (c) setCountry(c);
  //   if (p) setPairId(p);
  // }, [location.search]);



  // Load JSON
  // useEffect(() => {
  //   if (!isLoggedIn) return;

  //   setLoading(true);

  //   fetch("/two_factor_heatmaps_precomputed.json")
  //     .then(r => r.json())
  //     .then(j => {
  //       setJson(j);
  //       const h0 = j.meta.horizons[0];
  //       const c0 = Object.keys(j.data[h0])[0];
  //       const p0 = j.data[h0][c0].top_pairs_table?.[0]?.pair_id ?? null;

  //       setHorizon(h0);
  //       setCountry(c0);
  //       setPairId(p0);
  //     })
  //     .finally(() => setLoading(false));
  // }, [isLoggedIn]);
  // const didFetchRef = useRef(false);
  useEffect(() => {
    if (!isLoggedIn || !token || !horizon || !country || !isRestored) return;
    if (!token) return;

    const controller = new AbortController();

    const loadData = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `https://oncodir-datapi.catalink.eu/v1/deli/predictions` +
          `?type=two_factor_heatmaps` +
          `&prediction_horizon=${horizon}` +
          `&country=${country}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          }
        );

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const j = await res.json();
        setJson(j);

        const c0 = j.country;
        const p0 = j.top_pairs_table?.[0]?.pair_id ?? null;

        setCountry(c0);
        setPairId(p0);


      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("API error:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => controller.abort();
  }, [isLoggedIn, token, horizon, country, isRestored]);



  useEffect(() => {
    setChartImageUrl(""); // reset preview
  }, [horizon, country, pairId]);


  useEffect(() => {
    if (!json) return;
    setPairId(json.top_pairs_table?.[0]?.pair_id ?? null);
  }, [json]);




  const accordionContent_dictLst = [
    {
      title: 'Source',
      content: (<>
        <div style={{ height: '340px', overflow: 'scroll' }}>
          <p>
            <li><strong>Source: </strong>Global Burden of Disease 2021.
            </li><br />
            <li><strong>Years: </strong>Data from 1990 to 2021.
            </li><br />
            <li><strong>Geographic Coverage: </strong> 27 European countries.</li><br></br>
            <li><strong>CRC Incidence Rate: </strong>Number of new CRC cases diagnosed per 100,000 population in a year. </li><br />
            <li><strong>Sex Groups: </strong>Both Sexes (Aggregated data for males and females), Males (males only), and Females (females only).</li>
            <br />
          </p>
        </div>
      </>)
    },
    {
      title: 'Summary Exposure Value (SEV)',
      content: (<>
        <p>
          Measure of a population's exposure to a risk factor that takes into account the extent of exposure by risk level and the severity of that risk's contribution to disease burden.
          Year lags refer to the time interval between risk factor exposure and CRC incidence.
        </p>
      </>)
    },
    {
      title: 'Methodology',
      content: (<>
        <p>XGBoost (XGB) regression models trained across all 27 EU countries, incorporating country as a native categorical variable to capture country-specific baseline effects.
          The best risk factor subset was selected by comparing three feature importance strategies i.e. permutation importance, tree gain importance, and Maximum Relevance Minimum Redundancy (MRMR), evaluated via time-series cross-validation, with the best-performing method chosen per horizon.
          Time-lag analyses of 1, 3, 5 and 10 years between CRC incidence and risk factor SEVs investigated potential downstream effects.
          For visualization purposes, only cross-category pairs were considered, combining one lifestyle and one dietary risk factor. Pairs with known biological redundancy or high collinearity were excluded.
          The top 5 pairs per country and horizon were ranked by their estimated joint CRC incidence reduction at a standardised exposure reduction.</p>
      </>)
    },


  ];
  const getCurrentChartImageUrl = () => {
    if (!chartRef.current) return "";
    return chartRef.current.getEchartsInstance().getDataURL({
      type: "webp",
      pixelRatio: 2,
      backgroundColor: "#fff",
    });
  };
  const getUriParams = () => {
    const params: Record<string, string> = {};

    if (country) params.country = country;
    if (horizon) params.horizon = horizon;
    if (pairId) params.pairId = pairId;

    // console.log(params)

    return params;
  };
  const countries = [
    "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus",
    "Czechia", "Denmark", "Estonia", "Finland", "France",
    "Germany", "Greece", "Hungary", "Ireland", "Italy",
    "Latvia", "Lithuania", "Luxembourg", "Malta", "Netherlands",
    "Poland", "Portugal", "Romania", "Slovakia", "Slovenia",
    "Spain", "Sweden"
  ];


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

  // const countries = useMemo(() => {
  //   if (!json) return [];
  //   return [json.country];
  // }, [json]);

  const pairs = useMemo(() => {
    if (!json) return [];
    return json.top_pairs_table || [];
  }, [json]);

  const heatmap = useMemo(() => {
    if (!json || !pairId) return null;
    return json.heatmaps.find(h => h.pair_id === pairId);
  }, [json, pairId]);


  const capitalizeWords = (str) =>
    str.replace(/\b\w/g, (char) => char.toUpperCase());

  if (!isLoggedIn) return <h2 className="text-center mt-5">Unauthorized</h2>;

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '12px' }}>
        <div className="spinner" aria-label="Loading" />
        <span style={{ fontSize: '14px', color: 'var(--text-muted, #475569)', fontWeight: 500 }}>Loading data…</span>
      </div>
    );
  }

  if (!json) return <div className="p-4 text-center" style={{ color: 'var(--text-muted, #475569)' }}>Something went wrong. Please try again.</div>;

  return (
    <>
      <style>{`
        .tf-page { padding: 24px 0 40px; }

        .tf-header { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border, #e5e7eb); }
        .tf-header h1 { font-size: 20px; font-weight: 800; color: var(--text, #0f172a); margin: 0 0 3px; }
        .tf-header p { font-size: 13px; color: var(--text-muted, #475569); margin: 0; }

        .tf-sidebar-card {
          background: var(--bg, #fff);
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 14px;
          padding: 18px 16px;
          margin-bottom: 12px;
        }
        .tf-sidebar-card .filter-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-muted, #475569);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 8px;
        }
        .tf-select {
          width: 100%;
          font-size: 13px;
          padding: 7px 10px;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 8px;
          background: var(--bg, #fff);
          color: var(--text, #0f172a);
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23475569' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          cursor: pointer;
        }
        .tf-select:focus { outline: none; border-color: var(--brand, #1f6580); box-shadow: 0 0 0 3px rgba(31,101,128,0.15); }

        .tf-chart-wrapper {
          position: relative;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 14px;
          overflow: hidden;
          background: #fff;
          min-height: 600px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .tf-chart-inner { width: 100%; padding: 8px; }
        .tf-empty-state { text-align: center; padding: 60px 24px; }
        .tf-empty-title { font-size: 15px; font-weight: 600; color: var(--text, #0f172a); margin: 12px 0 6px; }
        .tf-empty-sub { font-size: 13px; color: var(--text-muted, #475569); margin: 0; }
        .tf-empty-icon { color: var(--text-muted, #475569); }

        @media (prefers-reduced-motion: reduce) {
          .tf-chart-wrapper { transition: none; }
        }
      `}</style>

      <div className="container-fluid tf-page">

        <div className="tf-header">
          <h1>Two-Factor Exploration</h1>
          <p>Joint CRC incidence reduction heatmaps for top risk factor pairs · XGBoost predictions · GBD 2021</p>
        </div>

        <div className="row g-3">

          {/* ── Left sidebar ── */}
          <div className="col-xl-2 col-lg-3">
            <div className="tf-sidebar-card">
              <span className="filter-label">Prediction Horizon</span>
              <select className="tf-select" value={horizon} onChange={e => setHorizon(e.target.value)}>
                <option value="1">1 Year</option>
                <option value="3">3 Years</option>
                <option value="5">5 Years</option>
                <option value="10">10 Years</option>
              </select>
            </div>
            <div className="tf-sidebar-card">
              <span className="filter-label">Country</span>
              <select className="tf-select" value={country} onChange={e => setCountry(e.target.value)}>
                {countries.map(c => (
                  <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
            <div className="tf-sidebar-card">
              <span className="filter-label">Risk Factor Pair</span>
              <select className="tf-select" value={pairId} onChange={e => setPairId(e.target.value)}>
                {pairs.map(p => (
                  <option key={p.pair_id} value={p.pair_id}>
                    {capitalizeWords(p.factor_1.replace(/_/g, " "))} &times; {capitalizeWords(p.factor_2.replace(/_/g, " "))}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Center heatmap ── */}
          <div className="col-xl-8 col-lg-6">
            <div className="tf-chart-wrapper">
              {heatmap ? (
                <div className="tf-chart-inner">
                  <HeatmapEChart
                    heatmap={heatmap}
                    country={country}
                    horizon={horizon}
                    chartRef={chartRef}
                    onChartRendered={(url) => setChartImageUrl(url)}
                  />
                </div>
              ) : (
                <div className="tf-empty-state">
                  <div className="tf-empty-icon" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
                    </svg>
                  </div>
                  <p className="tf-empty-title">No heatmap available</p>
                  <p className="tf-empty-sub">Select a country and horizon to load factor pair data.</p>
                </div>
              )}
            </div>
            {heatmap && (
              <div className="mt-3">
                <SaveGraphButton iframeUrl={{ url: chartImageUrl, params: getUriParams(), preview: chartImageUrl }} />
              </div>
            )}
          </div>

          {/* ── Right: accordion + comments ── */}
          <div className="col-xl-2 col-lg-3">
            <Accordion defaultActiveKey="-1" className="app-accordion">
              {accordionContent_dictLst.map((item, idx) => (
                <Accordion.Item eventKey={idx.toString()} key={idx}>
                  <Accordion.Header>{item.title}</Accordion.Header>
                  <Accordion.Body className="text-start">{item.content}</Accordion.Body>
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

// --------------------------------------------------
// ECharts heatmap
// --------------------------------------------------
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

  const capitalizeWords = (str) =>
    str.replace(/\b\w/g, (char) => char.toUpperCase());

  const formatHorizon = (h) => {
    const n = h.replace("Y", "");
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
      borderColor: "#000",      // ✅ black border
      borderWidth: 1,
      textStyle: {
        color: "#000",
        fontSize: 12,
      },
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
      textStyle: {
        fontSize: 12,
        color: "#333",
        fontWeight: 500,
      },
      formatter: (value) => `${value.toFixed(2)}%`,
      inRange: {
        color: ["#440154", "#3b528b", "#21918c", "#5ec962", "#fde725"],
      },
    },
    graphic: {
      elements: [
        {
          type: "text",
          right: 6,                // close to visualMap
          top: "middle",
          rotation: -Math.PI / 2,
          z: 100,                  // VERY IMPORTANT
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
            shadowColor: "rgba(0,0,0,0.3)"
          }
        }
      },
    ]
  };

  return (
    <ReactECharts
      ref={chartRef}
      option={option}
      notMerge
      lazyUpdate={false}
      style={{ height: 600, width: "100%" }}
      onChartReady={() => {
        // Force capture after chart fully renders
        setTimeout(() => {
          const instance = chartRef.current?.getEchartsInstance();
          if (!instance) return;
          const url = instance.getDataURL({
            type: "webp",
            pixelRatio: 2,
            backgroundColor: "#fff",
          });
          onChartRendered(url);
        }, 500); // 500ms usually enough for first render
      }}
    />
  );
}


export default TwoFactorHeatmapViewer;


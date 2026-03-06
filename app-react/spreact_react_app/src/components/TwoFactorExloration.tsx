import { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import * as AuthService from "../services/auth.service.tsx";
import ReactECharts from "echarts-for-react";
import { Accordion, Modal, Button, Card, Form, Row, Col } from 'react-bootstrap';
import Comments from "./Comments.tsx";
import SaveGraphButton from "./SaveGraphButton.tsx";
import { useLocation, useNavigate } from "react-router-dom";





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

  if (!isLoggedIn) {
    return <h2>Unauthorized</h2>;
  }

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" />
        <div className="fw-bold mt-2">Loading...</div>
      </div>
    );
  }
  if (!json) return <div className="p-4">Something went wrong. Please try again !</div>;

  return (

    <div className="row mt-5">
      {/* Horizon */}
      <div className="col-2">
        <label className="fw-bold mb-1">Select Horizon</label>
        <select
          className="form-select"
          value={horizon}
          onChange={e => setHorizon(e.target.value)}
        >
          <option value="1">1 Year</option>
          <option value="3">3 Years</option>
          <option value="5">5 Years</option>
          <option value="10">10 Years</option>
        </select>


        {/* Country */}
        <label className="fw-bold mb-1">Select Country</label>
        <select
          className="form-select"
          value={country}
          onChange={e => setCountry(e.target.value)}
        >
          {countries.map(c => (
            <option key={c} value={c}>
              {c.replace(/_/g, " ")}
            </option>
          ))}
        </select>


        {/* Factor Pair */}
        <label className="fw-bold mb-1">Select Pair</label>
        <select
          className="form-select"
          value={pairId}
          onChange={e => setPairId(e.target.value)}
        >
          {pairs.map(p => (
            <option key={p.pair_id} value={p.pair_id}>
              {capitalizeWords(p.factor_1.replace(/_/g, " "))} × {capitalizeWords(p.factor_2.replace(/_/g, " "))}
            </option>
          ))}
        </select>
      </div>

      {/* Heatmap */}

      <div className="col-8">

        {/* 👉 LOADING */}
        {/* {loading && (
          <div className="text-center mt-5">
            <div className="spinner-border text-primary" />
            <div className="fw-bold mt-2">Loading...</div>
          </div>
        )} */}
        {heatmap && (
          <>
            <HeatmapEChart
              heatmap={heatmap}
              country={country}
              horizon={horizon}
              chartRef={chartRef}
              onChartRendered={(url) => setChartImageUrl(url)} // update only after render
            />

            <SaveGraphButton
              iframeUrl={{
                url: chartImageUrl, // ✅ always fetch the latest chart
                params: getUriParams(),
                preview: chartImageUrl, // updated dynamically
              }}
            />
          </>
        )}
      </div>
      <div className="col-2">
        <div>
          <Accordion defaultActiveKey="-1">
            {accordionContent_dictLst.map((item, idx) => (
              <Accordion.Item eventKey={idx.toString()} key={idx}>
                <Accordion.Header>{item.title}</Accordion.Header>
                <Accordion.Body className="text-start" style={{ height: "340px", overflow: "scroll" }}>
                  {item.content}
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>

          <Comments />
        </div>
      </div>
    </div>


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
            borderColor: "#000",  // ✅ black border
            borderWidth: 1.5,     // thickness
          },
        },
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


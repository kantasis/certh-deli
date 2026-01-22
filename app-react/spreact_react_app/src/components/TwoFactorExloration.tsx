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
  const [horizon, setHorizon] = useState(null);
  const [country, setCountry] = useState(null);
  const [pairId, setPairId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state
  const [chartOptions, setChartOptions] = useState({});
  const [chartImageUrl, setChartImageUrl] = useState<string>("");
  const chartRef = useRef<ReactECharts>(null);



  const location = useLocation();


  const savedIframeUrl = location.state?.iframeUrl;


  useEffect(() => {
    setIsLoggedIn(AuthService.isLoggedIn());
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
    const params = new URLSearchParams(location.search);

    const h = params.get("horizon");
    const c = params.get("country");
    const p = params.get("pairId");

    if (h) setHorizon(h);
    if (c) setCountry(c);
    if (p) setPairId(p);
  }, []);



  // Load JSON
  useEffect(() => {
    if (!isLoggedIn) return;

    setLoading(true);

    fetch("/two_factor_heatmaps_precomputed.json")
      .then(r => r.json())
      .then(j => {
        setJson(j);
        const h0 = j.meta.horizons[0];
        const c0 = Object.keys(j.data[h0])[0];
        const p0 = j.data[h0][c0].top_pairs_table?.[0]?.pair_id ?? null;

        setHorizon(h0);
        setCountry(c0);
        setPairId(p0);
      })
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  useEffect(() => {
    setChartImageUrl(""); // reset preview
  }, [horizon, country, pairId]);


  useEffect(() => {
    if (!json || !horizon) return;

    const availableCountries = Object.keys(json.data[horizon]);

    // Keep country if it still exists
    const nextCountry = availableCountries.includes(country)
      ? country
      : availableCountries[0];

    const nextPair =
      json.data[horizon][nextCountry].top_pairs_table?.[0]?.pair_id ?? null;

    setCountry(nextCountry);
    setPairId(nextPair);
  }, [horizon, json]);


  useEffect(() => {
    if (!json || !horizon || !country) return;

    const nextPair =
      json.data[horizon][country].top_pairs_table?.[0]?.pair_id ?? null;

    setPairId(nextPair);
  }, [country, horizon, json]);




  const accordionContent_dictLst = [
    {
      title: 'Data Sources',
      content: (<>
        <div style={{ height: '340px', overflow: 'scroll' }}>
          <p>
            <li><strong>Source: </strong> ONCODIR’s project prospective data, collected through the NELI mobile application (T4.2) during the Living Lab Integration Test (LIT-02).
              LIT-02 was designed as a technology acceptance study conducted with external citizens to evaluate both the technical functionality of NELI and its capacity for reliable data collection.
            </li><br />
            <li><strong>Data collection: </strong>Preparations for citizen enrollment began in September 2024, and the main study period ran from October to December 2024.
              By late November 2024, 46 participants were enrolled, exceeding the target of 40, with distribution across countries as follows: 40 in Greece, 3 in Lithuania, 1 in Luxembourg, and 2 in Romania. Only Greek participants were used in this analysis.
            </li><br />
            <li><strong>Variables: </strong> The dataset includes both <strong>static variables</strong>, obtained from initial questionnaires, and <strong>non-static variables</strong>, collected bi-weekly.<br></br>
              <strong>  •	Static variables</strong> cover demographics (e.g., age, biological sex, BMI, ethnicity, country), lifestyle choices (e.g., smoking, daily activity), socioeconomic status (e.g., employment/occupational status, living area, type of housing), education level (e.g., primary education) and clinical history (e.g., family history of CRC, metabolic syndromes).<br></br>
              <strong>  •	Non-static variables</strong> include nutritional habits (e.g., frequency and portion size of red meat, vegetables, and fruits), and CRC risk assessment scores (evaluated using the <strong>Risk-Stratification Engine</strong>, <strong>PYRAMID</strong>).

            </li><br />


          </p>
        </div>

      </>)
    },
    {
      title: 'Methodology',
      content: (<>
        <p>
          <strong>Preprocessing</strong><br></br>

          <strong>Daily Nutritional Intake transformation</strong><br></br><br></br>
          Nutritional habits, assessed by consumption frequency and portion size, were standardized as grams per day for analysis, following the recommendations and feedback from ONCODIR’s WP2 (led by INCLIVA).<br></br>
          Categorical frequencies were converted to daily servings using a predefined mapping, with weekly and monthly intakes scaled to daily equivalents. Portion sizes were standardized across food and beverage types (e.g., alcoholic beverages: volume in mL converted to grams of ethanol).<br></br>
          Daily intake was calculated as: quantity per day = daily frequency × portion size (quantity).<br></br><br></br>

          <strong>Categorization of Daily Nutritional Intake</strong><br></br><br></br>
          To improve interpretability for non-clinical users, daily nutritional intake (quantity per day) was categorized into meaningful intake groups: Low, Standard, High consumption. Thresholds were defined with input from ONCODIR’s nutritional specialist partner, FoodOxys, guided by public dietary recommendations. Specifically, guidance from the World Health Organization (WHO) [1], the Food and Agriculture Organization of the United Nations (FAO) [2], the U.S. Department of Health and Human Services (HHS) and U.S. Department of Agriculture (USDA) [3], the EAT–Lancet Commission [4], the National Health Service (NHS) [5], and Mediterranean dietary models such as the Global Mediterranean Health (GMH) [6] index was used to establish quantitative cut-offs for each food group.<br></br><br></br>
          These references provide evidence-based intake ranges for major dietary components (e.g., fruits, vegetables, legumes, wholegrains, dairy, and animal products), ensuring that the categorization reflects both public health targets and current scientific consensus on diet quality and chronic disease prevention.<br></br><br></br>
          <strong>Transformation of the monthly aggregation of non-static variables</strong><br></br><br></br>
          Non-static variables collected bi-weekly were aggregated into monthly measurements to ensure a more comparable temporal scale. For each participant, the median value of each non-static variable within a given month was computed, as all non-static variables are categorical.
          <br></br><br></br>
          <strong>Aggregation</strong><br></br><br></br>
          Following preprocessing, both static and non-static variables were aggregated to reflect the overall representation and distribution of the collected variables within the Greek study population. For numerical variables, descriptive statistics were calculated, including the mean, median, standard deviation, minimum, and maximum values. For categorical variables, aggregation was performed by computing the frequency and the percentage of total responses within each category. This analysis was conducted for both the bi- weekly and monthly measurements of the non-static variables.

        </p>
      </>)
    },
    {
      title: 'References',
      content: (<>
        <p>
          1.	Food and Agriculture Organization of the United Nations, & World Health Organization. (2019). Sustainable healthy diets – Guiding principles.<br></br><br></br>
          2.	Food and Agriculture Organization of the United Nations. (2016). Plates, pyramids and planets: Developments in national healthy and sustainable dietary guidelines.<br></br><br></br>
          3.	U.S. Department of Health and Human Services (HHS), & U.S. Department of Agriculture (USDA). (2025). Scientific report of the 2025 Dietary Guidelines Advisory Committee. Washington, DC: HHS and USDA.<br></br><br></br>
          4.	Willett Walter et al., (2019). Food in the Anthropocene: The EAT–Lancet Commission on healthy diets from sustainable food systems. The Lancet, 393(10170), 447–492.<br></br><br></br>
          5.	National Health Service (NHS). (2018). The Eatwell Guide. London: Public Health England.<br></br><br></br>
          6.	Trichopoulou, A., Martínez-González, M.A., Tong, T.Y. et al. Definitions and potential health benefits of the Mediterranean diet: views from experts around the world. BMC Med 12, 112 (2014). https://doi.org/10.1186/1741-7015-12-112.<br></br><br></br>
        </p>
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


  const countries = useMemo(() => {

    if (!json || !horizon) return [];

    return Object.keys(json.data[horizon]);

  }, [json, horizon]);

  const pairs = useMemo(() => {

    if (!json || !horizon || !country) return [];

    return json.data[horizon][country].top_pairs_table || [];
  }, [json, horizon, country]);

  const heatmap = useMemo(() => {

    if (!json || !horizon || !country || !pairId) return null;

    return json.data[horizon][country].heatmaps.find(
      (h) => h.pair_id === pairId
    );
  }, [json, horizon, country, pairId]);


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
          {json.meta.horizons.map(h => (
            <option key={h} value={h}>
              {h.endsWith("Y") ? `${h.slice(0, -1)} ${h === "1Y" ? "Year" : "Years"}` : h}
            </option>
          ))}
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
                url: getCurrentChartImageUrl(), // ✅ always fetch the latest chart
                params: getUriParams(),
                preview: getCurrentChartImageUrl(), // updated dynamically
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

  const formatHorizon = (h) =>
    h.endsWith("Y") ? `${h.slice(0, -1)} ${h === "1Y" ? "Year" : "Years"}` : h;

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
      name: friendlyFactor2,
      nameLocation: "middle",
      nameGap: 50,
      data: xGrid.map((v) => `${(v * 100).toFixed(1)}%`),
      axisLabel: { rotate: 45 },
    },
    yAxis: {
      type: "category",
      name: friendlyFactor1,
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
      right: 20,
      top: "middle",
      itemHeight: 220,
      itemWidth: 14,
      calculable: true,

      text: ["Higher risk", "Lower risk"],
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
      notMerge={true}       // replaces the old option completely
      lazyUpdate={false}    // forces immediate chart update
      style={{ height: 600, width: "100%" }}
      onChartReady={() => {
        if (!chartRef.current) return;
        const url = chartRef.current.getEchartsInstance().getDataURL({
          type: "webp",
          pixelRatio: 3,
          backgroundColor: "#fff",
        });
        onChartRendered(url); // ✅ image only after chart fully rendered
      }}
    />
  );
}


export default TwoFactorHeatmapViewer;


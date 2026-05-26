import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service.tsx";
import CountryFilter from "./CountryFilter.tsx";
import YearFilter from "./YearFilter.tsx";
import { Accordion } from "react-bootstrap";
import SexFilter from "./SexFilter.tsx";
import AgeFilter from "./AgeFilter.tsx";
import CrcFactorsFilter from "./CrcFactorsFilter.tsx";
import Comments from "./Comments.tsx";
import { useLocation } from "react-router-dom";
import SaveGraphButton from "./SaveGraphButton.tsx";

const grafana_host = import.meta.env.VITE_GRAFANA_HOST;
const grafana_port = import.meta.env.VITE_GRAFANA_PORT;
const grafana_path = import.meta.env.VITE_GRAFANA_PATH;
const dashboard_name = import.meta.env.VITE_GRAFANA_DASHBOARD;

const panel_id = 1;
const grafana_url = `${window.location.protocol}//${grafana_host}:${grafana_port}/${grafana_path}/${dashboard_name}?panelId=${panel_id}&orgId=1&theme=light`;

const sex_dictLst = [
   { value: 0, label: "Both Sexes", var_filter: "Both" },
   { value: 1, label: "Male", var_filter: "Male" },
   { value: 2, label: "Female", var_filter: "Female" },
];

const age_dictLst = [
   { value: 0, label: "Age Standardized Rate (ASR)", var_filter: "Age-standardized" },
   { value: 1, label: "Under 25", var_filter: "Under 25" },
   { value: 2, label: "25 to 50", var_filter: "25 to 50" },
   { value: 3, label: "Above 50", var_filter: "Above 50" },
];

const crcFactors_dictLst = [
   { value: 0, label: "Incidence", var_filter: "CRC_incidence_val_Rate" },
   { value: 1, label: "DALYs", var_filter: "Colon and rectum cancer_Rate_DALYs_val" },
   { value: 2, label: "YLDs", var_filter: "Colon and rectum cancer_Rate_YLDs_val" },
   { value: 3, label: "YLLs", var_filter: "Colon and rectum cancer_Rate_YLLs_val" },
];

const accordionContent_dictLst = [
   {
      title: "Data Sources",
      content: (
         <div style={{ maxHeight: "340px", overflowY: "auto" }}>
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
         </div>
      ),
   },
   {
      title: "Incidence",
      content: <p>Number of new CRC cases diagnosed per 100,000 population</p>,
   },
   {
      title: "Disability adjusted life years (DALYs)",
      content: <p>Number of DALYs in the population per 100,000.</p>,
   },
   {
      title: "Years of life lost (YLLs)",
      content: <p>Number of YLLs in the population per 100,000</p>,
   },
   {
      title: "Years lived with disability (YLDs)",
      content: <p>Number of YLDs in the population per 100,000</p>,
   },
];

const EpidimiologicalPanel: React.FC = () => {
   const location = useLocation();
   const savedIframeUrl = location.state?.iframeUrl;

   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [iframeLoading, setIframeLoading] = useState(true);
   const [selectedCountries_lst, set_selectedCountries] = useState(["Belgium", "Greece", "Italy"]);
   const [minYear_int, set_minYear] = useState(0);
   const [maxYear_int, set_maxYear] = useState(0);
   const [selectedSex_int, set_selectedSex] = useState<number | null>(0);
   const [selectedAge_int, set_selectedAge] = useState(0);
   const [selectedCrcFactors_int, set_selectedCrcFactors] = useState(0);

   useEffect(() => {
      setIsLoggedIn(AuthService.isLoggedIn());
   }, []);

   useEffect(() => {
      if (!savedIframeUrl) return;
      const url = new URL(savedIframeUrl);
      const params = new URLSearchParams(url.search);
      const countryFilters = params.getAll("var-country_filter");
      const minYear = parseInt(params.get("var-minyear_filter") || "0");
      const maxYear = parseInt(params.get("var-maxyear_filter") || "0");
      const sexParam = params.get("var-sex_filter");
      const ageParam = params.get("var-age_filter");
      const factorParam = params.get("var-crcFactor_filter");
      set_selectedCountries(countryFilters);
      set_minYear(minYear);
      set_maxYear(maxYear);
      set_selectedSex(sex_dictLst.findIndex((s) => s.var_filter === sexParam));
      set_selectedAge(age_dictLst.findIndex((a) => a.var_filter === ageParam));
      set_selectedCrcFactors(crcFactors_dictLst.findIndex((f) => f.var_filter === factorParam));
   }, [savedIframeUrl]);

   const getUriParams = () => {
      const countryFilter_str = selectedCountries_lst.map((c) => `var-country_filter=${c}`).join("&");
      const yearFilter_str = `var-minyear_filter=${minYear_int}&var-maxyear_filter=${maxYear_int}`;
      const selectedSex_str = sex_dictLst[selectedSex_int ?? 0]?.var_filter ?? "Both";
      const selectedAge_str = age_dictLst[selectedAge_int]?.var_filter ?? "Age-standardized";
      const selectedCrcFactor_str = crcFactors_dictLst[selectedCrcFactors_int]?.var_filter ?? crcFactors_dictLst[0].var_filter;
      return `${countryFilter_str}&${yearFilter_str}&var-sex_filter=${selectedSex_str}&var-age_filter=${selectedAge_str}&var-crcFactor_filter=${selectedCrcFactor_str}`;
   };

   const iFrame_url = `${grafana_url}&${getUriParams()}`;

   if (!isLoggedIn) return <h2 className="text-center mt-5">Unauthorized</h2>;

   return (
      <>
         <style>{`
            .ep-page { padding: 24px 0 40px; }
            .ep-header { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border, #e5e7eb); }
            .ep-header h1 { font-size: 22px; font-weight: 800; color: var(--text, #0f172a); margin: 0 0 3px; }
            .ep-header p { font-size: 14px; color: var(--text-muted, #475569); margin: 0; }
            .ep-filter-section { margin-bottom: 18px; }
            .ep-filter-section + .ep-filter-section { padding-top: 16px; border-top: 1px solid var(--border, #e5e7eb); }
            .ep-iframe-wrapper {
               position: relative;
               border: 1px solid var(--border, #e5e7eb);
               border-radius: 14px;
               overflow: hidden;
               background: #fff;
               min-height: 600px;
            }
            .ep-iframe-loading {
               position: absolute; inset: 0;
               display: flex; flex-direction: column; align-items: center; justify-content: center;
               background: #fff;
               z-index: 2;
               gap: 12px;
               transition: opacity 0.3s ease;
            }
            .ep-iframe-loading.hidden { opacity: 0; pointer-events: none; }
            .ep-iframe-loading span { font-size: 14px; color: var(--text-muted, #475569); font-weight: 500; }
            .ep-iframe { display: block; border: none; width: 100%; height: 600px; }
            .ep-sidebar-card {
               background: var(--bg, #fff);
               border: 1px solid var(--border, #e5e7eb);
               border-radius: 14px;
               padding: 18px 16px;
               margin-bottom: 12px;
            }
            .ep-sidebar-card .filter-label { margin-bottom: 10px; }
         `}</style>

         <div className="container-fluid ep-page">

            {/* Page header */}
            <div className="ep-header">
               <h1>CRC Incidence</h1>
               <p>Incidence patterns by age, sex, country, and year.</p>
            </div>

            <div className="row g-3">

               {/* ── Left filter sidebar ── */}
               <div className="col-xl-2 col-lg-3">

                  <div className="ep-sidebar-card ep-filter-section">
                     <span className="filter-label">Countries</span>
                     <CountryFilter
                        selectedCountries_lst={selectedCountries_lst}
                        set_selectedCountries={set_selectedCountries}
                     />
                  </div>

                  <div className="ep-sidebar-card ep-filter-section">
                     <span className="filter-label">Year range</span>
                     <YearFilter
                        minYear_int={minYear_int}
                        set_minYear={set_minYear}
                        maxYear_int={maxYear_int}
                        set_maxYear={set_maxYear}
                     />
                  </div>

                  <div className="ep-sidebar-card" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                     <CrcFactorsFilter
                        selectedCrcFactor_int={selectedCrcFactors_int}
                        set_selectedCrcFactor={set_selectedCrcFactors}
                        crcFactor_dictLst={crcFactors_dictLst}
                     />
                     <SexFilter
                        selectedSex_int={selectedSex_int}
                        set_selectedSex={set_selectedSex}
                        sex_dictLst={sex_dictLst}
                     />
                     <AgeFilter
                        selectedAge_int={selectedAge_int}
                        set_selectedAge={set_selectedAge}
                        age_dictLst={age_dictLst}
                     />
                  </div>

               </div>

               {/* ── Center: chart iframe ── */}
               <div className="col-xl-8 col-lg-6">
                  <div className="ep-iframe-wrapper">
                     {iframeLoading && (
                        <div className="ep-iframe-loading">
                           <div className="spinner" aria-label="Loading chart" />
                           <span>Loading chart…</span>
                        </div>
                     )}
                     <iframe
                        id="embeddedPanel_id"
                        className="ep-iframe"
                        src={iFrame_url}
                        title="CRC Incidence chart"
                        onLoad={() => setIframeLoading(false)}
                     />
                  </div>
                  <div className="mt-3">
                     <SaveGraphButton iframeUrl={{ url: iFrame_url }} />
                  </div>
               </div>

               {/* ── Right: glossary + comments ── */}
               <div className="col-xl-2 col-lg-3">
                  <Accordion defaultActiveKey="-1" className="app-accordion" style={{ marginBottom: "16px" }}>
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

export default EpidimiologicalPanel;

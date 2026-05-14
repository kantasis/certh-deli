import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service.tsx";
import CountryFilter from "./CountryFilter.tsx";
import YearFilter from "./YearFilter.tsx";
import FactorFilter from "./FactorFilter.tsx";
import Glossary from "./Glossary.tsx";
import SaveGraphButton from "./SaveGraphButton.tsx";

const grafana_host = import.meta.env.VITE_GRAFANA_HOST;
const grafana_port = import.meta.env.VITE_GRAFANA_PORT;
const grafana_path = import.meta.env.VITE_GRAFANA_PATH;
const dashboard_name = import.meta.env.VITE_GRAFANA_DASHBOARD;

const panel_id = 3;
const grafana_url = `${window.location.protocol}//${grafana_host}:${grafana_port}/${grafana_path}/${dashboard_name}?panelId=${panel_id}&orgId=1&theme=light`;

const LifestylePanel: React.FC = () => {
   const [isLoggedIn, setIsLoggedIn] = useState(false);
   const [iframeLoading, setIframeLoading] = useState(true);
   const [selectedCountries_lst, set_selectedCountries] = useState(["Greece", "Romania", "Lithuania"]);
   const [selectedFactor_str, set_selectedFactor] = useState('');
   const [minYear_int, set_minYear] = useState(0);
   const [maxYear_int, set_maxYear] = useState(0);

   useEffect(() => {
      setIsLoggedIn(AuthService.isLoggedIn());
   }, []);

   const getUriParams = () => {
      const countryFilter_str = selectedCountries_lst.map(c => `var-country_filter=${c}`).join('&');
      const yearFilter_str = `var-minyear_filter=${minYear_int}&var-maxyear_filter=${maxYear_int}`;
      const factorFilter_str = `var-factor_filter=${selectedFactor_str}`;
      return `${countryFilter_str}&${yearFilter_str}&${factorFilter_str}`;
   };

   const iFrame_url = `${grafana_url}&${getUriParams()}`;

   if (!isLoggedIn) return <h2 className="text-center mt-5">Unauthorized</h2>;

   return (
      <>
         <style>{`
            .lp-page { padding: 24px 0 40px; }
            .lp-header { margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border, #e5e7eb); }
            .lp-header h1 { font-size: 22px; font-weight: 800; color: var(--text, #0f172a); margin: 0 0 3px; }
            .lp-header p { font-size: 14px; color: var(--text-muted, #475569); margin: 0; }
            .lp-sidebar-card {
               background: var(--bg, #fff);
               border: 1px solid var(--border, #e5e7eb);
               border-radius: 14px;
               padding: 18px 16px;
               margin-bottom: 12px;
            }
            .lp-iframe-wrapper {
               position: relative;
               border: 1px solid var(--border, #e5e7eb);
               border-radius: 14px;
               overflow: hidden;
               background: #fff;
               min-height: 600px;
            }
            .lp-iframe-loading {
               position: absolute; inset: 0;
               display: flex; flex-direction: column; align-items: center; justify-content: center;
               background: #fff; z-index: 2; gap: 12px; transition: opacity 0.3s ease;
            }
            .lp-iframe-loading.hidden { opacity: 0; pointer-events: none; }
            .lp-iframe-loading span { font-size: 14px; color: var(--text-muted, #475569); font-weight: 500; }
            .lp-iframe { display: block; border: none; width: 100%; height: 600px; }
            @media (prefers-reduced-motion: reduce) { .lp-iframe-loading { transition: none; } }
         `}</style>

         <div className="container-fluid lp-page">

            <div className="lp-header">
               <h1>Lifestyle Risk Factors</h1>
               <p>Descriptive SEV levels across subgroups and years.</p>
            </div>

            <div className="row g-3">

               {/* Left filter sidebar */}
               <div className="col-xl-2 col-lg-3">
                  <div className="lp-sidebar-card">
                     <span className="filter-label">Countries</span>
                     <CountryFilter
                        selectedCountries_lst={selectedCountries_lst}
                        set_selectedCountries={set_selectedCountries}
                     />
                  </div>
                  <div className="lp-sidebar-card">
                     <span className="filter-label">Year range</span>
                     <YearFilter
                        minYear_int={minYear_int}
                        set_minYear={set_minYear}
                        maxYear_int={maxYear_int}
                        set_maxYear={set_maxYear}
                     />
                  </div>
                  <div className="lp-sidebar-card">
                     <FactorFilter
                        selectedFactor_str={selectedFactor_str}
                        set_selectedFactor={set_selectedFactor}
                     />
                  </div>
               </div>

               {/* Center: chart iframe */}
               <div className="col-xl-8 col-lg-6">
                  <div className="lp-iframe-wrapper">
                     {iframeLoading && (
                        <div className="lp-iframe-loading">
                           <div className="spinner" aria-label="Loading chart" />
                           <span>Loading chart…</span>
                        </div>
                     )}
                     <iframe
                        id="embeddedPanel_id"
                        className="lp-iframe"
                        src={iFrame_url}
                        title="Lifestyle Risk Factors chart"
                        onLoad={() => setIframeLoading(false)}
                     />
                  </div>
                  <div className="mt-3">
                     <SaveGraphButton iframeUrl={{ url: iFrame_url }} />
                  </div>
               </div>

               {/* Right: glossary */}
               <div className="col-xl-2 col-lg-3">
                  <Glossary />
               </div>

            </div>
         </div>
      </>
   );
};

export default LifestylePanel;

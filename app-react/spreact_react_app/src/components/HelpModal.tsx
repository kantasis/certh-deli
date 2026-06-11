import React, { useState, useEffect, useRef, useCallback } from "react";

interface HelpModalProps {
   open: boolean;
   onClose: () => void;
}

interface Page {
   icon: React.ReactNode;
   title: string;
   subtitle: string;
   preview?: React.ReactNode;
   items: { heading: string; body: string }[];
}

const BRAND = "#185569";
const BRAND_MID = "#1a6e8c";

// ── Page header icons (white stroke) ─────────────────────────────────────────

const IconWelcome = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
   </svg>
);
const IconChart = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      <line x1="2" y1="20" x2="22" y2="20"/>
   </svg>
);
const IconTrend = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
   </svg>
);
const IconTarget = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
   </svg>
);
const IconBookmark = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
   </svg>
);
const IconUsers = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
   </svg>
);
const IconFlask = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 3h6"/><path d="M9 3v6L5.5 15A5 5 0 0 0 19 15L14 9V3"/>
      <line x1="6" y1="14" x2="18" y2="14"/>
   </svg>
);

// ── Window chrome wrapper ─────────────────────────────────────────────────────

const PreviewFrame: React.FC<{ children: React.ReactNode; label: string }> = ({ children, label }) => (
   <div style={{ marginBottom: "16px", border: "1px solid #e2e8f0", borderRadius: "10px", overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
      <div style={{ height: "26px", background: "#f1f5f9", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px" }}>
         <div style={{ display: "flex", gap: "5px" }}>
            {["#f87171", "#fbbf24", "#4ade80"].map((c) => <div key={c} style={{ width: 7, height: 7, borderRadius: "50%", background: c }}/>)}
         </div>
         <span style={{ fontSize: "9px", fontFamily: "system-ui,sans-serif", color: "#94a3b8", letterSpacing: "0.04em" }}>{label}</span>
         <div style={{ width: 36 }}/>
      </div>
      {children}
   </div>
);

// ── Chart 1: CRC Incidence (line chart) ──────────────────────────────────────

const ChartIncidence = () => {
   const xs = [36, 82, 129, 175, 221, 267, 313, 360, 406, 452];
   const bYs = [59, 59, 59, 61, 63, 65, 65, 67, 69, 69];
   const iYs = [75, 59, 42, 32, 28, 32, 36, 42, 48, 55];
   const gYs = [126, 118, 110, 99, 95, 95, 99, 99, 99, 95];
   const pts = (ys: number[]) => xs.map((x, i) => `${x},${ys[i]}`).join(" ");
   const grid: [number, string][] = [[106,"30"],[87,"35"],[67,"40"],[48,"45"],[28,"50"]];
   return (
      <svg width="100%" viewBox="0 0 460 150" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", background: "#fafafa" }}>
         <text x="38" y="13" fontFamily="system-ui,sans-serif" fontSize="9" fontWeight="700" fill="#1e293b">Age-Standardised CRC Incidence (per 100,000)</text>
         {([["#6472c5","Belgium"],["#f59e0b","Italy"],["#34d399","Greece"]] as [string,string][]).map(([c,l], i) => (
            <g key={l}>
               <line x1={286+i*52} y1={10} x2={296+i*52} y2={10} stroke={c} strokeWidth="2"/>
               <circle cx={291+i*52} cy={10} r="2.5" fill={c}/>
               <text x={299+i*52} y={13} fontFamily="system-ui,sans-serif" fontSize="8" fill="#475569">{l}</text>
            </g>
         ))}
         {grid.map(([y, lbl]) => (
            <g key={lbl}>
               <line x1="36" y1={y} x2="452" y2={y} stroke="#e5e7eb" strokeWidth="0.6"/>
               <text x="33" y={y+3} fontFamily="system-ui,sans-serif" fontSize="7.5" fill="#94a3b8" textAnchor="end">{lbl}</text>
            </g>
         ))}
         <line x1="36" y1="20" x2="36" y2="130" stroke="#e5e7eb" strokeWidth="0.8"/>
         <line x1="36" y1="130" x2="452" y2="130" stroke="#94a3b8" strokeWidth="0.8"/>
         {([[36,"1990"],[175,"2000"],[313,"2010"],[452,"2021"]] as [number,string][]).map(([x,l]) => (
            <text key={l} x={x} y="141" fontFamily="system-ui,sans-serif" fontSize="7.5" fill="#94a3b8" textAnchor="middle">{l}</text>
         ))}
         <polyline points={pts(bYs)} fill="none" stroke="#6472c5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
         {xs.map((x,i) => <circle key={i} cx={x} cy={bYs[i]} r="2.2" fill="#6472c5"/>)}
         <polyline points={pts(iYs)} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
         {xs.map((x,i) => <circle key={i} cx={x} cy={iYs[i]} r="2.2" fill="#f59e0b"/>)}
         <polyline points={pts(gYs)} fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
         {xs.map((x,i) => <circle key={i} cx={x} cy={gYs[i]} r="2.2" fill="#34d399"/>)}
      </svg>
   );
};

// ── Chart 2: Forecasting (historical + projected dashed) ─────────────────────

const ChartForecasting = () => {
   // Historical: 9 points, 1990-2021, ending at x=390
   const hxs = [36, 79, 122, 165, 208, 251, 294, 337, 390];
   const bHist = [59, 59, 59, 61, 63, 65, 65, 67, 69];  // Belgium
   const gHist = [126, 118, 110, 99, 95, 95, 99, 99, 99]; // Greece
   // Projected: 3 points, 2022-2028
   const pxs  = [390, 415, 435, 455];
   const bProj = [69, 71, 72, 74];
   const gProj = [99, 96, 94, 92];
   const hPts = (ys: number[]) => hxs.map((x, i) => `${x},${ys[i]}`).join(" ");
   const pPts = (ys: number[]) => pxs.map((x, i) => `${x},${ys[i]}`).join(" ");
   const grid: [number, string][] = [[106,"30"],[87,"35"],[67,"40"],[48,"45"],[28,"50"]];
   return (
      <svg width="100%" viewBox="0 0 460 150" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", background: "#fafafa" }}>
         {/* Projected zone shading */}
         <rect x="390" y="20" width="70" height="110" fill="rgba(24,85,105,0.05)" rx="0"/>
         <text x="422" y="28" fontFamily="system-ui,sans-serif" fontSize="7.5" fill={BRAND} textAnchor="middle" fontStyle="italic">forecast →</text>
         {/* Boundary line */}
         <line x1="390" y1="20" x2="390" y2="130" stroke="#94a3b8" strokeWidth="0.8" strokeDasharray="3,2"/>
         <text x="390" y="141" fontFamily="system-ui,sans-serif" fontSize="7.5" fill="#94a3b8" textAnchor="middle">2021</text>

         <text x="38" y="13" fontFamily="system-ui,sans-serif" fontSize="9" fontWeight="700" fill="#1e293b">CRC Incidence Forecasting — Belgium &amp; Greece</text>
         {/* Legend */}
         <line x1="330" y1="10" x2="340" y2="10" stroke="#6472c5" strokeWidth="2"/>
         <circle cx="335" cy="10" r="2.5" fill="#6472c5"/>
         <text x="343" y="13" fontFamily="system-ui,sans-serif" fontSize="8" fill="#475569">Belgium</text>
         <line x1="393" y1="10" x2="403" y2="10" stroke="#34d399" strokeWidth="2"/>
         <circle cx="398" cy="10" r="2.5" fill="#34d399"/>
         <text x="406" y="13" fontFamily="system-ui,sans-serif" fontSize="8" fill="#475569">Greece</text>

         {grid.map(([y, lbl]) => (
            <g key={lbl}>
               <line x1="36" y1={y} x2="460" y2={y} stroke="#e5e7eb" strokeWidth="0.6"/>
               <text x="33" y={y+3} fontFamily="system-ui,sans-serif" fontSize="7.5" fill="#94a3b8" textAnchor="end">{lbl}</text>
            </g>
         ))}
         <line x1="36" y1="20" x2="36" y2="130" stroke="#e5e7eb" strokeWidth="0.8"/>
         <line x1="36" y1="130" x2="460" y2="130" stroke="#94a3b8" strokeWidth="0.8"/>
         {([[36,"1990"],[165,"2005"],[337,"2018"],[455,"2028"]] as [number,string][]).map(([x,l]) => (
            <text key={l} x={x} y="141" fontFamily="system-ui,sans-serif" fontSize="7.5" fill="#94a3b8" textAnchor="middle">{l}</text>
         ))}
         {/* Belgium historical */}
         <polyline points={hPts(bHist)} fill="none" stroke="#6472c5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
         {hxs.map((x,i) => <circle key={i} cx={x} cy={bHist[i]} r="2.2" fill="#6472c5"/>)}
         {/* Belgium projected */}
         <polyline points={pPts(bProj)} fill="none" stroke="#6472c5" strokeWidth="1.8" strokeDasharray="4,3" strokeLinecap="round" strokeLinejoin="round"/>
         {pxs.slice(1).map((x,i) => <circle key={i} cx={x} cy={bProj[i+1]} r="2" fill="#fff" stroke="#6472c5" strokeWidth="1.5"/>)}
         {/* Greece historical */}
         <polyline points={hPts(gHist)} fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
         {hxs.map((x,i) => <circle key={i} cx={x} cy={gHist[i]} r="2.2" fill="#34d399"/>)}
         {/* Greece projected */}
         <polyline points={pPts(gProj)} fill="none" stroke="#34d399" strokeWidth="1.8" strokeDasharray="4,3" strokeLinecap="round" strokeLinejoin="round"/>
         {pxs.slice(1).map((x,i) => <circle key={i} cx={x} cy={gProj[i+1]} r="2" fill="#fff" stroke="#34d399" strokeWidth="1.5"/>)}
      </svg>
   );
};

// ── Chart 3: Top Risk Factors with Confidence Intervals ─────────────────────

const ChartPredictive = () => {
   const chartL = 44, chartR = 455, chartT = 30, chartB = 130;
   const chartH = chartB - chartT;
   const yMax = 1.5;
   const yCoord = (v: number) => chartB - (v / yMax) * chartH;
   const slot = 51, barW = 32, barOffset = 9.5;
   const BAR_FILL = "#7EB6DE";
   const CI_COL = "#1e3799";
   const CAP = 5;

   const bars = [
      { label: "Alcohol Use",    val: 0.72, ciLow: 0.60, ciHigh: 0.85 },
      { label: "Low Calcium",    val: 0.67, ciLow: 0.08, ciHigh: 1.22 },
      { label: "Low Phys. Act.", val: 0.50, ciLow: 0.30, ciHigh: 0.87 },
      { label: "High BMI",       val: 0.47, ciLow: 0.38, ciHigh: 0.60 },
      { label: "Trans Fats",     val: 0.38, ciLow: 0.33, ciHigh: 0.50 },
      { label: "Red Meat",       val: 0.33, ciLow: 0.25, ciHigh: 0.40 },
      { label: "Low Fiber",      val: 0.28, ciLow: 0.20, ciHigh: 0.35 },
      { label: "Omega-3 FA",     val: 0.10, ciLow: 0.04, ciHigh: 0.18 },
   ];
   const gridVals: [number, string][] = [[1.5,"1.5"],[1.2,"1.2"],[0.9,"0.9"],[0.6,"0.6"],[0.3,"0.3"],[0,"0"]];

   return (
      <svg width="100%" viewBox="0 0 460 185" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", background: "#fafafa" }}>
         {/* Title */}
         <text x="230" y="12" fontFamily="system-ui,sans-serif" fontSize="8.5" fontWeight="700" fill="#1e293b" textAnchor="middle">
            Top Risk Factors by Strength of Association – 5 Years Ahead
         </text>
         {/* Legend */}
         <rect x="138" y="18" width="10" height="7" fill={BAR_FILL} rx="1"/>
         <text x="151" y="24" fontFamily="system-ui,sans-serif" fontSize="7.5" fill="#475569">Coefficient</text>
         <line x1="225" y1="21.5" x2="235" y2="21.5" stroke={CI_COL} strokeWidth="1.4"/>
         <line x1="230" y1="18.5" x2="230" y2="24.5" stroke={CI_COL} strokeWidth="1.4"/>
         <text x="238" y="24" fontFamily="system-ui,sans-serif" fontSize="7.5" fill="#475569">Confidence Intervals (95%)</text>
         {/* Y-axis rotated label */}
         <text transform="rotate(-90,9,80)" x="9" y="80" fontFamily="system-ui,sans-serif" fontSize="6" fill="#64748b" textAnchor="middle">CRC Cases Averted per 1 SEV Unit</text>
         {/* Grid + Y tick labels */}
         {gridVals.map(([v, lbl]) => {
            const y = yCoord(v);
            return (
               <g key={lbl}>
                  <line x1={chartL} y1={y} x2={chartR} y2={y} stroke="#e5e7eb" strokeWidth="0.6"/>
                  <text x={chartL-3} y={y+3} fontFamily="system-ui,sans-serif" fontSize="7.5" fill="#94a3b8" textAnchor="end">{lbl}</text>
               </g>
            );
         })}
         {/* Axes */}
         <line x1={chartL} y1={chartT} x2={chartL} y2={chartB} stroke="#cbd5e1" strokeWidth="0.8"/>
         <line x1={chartL} y1={chartB} x2={chartR} y2={chartB} stroke="#94a3b8" strokeWidth="0.8"/>
         {/* Bars + CI error bars + rotated labels */}
         {bars.map((b, i) => {
            const bx = chartL + i * slot + barOffset;
            const cx = bx + barW / 2;
            const by = yCoord(b.val);
            const ciHy = yCoord(b.ciHigh);
            const ciLy = yCoord(b.ciLow);
            return (
               <g key={b.label}>
                  <rect x={bx} y={by} width={barW} height={chartB - by} fill={BAR_FILL} rx="1.5" opacity="0.88"/>
                  <line x1={cx} y1={ciHy} x2={cx} y2={ciLy} stroke={CI_COL} strokeWidth="1.3"/>
                  <line x1={cx-CAP} y1={ciHy} x2={cx+CAP} y2={ciHy} stroke={CI_COL} strokeWidth="1.3"/>
                  <line x1={cx-CAP} y1={ciLy} x2={cx+CAP} y2={ciLy} stroke={CI_COL} strokeWidth="1.3"/>
                  <text x={cx} y={chartB+5} transform={`rotate(-45,${cx},${chartB+5})`} textAnchor="end" fontFamily="system-ui,sans-serif" fontSize="7" fill="#475569">
                     {b.label}
                  </text>
               </g>
            );
         })}
      </svg>
   );
};

// ── Mock: Save Graph dialog ───────────────────────────────────────────────────

const MockSaveGraph = () => (
   <div style={{ padding: "14px 16px", background: "#f8fafc", display: "flex", flexDirection: "column", gap: "10px" }}>
      {/* Dialog card */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "14px 16px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
         <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke={BRAND} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
               <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#0f172a" }}>Save this graph</span>
         </div>
         {/* Chart preview strip */}
         <div style={{ background: "#f1f5f9", borderRadius: "6px", padding: "7px 10px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke={BRAND} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
               <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
               <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
            </svg>
            <span style={{ fontSize: "11px", color: "#475569" }}>CRC Incidence — Greece, Belgium · 2010–2021 · Female</span>
         </div>
         {/* Name field */}
         <div style={{ marginBottom: "12px" }}>
            <div style={{ fontSize: "10.5px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>Name</div>
            <div style={{ background: "#fff", border: `1.5px solid ${BRAND}`, borderRadius: "7px", padding: "7px 10px", fontSize: "12px", color: "#0f172a", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
               <span>CRC Incidence – Greece &amp; Belgium</span>
               <span style={{ width: 1.5, height: 13, background: BRAND, display: "inline-block" }}/>
            </div>
         </div>
         {/* Buttons */}
         <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <div style={{ padding: "6px 14px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "7px", fontSize: "11.5px", fontWeight: 600, color: "#475569", cursor: "default" }}>Cancel</div>
            <div style={{ padding: "6px 14px", background: BRAND, borderRadius: "7px", fontSize: "11.5px", fontWeight: 600, color: "#fff", cursor: "default", boxShadow: "0 2px 6px rgba(24,85,105,0.3)" }}>Save Graph</div>
         </div>
      </div>
   </div>
);

// ── Mock: Comment form ────────────────────────────────────────────────────────

const MockCommentForm = () => (
   <div style={{ padding: "14px 16px", background: "#f8fafc", display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>Add a comment</div>
      {/* Textarea */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "10px 12px", minHeight: "58px" }}>
         <span style={{ fontSize: "12px", color: "#94a3b8" }}>Share your observation about this data...</span>
      </div>
      {/* Submit */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
         <div style={{ padding: "7px 16px", background: BRAND, borderRadius: "7px", fontSize: "11.5px", fontWeight: 600, color: "#fff", cursor: "default", boxShadow: "0 2px 6px rgba(24,85,105,0.3)" }}>Submit</div>
      </div>
   </div>
);

// ── Page data ─────────────────────────────────────────────────────────────────

const PAGES: Page[] = [
   {
      icon: <IconWelcome />,
      title: "Welcome to ONCODIR DELI",
      subtitle: "A data-driven platform for CRC prevention analytics across the EU",
      items: [
         { heading: "What is DELI?", body: "DELI (Data-driven Evidence for CRC prevention and early detection) provides epidemiological data, risk factor analysis, and predictive tools for colorectal cancer across EU member states." },
         { heading: "How to navigate", body: "Use the top navigation bar to access the different analysis modules. Use the arrow buttons below to continue reading this guide." },
      ],
   },
   {
      icon: <IconChart />,
      title: "Descriptive Analytics",
      subtitle: "Explore CRC burden, risk factors, and prevention policies across Europe",
      preview: <PreviewFrame label="CRC Incidence"><ChartIncidence /></PreviewFrame>,
      items: [
         { heading: "CRC Incidence", body: "View incidence rates, DALYs, YLLs, and YLDs by country, year range, sex, and age group. Use the filter panel on the left to customise the chart." },
         { heading: "CRC Risk Factors", body: "Explore Summary Exposure Values (SEV) for 22 risk factors — covering diet, lifestyle, comorbidities, and socioeconomic factors — across countries and demographic groups." },
         { heading: "CRC Policy Data", body: "Browse an interactive EU map showing which countries have adopted specific CRC prevention policies. Click a country on the map to see its policies and best practices." },
         { heading: "Applying filters", body: "Each page has a dedicated filter sidebar. Select your parameters and the chart updates automatically. Filters include countries, year range, sex, age group, and metric type." },
      ],
   },
   {
      icon: <IconTrend />,
      title: "Trend & Association Analysis",
      subtitle: "Understand how CRC and risk factors have evolved and interact over time",
      preview: <PreviewFrame label="Forecasting CRC"><ChartForecasting /></PreviewFrame>,
      items: [
         { heading: "Trend Analysis", body: "Visualise long-term CRC incidence trajectories broken down by country, sex, and age group. Identify rising or declining trends across demographic subgroups." },
         { heading: "Association Analysis", body: "Examine statistical associations between CRC incidence and risk factor SEV levels. Understand which factors correlate most strongly with CRC burden." },
         { heading: "Trend Correlation", body: "Compare how CRC trends and SEV trends move together over time, revealing which risk factor trends track most closely with changes in CRC rates." },
         { heading: "Forecasting CRC", body: "View short-term extrapolations of CRC incidence based on historical data. Projections are generated per country and subgroup to support planning decisions." },
      ],
   },
   {
      icon: <IconTarget />,
      title: "Predictive Analytics",
      subtitle: "Model the impact of interventions on CRC incidence across populations",
      preview: <PreviewFrame label="Predictive Analytics · Effect per SEV Unit"><ChartPredictive /></PreviewFrame>,
      items: [
         { heading: "Effect per SEV Unit & Exposure-Weighted", body: "See which risk factors have the strongest association with CRC per unit of SEV change, and which factors matter most when weighted by actual population exposure levels." },
         { heading: "Quick Wins", body: "Highlights risk factors where a realistic reduction in exposure could have a meaningful impact on CRC incidence — useful for prioritising prevention efforts." },
         { heading: "Single-Factor Exploration", body: "Run What-If scenarios by adjusting one risk factor at a time. Choose between intervention-driven (adjusting SEV by a set amount) or target-driven (setting a CRC reduction goal)." },
         { heading: "Two-Factor Exploration", body: "Combine two risk factors in a joint What-If scenario to explore interaction effects and combined impact on projected CRC incidence." },
      ],
   },
   {
      icon: <IconFlask />,
      title: "Pilot Studies",
      subtitle: "Real-world validation of DELI analytics across selected EU pilot sites",
      items: [
         { heading: "What are Pilot Studies?", body: "Pilot Studies present the results of applying the DELI platform in selected EU countries. They validate the platform's analytics against real clinical and epidemiological data collected at each site." },
         { heading: "Study Design", body: "Each pilot follows a standardised protocol covering data collection, CRC incidence tracking, and risk factor assessment. This ensures results are comparable across different national health systems." },
         { heading: "Key Findings", body: "Explore country-specific outcomes including the most impactful modifiable risk factors identified, projected CRC burden reductions from targeted interventions, and alignment with GBD 2021 estimates." },
         { heading: "How to use the results", body: "Pilot findings can inform national prevention strategies. Use the Predictive Analytics module to model interventions based on the risk factor profiles observed in each pilot country." },
      ],
   },
   {
      icon: <IconBookmark />,
      title: "Saving Graphs & My Dashboards",
      subtitle: "Save and revisit your custom analysis views at any time",
      preview: <PreviewFrame label="Save Graph"><MockSaveGraph /></PreviewFrame>,
      items: [
         { heading: "Save Graph button", body: "Every chart page has a Save Graph button below the chart. Clicking it saves your current filter configuration and view as a named entry in My Dashboards." },
         { heading: "Accessing My Dashboards", body: "Open the Profile menu in the top-right corner and select My Dashboards. From there you can click any saved view to reload it instantly with all filters restored." },
         { heading: "Managing saved views", body: "From the My Dashboards page you can rename or delete saved views. Each entry shows the page it was saved from and the filters that were active at the time." },
      ],
   },
   {
      icon: <IconUsers />,
      title: "Comments & Collaboration",
      subtitle: "Share observations and collaborate with your team directly on the platform",
      preview: <PreviewFrame label="Comments"><MockCommentForm /></PreviewFrame>,
      items: [
         { heading: "Leaving a comment", body: "A Comments section is available at the right side of every analysis page. Type your observation, select a sentiment, and submit it to share your insight with the team." },
         { heading: "Moderation", body: "Comments are reviewed by platform moderators. Moderators can approve, hide, or remove comments from the Admin Panel to maintain quality and relevance." },
         { heading: "Admin Panel", body: "Users with admin and moderator roles can access the Admin Panel (via the Profile menu) to manage users, review pending registrations, view the audit log, and moderate comments." },
      ],
   },
];

// ── Bullet check icon ─────────────────────────────────────────────────────────

const Check = () => (
   <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
   </svg>
);

// ── Main component ────────────────────────────────────────────────────────────

const HelpModal: React.FC<HelpModalProps> = ({ open, onClose }) => {
   const [page, setPage] = useState(0);
   const [atBottom, setAtBottom] = useState(false);
   const scrollRef = useRef<HTMLDivElement>(null);
   const total = PAGES.length;

   const checkBottom = useCallback(() => {
      const el = scrollRef.current;
      if (!el) return;
      setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 4);
   }, []);

   useEffect(() => {
      if (open) { setPage(0); setAtBottom(false); }
   }, [open]);

   useEffect(() => {
      const el = scrollRef.current;
      if (!el) return;
      el.scrollTop = 0;
      setAtBottom(false);
      // After content renders, check if page is short enough to already be at bottom
      requestAnimationFrame(checkBottom);
   }, [page, checkBottom]);

   useEffect(() => {
      if (!open) return;
      const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
   }, [open, onClose]);

   if (!open) return null;

   const current = PAGES[page];
   const progress = ((page + 1) / total) * 100;

   return (
      <>
         <style>{`
            @keyframes hm-in {
               from { opacity: 0; transform: scale(0.96) translateY(8px); }
               to   { opacity: 1; transform: scale(1) translateY(0); }
            }
            .hm-card { animation: hm-in 0.22s ease both; }
            .hm-item:hover { background: #f0f7fa !important; border-color: ${BRAND} !important; }
            .hm-body { scrollbar-width: thin; scrollbar-color: ${BRAND} #e2e8f0; }
            .hm-body::-webkit-scrollbar { width: 7px; }
            .hm-body::-webkit-scrollbar-track { background: #e2e8f0; border-radius: 999px; margin: 8px 0; }
            .hm-body::-webkit-scrollbar-thumb { background: ${BRAND}; border-radius: 999px; }
            .hm-body::-webkit-scrollbar-thumb:hover { background: ${BRAND_MID}; }
         `}</style>

         {/* Backdrop */}
         <div onClick={onClose} aria-hidden="true" style={{ position: "fixed", inset: 0, background: "rgba(10,20,35,0.55)", backdropFilter: "blur(4px)", zIndex: 10000 }}/>

         {/* Centering shell */}
         <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10001, padding: "16px", pointerEvents: "none" }}>
            <div className="hm-card" role="dialog" aria-modal="true" aria-label="Platform help guide"
               style={{ background: "#fff", borderRadius: "20px", boxShadow: "0 32px 80px rgba(0,0,0,0.22)", width: "100%", maxWidth: "560px", maxHeight: "90vh", display: "flex", flexDirection: "column", overflow: "hidden", pointerEvents: "auto" }}
            >

               {/* ── Gradient header ── */}
               <div style={{ background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_MID} 100%)`, padding: "26px 24px 22px", position: "relative", overflow: "hidden", flexShrink: 0 }}>
                  {/* Decorative blobs */}
                  <div aria-hidden="true" style={{ position: "absolute", top: "-32px", right: "-32px", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(255,255,255,0.07)", pointerEvents: "none" }}/>
                  <div aria-hidden="true" style={{ position: "absolute", bottom: "-20px", right: "60px", width: "90px", height: "90px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }}/>

                  {/* Close button */}
                  <button onClick={onClose} aria-label="Close help guide"
                     style={{ position: "absolute", top: "14px", right: "14px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", padding: "5px", cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", transition: "background 0.15s" }}
                     onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
                     onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                     </svg>
                  </button>

                  {/* ── Centered header content ── */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

                     {/* Counter pill */}
                     <div style={{ display: "inline-flex", alignItems: "center", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: "999px", padding: "3px 10px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.07em", color: "rgba(255,255,255,0.85)", marginBottom: "18px", textTransform: "uppercase" }}>
                        {page + 1} &nbsp;/&nbsp; {total}
                     </div>

                     {/* Icon + Title on same row */}
                     <div style={{ display: "flex", alignItems: "center", gap: "13px", marginBottom: "10px" }}>
                        <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.28)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                           {current.icon}
                        </div>
                        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#fff", lineHeight: 1.25 }}>
                           {current.title}
                        </h2>
                     </div>

                     {/* Subtitle — centered */}
                     <p style={{ margin: 0, fontSize: "13px", color: "rgba(255,255,255,0.72)", lineHeight: 1.55, textAlign: "center", maxWidth: "420px" }}>
                        {current.subtitle}
                     </p>

                  </div>

                  {/* Progress bar */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", background: "rgba(255,255,255,0.18)" }}>
                     <div style={{ height: "100%", width: `${progress}%`, background: "rgba(255,255,255,0.75)", borderRadius: "0 2px 2px 0", transition: "width 0.3s ease" }}/>
                  </div>
               </div>

               {/* ── Scrollable body ── */}
               <div style={{ position: "relative", flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
               <div ref={scrollRef} className="hm-body" onScroll={checkBottom} style={{ padding: "20px 20px 8px", overflowY: "scroll", flex: 1 }}>
                  {current.preview}
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                     {current.items.map((item, i) => (
                        <li key={i} className="hm-item" style={{ display: "flex", gap: "12px", alignItems: "flex-start", background: "#f8fafc", border: "1px solid #e5e7eb", borderLeft: `3px solid ${BRAND}`, borderRadius: "10px", padding: "13px 15px", transition: "background 0.15s, border-color 0.15s", cursor: "default" }}>
                           <div style={{ width: "22px", height: "22px", borderRadius: "6px", background: BRAND, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
                              <Check />
                           </div>
                           <div>
                              <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#0f172a", marginBottom: "3px", lineHeight: 1.3 }}>{item.heading}</div>
                              <div style={{ fontSize: "13px", color: "#475569", lineHeight: 1.6 }}>{item.body}</div>
                           </div>
                        </li>
                     ))}
                  </ul>
               </div>
               {/* Bottom fade — scroll hint, hidden when scrolled to bottom */}
               {!atBottom && <div aria-hidden="true" style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "48px", background: "linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)", pointerEvents: "none" }}/>}
               </div>

               {/* ── Footer ── */}
               <div style={{ padding: "14px 20px 18px", borderTop: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                  <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} aria-label="Previous page"
                     style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 16px", background: page === 0 ? "#f8fafc" : "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: page === 0 ? "#94a3b8" : "#0f172a", cursor: page === 0 ? "default" : "pointer", transition: "background 0.15s" }}
                     onMouseEnter={(e) => { if (page !== 0) e.currentTarget.style.background = "#f1f5f9"; }}
                     onMouseLeave={(e) => { e.currentTarget.style.background = page === 0 ? "#f8fafc" : "#fff"; }}
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
                     Previous
                  </button>

                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                     {PAGES.map((_, i) => (
                        <button key={i} onClick={() => setPage(i)} aria-label={`Go to page ${i + 1}`} aria-current={i === page ? "true" : undefined}
                           style={{ width: i === page ? "22px" : "8px", height: "8px", borderRadius: "999px", background: i === page ? BRAND : "#cbd5e1", border: "none", padding: 0, cursor: "pointer", transition: "width 0.22s ease, background 0.22s ease" }}
                        />
                     ))}
                  </div>

                  <button onClick={() => page === total - 1 ? onClose() : setPage((p) => p + 1)} aria-label={page === total - 1 ? "Close guide" : "Next page"}
                     style={{ display: "flex", alignItems: "center", gap: "5px", padding: "8px 18px", background: BRAND, border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "#fff", cursor: "pointer", transition: "opacity 0.15s", boxShadow: "0 2px 8px rgba(24,85,105,0.35)" }}
                     onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                     onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  >
                     {page === total - 1 ? "Done" : "Next"}
                     {page < total - 1 && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
                     )}
                  </button>
               </div>

            </div>
         </div>
      </>
   );
};

export default HelpModal;

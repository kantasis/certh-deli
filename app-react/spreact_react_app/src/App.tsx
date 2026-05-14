import React, { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./index.css";

import NavbarMain from "./components/NavbarMain.js";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import Home from "./components/Home.jsx";
import Profile from "./components/Profile.jsx";
import Dashboard from "./components/Dashboard.jsx";
import EpidimiologicalPanel from "./components/EpidimiologicalPanel.tsx";
import NutritionPanel from "./components/NutritionPanel.tsx";
import LifestylePanel from "./components/LifestylePanel.tsx";
import PolicyPanel from "./components/PolicyPanel.tsx";
import Analytics from "./components/Analytics.tsx";
import RiskFactorExposurePanel from "./components/RiskFactorExposurePanel.tsx"
import CRCmortalityPanel from "./components/CRCmortalityPanel.tsx"
import ScreeningRiskFactorDataPanel from "./components/ScreeningRiskFactorDataPanel.tsx"
import CrcIncidenceDataPanel from "./components/CrcIncidenceDataPanel.tsx"
import PreviousComments from "./components/PreviousComments.tsx"
import PasswordReset from "./components/PasswordReset.tsx";
import LIT03 from "./components/Lit03.tsx"
import LIP2 from "./components/LIP2.tsx"
import TrendAnalysis from "./components/TrendAnalysis.tsx"
import MyDashboards from "./components/MyDashboards.tsx"
import DeliPredictions from "./components/DeliPredictions.tsx"
import TwoFactorHeatmapViewer from "./components/TwoFactorExloration.tsx"
import LargeScaleIntervention from "./components/LargeScaleInterventionLIP2.tsx"
import AdminUsers from "./components/AdminUsers.tsx";

const App: React.FC = () => {
   return (<>

      <div className="gk_flexContainer">
         <div className="gk_header">
            <NavbarMain />
         </div>

         <div className="container-fluid gk_content">
            <Routes>
               <Route path="/" element={<Home />} />
               <Route path="/home" element={<Home />} />
               <Route path="/login" element={<Login />} />
               <Route path="/register" element={<Register />} />
               <Route path="/profile" element={<Profile />} />
               <Route path="/crc-incidence" element={<EpidimiologicalPanel />} />
               <Route path="/crc-risk-factors" element={<RiskFactorExposurePanel />} />
               <Route path="/change-password" element={<PasswordReset />} />
               {/* <Route path="/CRCmortalityPanel" element={< CRCmortalityPanel />} />
               <Route path="/ScreeningRiskFactorDataPanel" element={< ScreeningRiskFactorDataPanel />} />
              <Route path="/CrcIncidenceDataPanel" element={< CrcIncidenceDataPanel />} />  */}
               <Route path="/LIT03" element={< LIT03 />} />
               <Route path="/crc-trend-and-association-analysis" element={< TrendAnalysis />} />
               <Route path="/comments" element={< PreviousComments />} />
               <Route path="/lip2-aggregation-analysis" element={<LIP2 />} />
               <Route path="/lip2-population-groups" element={<LIP2 />} />
               {/* <Route path="/nutritionPanel" element={<NutritionPanel />} />
               <Route path="/lifestylePanel" element={<LifestylePanel />} /> */}
               <Route path="/crc-policy-data" element={<PolicyPanel />} />
               <Route path="/crc-predictive-analytics" element={<DeliPredictions />} />
               <Route path="/two-factor-exploration" element={<TwoFactorHeatmapViewer />} />
                <Route path="/large-scale-intervention" element={<LargeScaleIntervention />} />
               {/* <Route path="/deli-predictions" element={<DeliPredictions />} /> */}
               <Route path="/my-dashboards" element={<MyDashboards />} />
               <Route path="/admin/users" element={<AdminUsers />} />
            </Routes>
         </div>

         <footer className="gk_footer">
            <div className="gk_footer-inner">
               <img src="EU-Funding-Logo.png" alt="Co-funded by the European Union" className="gk_footer-logo" />
               <p className="gk_footer-copy">
                  © {new Date().getFullYear()} ONCODIR · All rights reserved
               </p>
            </div>
         </footer>
      </div>
   </>);
};

export default App;

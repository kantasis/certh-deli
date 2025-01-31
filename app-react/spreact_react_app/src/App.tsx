import React, { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./index.css";

import NavbarMain from "./components/NavbarMain.js";
import Login from "./components/Login.jsx";
// import Register from "./components/Register.jsx";
import Home from "./components/Home.jsx";
import Profile from "./components/Profile.jsx";
import Dashboard from "./components/Dashboard.jsx";
import EpidimiologicalPanel from "./components/EpidimiologicalPanel.tsx";
import NutritionPanel from "./components/NutritionPanel.tsx";
import LifestylePanel from "./components/LifestylePanel.tsx";
import PolicyPanel from "./components/PolicyPanel.tsx";
import Analytics from "./components/Analytics.tsx";
import RiskFactorExposurePanel from "./components/RiskFactorExposurePanel.tsx"

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
               {/* <Route   path="/register"  element={<Register />}        /> */}
               <Route path="/profile" element={<Profile />} />
               <Route path="/epidimiologicalPanel" element={<EpidimiologicalPanel />} />
               <Route path="/riskFactorExposurePanel" element={<RiskFactorExposurePanel />} />
               {/* <Route path="/nutritionPanel" element={<NutritionPanel />} />
               <Route path="/lifestylePanel" element={<LifestylePanel />} /> */}
               <Route path="/policyPanel" element={<PolicyPanel />} />
               <Route path="/analytics" element={<Analytics />} />
            </Routes>
         </div>

         <div className="gk_footer">
            <img src='EU-Funding-Logo.png' />
         </div>
      </div>
   </>);
};

export default App;

import React, { useState, useEffect } from "react";
import { Routes, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Login from "./components/Login.jsx";
// import Register from "./components/Register.jsx";
import Home from "./components/Home.jsx";
import Profile from "./components/Profile.jsx";
import Dashboard from "./components/Dashboard.jsx";
import EpidimiologicalPanel from "./components/EpidimiologicalPanel.tsx";
import NutritionPanel from "./components/NutritionPanel.tsx";
import NavbarMain from "./components/NavbarMain.js";

// import * as AuthService from "./services/auth.service";
// import AuthVerify from "./common/AuthVerify";

const App: React.FC = () => {
   return (<>
      <div className="container mt-3">
         <NavbarMain/>
         <Routes>
            <Route   path="/"        element={<Home />}            />
            <Route   path="/home"    element={<Home />}            />
            <Route   path="/login"     element={<Login />}           />
            {/* <Route   path="/register"  element={<Register />}        /> */}
            <Route   path="/profile"   element={<Profile />}         />
            <Route   path="/epidimiologicalPanel"      element={<EpidimiologicalPanel />}       />
            <Route   path="/nutritionPanel"      element={<NutritionPanel />}       />
         </Routes>
      </div>
   </>);
};

export default App;

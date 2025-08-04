import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import CSVTable from "./CSVTable";
import LandingPage from "./LandingPage";
import { BUILD_DATE } from "../build-info";

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="w-full px-3 sm:px-4 py-4 font-mono text-gray-100">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/:year/:filename" element={<CSVTable />} />
        </Routes>
        <div className="text-gray-300">Zuletzt aktualisiert: {BUILD_DATE}</div>
      </div>
    </HashRouter>
  );
};

export default App;

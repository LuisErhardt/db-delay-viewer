import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import CSVTable from "./components/CSVTable";
import LandingPage from "./components/LandingPage";

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/:year/:filename" element={<CSVTable />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
